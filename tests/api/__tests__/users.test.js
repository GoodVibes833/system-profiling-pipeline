const request = require('supertest');
const app = require('../../../apps/target-server/src/app');
const store = require('../../../apps/target-server/src/data/store');

describe('Users API', () => {
  beforeEach(() => store.reset());

  describe('GET /users', () => {
    it('returns 200 with data array and pagination metadata', async () => {
      const res = await request(app).get('/users');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('limit');
      expect(res.body).toHaveProperty('offset');
    });

    it('returns seeded users count', async () => {
      const res = await request(app).get('/users');
      expect(res.body.total).toBe(3);
      expect(res.body.data.length).toBe(3);
    });

    it('respects ?limit param', async () => {
      const res = await request(app).get('/users?limit=1');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.limit).toBe(1);
    });

    it('respects ?offset param', async () => {
      const res1 = await request(app).get('/users?limit=1&offset=0');
      const res2 = await request(app).get('/users?limit=1&offset=1');
      expect(res1.body.data[0].id).not.toBe(res2.body.data[0].id);
    });

    it('offset beyond total returns empty data array', async () => {
      const res = await request(app).get('/users?offset=999');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(0);
    });
  });

  describe('GET /users/:id', () => {
    it('returns a user with correct shape', async () => {
      const res = await request(app).get('/users/1');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('1');
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('email');
      expect(res.body).toHaveProperty('role');
      expect(res.body).toHaveProperty('createdAt');
    });

    it('returns 404 for non-existent user', async () => {
      const res = await request(app).get('/users/nonexistent-id');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /users', () => {
    it('creates a new user and returns 201', async () => {
      const payload = { name: 'Dave Test', email: 'dave@example.com', role: 'user' };
      const res = await request(app).post('/users').send(payload);
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ name: 'Dave Test', email: 'dave@example.com', role: 'user' });
      expect(res.body.id).toBeDefined();
      expect(res.body.createdAt).toBeDefined();
    });

    it('assigns default role "user" when not provided', async () => {
      const res = await request(app).post('/users').send({ name: 'No Role', email: 'norole@example.com' });
      expect(res.status).toBe(201);
      expect(res.body.role).toBe('user');
    });

    it('returns 400 when name is missing', async () => {
      const res = await request(app).post('/users').send({ email: 'test@example.com' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 400 when email is missing', async () => {
      const res = await request(app).post('/users').send({ name: 'Test User' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 409 on duplicate email', async () => {
      const res = await request(app).post('/users').send({ name: 'Dup User', email: 'alice@example.com' });
      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/email/i);
    });

    it('new user appears in GET /users list', async () => {
      await request(app).post('/users').send({ name: 'Eve New', email: 'eve@example.com' });
      const list = await request(app).get('/users');
      expect(list.body.total).toBe(4);
    });
  });

  describe('PUT /users/:id', () => {
    it('updates name and returns updated user', async () => {
      const res = await request(app).put('/users/1').send({ name: 'Alice Updated' });
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Alice Updated');
      expect(res.body.id).toBe('1');
    });

    it('partial update preserves unchanged fields', async () => {
      const original = await request(app).get('/users/1');
      const res = await request(app).put('/users/1').send({ role: 'viewer' });
      expect(res.body.email).toBe(original.body.email);
      expect(res.body.name).toBe(original.body.name);
      expect(res.body.role).toBe('viewer');
    });

    it('returns 404 for non-existent user', async () => {
      const res = await request(app).put('/users/nonexistent').send({ name: 'Nobody' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /users/:id', () => {
    it('deletes user and returns 204', async () => {
      const res = await request(app).delete('/users/1');
      expect(res.status).toBe(204);
    });

    it('deleted user no longer retrievable', async () => {
      await request(app).delete('/users/1');
      const check = await request(app).get('/users/1');
      expect(check.status).toBe(404);
    });

    it('decrements total count after delete', async () => {
      await request(app).delete('/users/1');
      const list = await request(app).get('/users');
      expect(list.body.total).toBe(2);
    });

    it('returns 404 for non-existent user', async () => {
      const res = await request(app).delete('/users/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
