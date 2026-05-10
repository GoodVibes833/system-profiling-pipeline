const request = require('supertest');
const app = require('../../../apps/target-server/src/app');

describe('Fault Injection Endpoints', () => {
  describe('GET /fault/slow', () => {
    it('responds after the specified delay', async () => {
      const start = Date.now();
      const res = await request(app).get('/fault/slow?delay=300');
      const elapsed = Date.now() - start;
      expect(res.status).toBe(200);
      expect(elapsed).toBeGreaterThanOrEqual(300);
      expect(res.body.delay).toBe(300);
      expect(res.body).toHaveProperty('message');
    }, 10000);

    it('uses default 2000ms delay when query param omitted', async () => {
      const res = await request(app).get('/fault/slow?delay=100');
      expect(res.body.delay).toBe(100);
    }, 10000);

    it('handles very short delay (50ms) accurately', async () => {
      const start = Date.now();
      const res = await request(app).get('/fault/slow?delay=50');
      const elapsed = Date.now() - start;
      expect(res.status).toBe(200);
      expect(res.body.delay).toBe(50);
      expect(elapsed).toBeGreaterThanOrEqual(50);
    }, 5000);
  });

  describe('GET /fault/error-rate', () => {
    it('always returns 500 with rate=1.0', async () => {
      const res = await request(app).get('/fault/error-rate?rate=1.0');
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error');
      expect(res.body.rate).toBe(1);
    });

    it('always returns 200 with rate=0', async () => {
      const res = await request(app).get('/fault/error-rate?rate=0');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body.rate).toBe(0);
    });

    it('response body includes rate value', async () => {
      const res = await request(app).get('/fault/error-rate?rate=0');
      expect(typeof res.body.rate).toBe('number');
    });

    it('rate > 1.0 is capped at 1.0', async () => {
      const res = await request(app).get('/fault/error-rate?rate=999');
      expect(res.body.rate).toBe(1);
    });
  });

  describe('GET /fault/memory-leak', () => {
    it('returns 200 with leak metadata', async () => {
      const res = await request(app).get('/fault/memory-leak');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('leaked_mb');
      expect(res.body).toHaveProperty('heap_used_mb');
      expect(res.body).toHaveProperty('message');
    });

    it('leaked_mb increments on repeated calls', async () => {
      const res1 = await request(app).get('/fault/memory-leak');
      const res2 = await request(app).get('/fault/memory-leak');
      expect(res2.body.leaked_mb).toBeGreaterThan(res1.body.leaked_mb);
    });

    it('heap_used_mb is a string-encoded float', async () => {
      const res = await request(app).get('/fault/memory-leak');
      expect(parseFloat(res.body.heap_used_mb)).toBeGreaterThan(0);
    });
  });

  describe('GET /fault/cpu-spike', () => {
    it('returns fibonacci result for n=10 (fib(10) = 55)', async () => {
      const res = await request(app).get('/fault/cpu-spike?n=10');
      expect(res.status).toBe(200);
      expect(res.body.n).toBe(10);
      expect(res.body.result).toBe(55);
      expect(typeof res.body.elapsed_ms).toBe('number');
    }, 15000);

    it('returns fibonacci result for n=1', async () => {
      const res = await request(app).get('/fault/cpu-spike?n=1');
      expect(res.body.result).toBe(1);
    }, 15000);

    it('caps n at 45', async () => {
      const res = await request(app).get('/fault/cpu-spike?n=999');
      expect(res.body.n).toBe(45);
    }, 60000);
  });
});
