const router = require('express').Router();
const store = require('../data/store');

router.get('/', (req, res) => {
  const { category, minPrice, maxPrice } = req.query;
  const limit = Math.max(1, parseInt(req.query.limit) || 100);
  const offset = Math.max(0, parseInt(req.query.offset) || 0);

  let results = [...store.products];
  if (category) results = results.filter(p => p.category === category);
  if (minPrice !== undefined) results = results.filter(p => p.price >= parseFloat(minPrice));
  if (maxPrice !== undefined) results = results.filter(p => p.price <= parseFloat(maxPrice));

  const page = results.slice(offset, offset + limit);
  res.json({ data: page, total: results.length, limit, offset });
});

router.get('/:id', (req, res) => {
  const product = store.products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

router.post('/', (req, res) => {
  const { name, price, category, stock } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'name and price are required' });
  }
  if (typeof price !== 'number' || price < 0) {
    return res.status(400).json({ error: 'price must be a non-negative number' });
  }
  const product = {
    id: store.uuidv4(),
    name,
    price,
    category: category || 'uncategorized',
    stock: stock !== undefined ? parseInt(stock) : 0,
    createdAt: new Date().toISOString(),
  };
  store.products.push(product);
  res.status(201).json(product);
});

router.put('/:id', (req, res) => {
  const idx = store.products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });
  const { name, price, category, stock } = req.body;
  if (price !== undefined && (typeof price !== 'number' || price < 0)) {
    return res.status(400).json({ error: 'price must be a non-negative number' });
  }
  store.products[idx] = {
    ...store.products[idx],
    ...(name !== undefined && { name }),
    ...(price !== undefined && { price }),
    ...(category !== undefined && { category }),
    ...(stock !== undefined && { stock: parseInt(stock) }),
  };
  res.json(store.products[idx]);
});

router.delete('/:id', (req, res) => {
  const idx = store.products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });
  store.products.splice(idx, 1);
  res.status(204).send();
});

module.exports = router;
