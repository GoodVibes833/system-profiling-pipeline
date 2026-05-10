const app = require('./app');

const port = process.env.PORT || 3002;

(async () => {
  await app._init();
  app.listen(port, () => {
    console.log(`AWS Profiling Server running at http://localhost:${port}`);
  });
})();
