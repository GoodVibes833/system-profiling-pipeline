const app = require('./app');

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`target-server running at http://localhost:${PORT}`);
  console.log('Endpoints: /health, /users, /products, /fault/*');
});

module.exports = server;
