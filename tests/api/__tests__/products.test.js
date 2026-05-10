const request = require('supertest');
const app = require('../../../apps/target-server/src/app');
const store = require('../../../apps/target-server/src/data/store');

describe('Products API', () => {
  beforeEach(() => store.reset());

  describe('GET /products', () => {
    it('returns 200 with data array and pagination metadata', async () => {
      const res = await request(app).get('/products');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.total).toBe(3);
    });

    it('filters by ?category', async () => {
      const res = await request(app).get('/products?category=widgets');
      expect(res.status).toBe(200);
      expect(res.body.data.every(p => p.category === 'widgets')).toBe(true);
      expect(res.body.total).toBe(2);
    });

    it('returns empty data for non-existent category', async () => {
      const res = await request(app).get('/products?category=nonexistent');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(0);
      expect(res.body.total).toBe(0);
    });

    it('filters by ?minPrice', async () => {
      const res = await request(app).get('/products?minPrice=20');
      expect(res.status).toBe(200);
      expect(res.body.data.every(p => p.price >= 20)).toBe(true);
    });

    it('filters by ?maxPrice', async () => {
      const res = await request(app).get('/products?maxPrice=15');
      expect(res.status).toBe(200);
      expect(res.body.data.every(p => p.price <= 15)).toBe(true);
    });

    it('combines ?minPrice and ?maxPrice filters', async () => {
      const res = await request(app).get('/products?minPrice=10&maxPrice=20');
      expect(res.status).toBe(200);
      expect(res.body.data.every(p => p.price >= 10 && p.price <= 20)).toBe(true);
    });

    it('respects ?limit and ?offset', async () => {
      const res = await request(app).get('/products?limit=1&offset=1');
      expect(res.body.data.length).toBe(1);
      expect(res.body.offset).toBe(1);
    });
  });

  describe('GET /products/:id', () => {
    it('returns a product with correct shape', async () => {
      const res = await request(app).get('/products/1');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('1');
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('price');
      expect(res.body).toHaveProperty('category');
      expect(res.body).toHaveProperty('stock');
      expect(res.body).toHaveProperty('createdAt');
    });

    it('returns 404 for non-existent product', async () => {
      const res = await request(app).get('/products/nonexistent');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /products', () => {
    it('creates product with all fields and returns 201', async () => {
      const payload = { name: 'Doohickey C', price: 29.99, category: 'doohickeys', stock: 75 };
      const res = await request(app).post('/products').send(payload);
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ name: 'Doohickey C', price: 29.99, category: 'doohickeys', stock: 75 });
      expect(res.body.id).toBeDefined();
    });

    it('assigns default category "uncategorized" when omitted', async () => {
      const res = await request(app).post('/products').send({ name: 'Misc Item', price: 5.00 });
      expect(res.status).toBe(201);
      expect(res.body.category).toBe('uncategorized');
    });

    it('assigns default stock 0 when omitted', async () => {
      const res = await request(app).post('/products').send({ name: 'No Stock', price: 1.00 });
      expect(res.status).toBe(201);
      expect(res.body.stock).toBe(0);
    });

    it('returns 400 when name is missing', async () => {
      const res = await request(app).post('/products').send({ price: 10.0 });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 400 when price is missing', async () => {
      const res = await request(app).post('/products').send({ name: 'No Price' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when price is negative', async () => {
      const res = await request(app).post('/products').send({ name: 'Bad Price', price: -5 });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/price/i);
    });

    it('returns 400 when price is not a number', async () => {
      const res = await request(app).post('/products').send({ name: 'String Price', price: 'free' });
      expect(res.status).toBe(400);
    });

    it('allows price of 0 (free product)', async () => {
      const res = await request(app).post('/products').send({ name: 'Free Item', price: 0 });
      expect(res.status).toBe(201);
      expect(res.body.price).toBe(0);
    });
  });

  describe('PUT /products/:id', () => {
    it('updates price and returns updated product', async () => {
      const res = await request(app).put('/products/1').send({ price: 19.99 });
      expect(res.status).toBe(200);
      expect(res.body.price).toBe(19.99);
      expect(res.body.id).toBe('1');
    });

    it('partial update preserves unchanged fields', async () => {
      const original = await request(app).get('/products/1');
      const res = await request(app).put('/products/1').send({ stock: 999 });
      expect(res.body.name).toBe(original.body.name);
      expect(res.body.price).toBe(original.body.price);
      expect(res.body.stock).toBe(999);
    });

    it('returns 400 when updating to a negative price', async () => {
      const res = await request(app).put('/products/1').send({ price: -1 });
      expect(res.status).toBe(400);
    });

    it('returns 404 for non-existent product', async () => {
      const res = await request(app).put('/products/nonexistent').send({ price: 10 });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /products/:id', () => {
    it('deletes product and returns 204', async () => {
      const res = await request(app).delete('/products/1');
      expect(res.status).toBe(204);
    });

    it('deleted product no longer retrievable', async () => {
      await request(app).delete('/products/1');
      const check = await request(app).get('/products/1');
      expect(check.status).toBe(404);
    });

    it('returns 404 for non-existent product', async () => {
      const res = await request(app).delete('/products/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
