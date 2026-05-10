const request = require('supertest');
const app = require('../../../apps/target-server/src/app');

describe('Health Endpoints', () => {
  describe('GET /health', () => {
    it('returns 200 with status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    it('includes timestamp in ISO 8601 format', async () => {
      const res = await request(app).get('/health');
      expect(res.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('includes numeric uptime', async () => {
      const res = await request(app).get('/health');
      expect(typeof res.body.uptime).toBe('number');
      expect(res.body.uptime).toBeGreaterThan(0);
    });
  });

  describe('GET /health/detailed', () => {
    it('returns 200 with status ok', async () => {
      const res = await request(app).get('/health/detailed');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    it('includes memory stats with heapUsed, heapTotal, rss', async () => {
      const res = await request(app).get('/health/detailed');
      expect(res.body.memory).toBeDefined();
      expect(typeof res.body.memory.heapUsed).toBe('number');
      expect(typeof res.body.memory.heapTotal).toBe('number');
      expect(typeof res.body.memory.rss).toBe('number');
    });

    it('includes pid as a number', async () => {
      const res = await request(app).get('/health/detailed');
      expect(typeof res.body.pid).toBe('number');
    });

    it('includes uptime and version', async () => {
      const res = await request(app).get('/health/detailed');
      expect(res.body).toHaveProperty('uptime');
      expect(res.body).toHaveProperty('version');
    });
  });

  describe('Unknown routes', () => {
    it('returns 404 for unrecognized paths', async () => {
      const res = await request(app).get('/does-not-exist');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });
});
