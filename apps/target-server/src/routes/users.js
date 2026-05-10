const router = require('express').Router();
const store = require('../data/store');

router.get('/', (req, res) => {
  const limit = Math.max(1, parseInt(req.query.limit) || 100);
  const offset = Math.max(0, parseInt(req.query.offset) || 0);
  const page = store.users.slice(offset, offset + limit);
  res.json({ data: page, total: store.users.length, limit, offset });
});

router.get('/:id', (req, res) => {
  const user = store.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.post('/', (req, res) => {
  const { name, email, role } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  if (store.users.find(u => u.email === email)) {
    return res.status(409).json({ error: 'Email already exists' });
  }
  const user = {
    id: store.uuidv4(),
    name,
    email,
    role: role || 'user',
    createdAt: new Date().toISOString(),
  };
  store.users.push(user);
  res.status(201).json(user);
});

router.put('/:id', (req, res) => {
  const idx = store.users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  const { name, email, role } = req.body;
  store.users[idx] = {
    ...store.users[idx],
    ...(name !== undefined && { name }),
    ...(email !== undefined && { email }),
    ...(role !== undefined && { role }),
  };
  res.json(store.users[idx]);
});

router.delete('/:id', (req, res) => {
  const idx = store.users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  store.users.splice(idx, 1);
  res.status(204).send();
});

module.exports = router;
