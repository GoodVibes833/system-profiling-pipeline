const express = require('express');
const cors = require('cors');
const { S3Client, ListBucketsCommand, PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { CostExplorerClient, GetCostAndUsageCommand } = require('@aws-sdk/client-cost-explorer');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'profiling-pipeline-bucket';
const AWS_REGION = process.env.AWS_REGION || 'us-east-2';
const SECRET_NAME = process.env.AWS_SECRET_NAME || 'profiling/db-credentials';
const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;

const sqsClient = new SQSClient({ region: AWS_REGION });

let dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'profiling_db'
};

async function loadSecretsFromAWS() {
    try {
        const client = new SecretsManagerClient({ region: AWS_REGION });
        const res = await client.send(new GetSecretValueCommand({ SecretId: SECRET_NAME }));
        const secret = JSON.parse(res.SecretString);
        dbConfig = {
            host: secret.DB_HOST || dbConfig.host,
            user: secret.DB_USER || dbConfig.user,
            password: secret.DB_PASSWORD || dbConfig.password,
            database: dbConfig.database
        };
        console.log('DB credentials loaded from Secrets Manager');
    } catch (e) {
        console.log('Secrets Manager unavailable, using .env fallback:', e.message);
    }
}

async function getDBConnection() {
    return mysql.createConnection({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
        connectTimeout: 5000
    });
}

async function initDB() {
    if (!dbConfig.host) return;
    try {
        const conn0 = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            connectTimeout: 5000
        });
        await conn0.execute('CREATE DATABASE IF NOT EXISTS profiling_db');
        await conn0.end();

        const conn = await getDBConnection();
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS metrics_snapshots (
                id INT AUTO_INCREMENT PRIMARY KEY,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                rps FLOAT DEFAULT 0,
                p99_latency FLOAT DEFAULT 0,
                p50_latency FLOAT DEFAULT 0,
                error_rate FLOAT DEFAULT 0,
                gpu1_temp FLOAT DEFAULT 0,
                gpu1_clock FLOAT DEFAULT 0,
                hbm_bandwidth FLOAT DEFAULT 0,
                ecc_errors INT DEFAULT 0
            )
        `);
        await conn.end();
        console.log('DB table metrics_snapshots ready');
    } catch (e) {
        console.error('DB init failed:', e.message);
    }
}

// --- Fault endpoints ---
const leakArray = [];

app.get('/fast', (req, res) => {
    res.send('This is fast!');
});

app.get('/cpu-heavy', (req, res) => {
    function fibonacci(n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
    const result = fibonacci(35);
    res.send(`CPU heavy result: ${result}`);
});

app.get('/memory-leak', (req, res) => {
    const newData = Buffer.alloc(1024 * 1024, 'leak');
    leakArray.push(newData);
    res.send(`Memory leaked! Array size: ${leakArray.length} MB`);
});

// --- AWS S3 ---
app.get('/api/aws/s3-status', async (req, res) => {
    try {
        const s3 = new S3Client({ region: AWS_REGION });
        const data = await s3.send(new ListBucketsCommand({}));
        res.json({ status: 'connected', buckets: data.Buckets.length, message: 'Successfully connected to S3' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.post('/api/s3/export-snapshot', async (req, res) => {
    try {
        const s3 = new S3Client({ region: AWS_REGION });
        const snapshot = req.body;
        const timestamp = new Date().toISOString();
        const key = `snapshots/${timestamp.replace(/[:.]/g, '-')}.json`;

        await s3.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: JSON.stringify({ exportedAt: timestamp, ...snapshot }, null, 2),
            ContentType: 'application/json'
        }));

        res.json({ status: 'success', key, message: `Snapshot saved to s3://${BUCKET_NAME}/${key}` });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.get('/api/s3/snapshots', async (req, res) => {
    try {
        const s3 = new S3Client({ region: AWS_REGION });
        const data = await s3.send(new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: 'snapshots/',
            MaxKeys: 20
        }));

        const files = (data.Contents || []).map(obj => ({
            key: obj.Key,
            size: obj.Size,
            lastModified: obj.LastModified
        })).sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

        res.json({ status: 'success', count: files.length, files });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// --- AWS RDS ---
app.get('/api/aws/rds-status', async (req, res) => {
    try {
        if (!process.env.DB_HOST) {
            return res.json({ status: 'unconfigured', message: 'DB_HOST not set in .env' });
        }
        const connection = await getDBConnection();
        const [rows] = await connection.execute('SELECT 1 as val');
        await connection.end();
        res.json({ status: 'connected', message: 'Successfully connected to RDS (MySQL)' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.post('/api/metrics/save', async (req, res) => {
    try {
        const { rps, p99, p50, errorRate, gpu1_temp, gpu1_clock, hbmBw, eccErrors } = req.body;
        const conn = await getDBConnection();
        await conn.execute(
            `INSERT INTO metrics_snapshots (rps, p99_latency, p50_latency, error_rate, gpu1_temp, gpu1_clock, hbm_bandwidth, ecc_errors)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [rps || 0, p99 || 0, p50 || 0, errorRate || 0, gpu1_temp || 0, gpu1_clock || 0, hbmBw || 0, eccErrors || 0]
        );
        await conn.end();
        res.json({ status: 'saved', message: 'Metric snapshot saved to RDS' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.get('/api/metrics/history', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 30;
        const conn = await getDBConnection();
        const [rows] = await conn.execute(
            `SELECT * FROM metrics_snapshots ORDER BY timestamp DESC LIMIT ${limit}`
        );
        await conn.end();
        res.json({ status: 'success', count: rows.length, data: rows.reverse() });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// --- AWS Cost Explorer ---
app.get('/api/aws/cost', async (req, res) => {
    try {
        const client = new CostExplorerClient({ region: 'us-east-1' });
        const now = new Date();
        const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        const end = now.toISOString().split('T')[0];

        const command = new GetCostAndUsageCommand({
            TimePeriod: { Start: start, End: end },
            Granularity: 'MONTHLY',
            Metrics: ['UnblendedCost'],
            GroupBy: [{ Type: 'DIMENSION', Key: 'SERVICE' }]
        });

        const data = await client.send(command);
        const results = data.ResultsByTime[0]?.Groups?.map(g => ({
            service: g.Keys[0],
            cost: parseFloat(g.Metrics.UnblendedCost.Amount).toFixed(4),
            unit: g.Metrics.UnblendedCost.Unit
        })).filter(g => parseFloat(g.cost) > 0) || [];

        const total = results.reduce((sum, g) => sum + parseFloat(g.cost), 0).toFixed(4);
        res.json({ status: 'success', period: `${start} ~ ${end}`, total, services: results });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// --- SQS ---
app.post('/api/sqs/send', async (req, res) => {
    try {
        const payload = req.body;
        const command = new SendMessageCommand({
            QueueUrl: SQS_QUEUE_URL,
            MessageBody: JSON.stringify({ ...payload, sentAt: new Date().toISOString() }),
        });
        const response = await sqsClient.send(command);
        res.json({ status: 'success', messageId: response.MessageId, message: 'Metric added to SQS queue' });
    } catch (e) {
        res.status(500).json({ status: 'error', message: e.message });
    }
});

app.get('/api/sqs/receive', async (req, res) => {
    try {
        const command = new ReceiveMessageCommand({
            QueueUrl: SQS_QUEUE_URL,
            MaxNumberOfMessages: 1,
            WaitTimeSeconds: 5,
        });
        const response = await sqsClient.send(command);
        if (!response.Messages || response.Messages.length === 0) {
            return res.json({ status: 'empty', message: 'No messages in queue' });
        }
        const message = response.Messages[0];
        const deleteCommand = new DeleteMessageCommand({
            QueueUrl: SQS_QUEUE_URL,
            ReceiptHandle: message.ReceiptHandle,
        });
        await sqsClient.send(deleteCommand);
        res.json({ status: 'success', data: JSON.parse(message.Body), message: 'Message processed and removed from queue' });
    } catch (e) {
        res.status(500).json({ status: 'error', message: e.message });
    }
});

// --- 404 + Error handler ---
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

// Export for testing; init is lazy via index.js
app._init = async () => {
    await loadSecretsFromAWS();
    await initDB();
};

module.exports = app;
