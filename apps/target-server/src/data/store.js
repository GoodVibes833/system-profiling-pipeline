const { v4: uuidv4 } = require('uuid');

const SEED_USERS = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'admin', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'user', createdAt: '2024-01-02T00:00:00.000Z' },
  { id: '3', name: 'Carol White', email: 'carol@example.com', role: 'user', createdAt: '2024-01-03T00:00:00.000Z' },
];

const SEED_PRODUCTS = [
  { id: '1', name: 'Widget A', price: 9.99, category: 'widgets', stock: 100, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: '2', name: 'Gadget B', price: 49.99, category: 'gadgets', stock: 50, createdAt: '2024-01-02T00:00:00.000Z' },
  { id: '3', name: 'Widget B', price: 14.99, category: 'widgets', stock: 200, createdAt: '2024-01-03T00:00:00.000Z' },
];

const users = SEED_USERS.map(u => ({ ...u }));
const products = SEED_PRODUCTS.map(p => ({ ...p }));

function reset() {
  users.length = 0;
  SEED_USERS.forEach(u => users.push({ ...u }));
  products.length = 0;
  SEED_PRODUCTS.forEach(p => products.push({ ...p }));
}

module.exports = { users, products, uuidv4, reset };
