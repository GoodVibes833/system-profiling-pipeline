const router = require('express').Router();

const leakBucket = [];

router.get('/slow', async (req, res) => {
  const delay = Math.min(parseInt(req.query.delay) || 2000, 30000);
  await new Promise(resolve => setTimeout(resolve, delay));
  res.json({ message: `Responded after ${delay}ms`, delay });
});

router.get('/error-rate', (req, res) => {
  const rawRate = req.query.rate !== undefined ? parseFloat(req.query.rate) : 0.5;
  const rate = Math.min(Math.max(isNaN(rawRate) ? 0.5 : rawRate, 0), 1);
  if (Math.random() < rate) {
    return res.status(500).json({ error: 'Injected fault: random server error', rate });
  }
  res.json({ message: 'Request succeeded', rate });
});

router.get('/memory-leak', (req, res) => {
  const chunk = Buffer.alloc(1024 * 1024, 'x');
  leakBucket.push(chunk);
  res.json({
    message: 'Memory chunk allocated',
    leaked_mb: leakBucket.length,
    heap_used_mb: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
  });
});

router.get('/cpu-spike', (req, res) => {
  const n = Math.min(parseInt(req.query.n) || 40, 45);
  function fib(x) { return x <= 1 ? x : fib(x - 1) + fib(x - 2); }
  const start = Date.now();
  const result = fib(n);
  const elapsed = Date.now() - start;
  res.json({ n, result, elapsed_ms: elapsed });
});

router.get('/timeout', async (req, res) => {
  const duration = Math.min(parseInt(req.query.duration) || 60000, 300000);
  await new Promise(resolve => setTimeout(resolve, duration));
  if (!res.headersSent) {
    res.json({ message: 'Finally responded after timeout' });
  }
});

module.exports = router;
