const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const healthRouter = require('./routes/health');
const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');
const faultsRouter = require('./routes/faults');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use('/health', healthRouter);
app.use('/users', usersRouter);
app.use('/products', productsRouter);
app.use('/fault', faultsRouter);

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

app.use(errorHandler);

module.exports = app;
