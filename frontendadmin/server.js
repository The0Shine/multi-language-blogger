const jsonServer = require('json-server');
const server = jsonServer.create();
const path = require('path');
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

// Dùng middlewares mặc định (CORS, static, logger)
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Middleware tự tăng ID cho mọi resource
server.post('/:resource', (req, res, next) => {
  const resource = req.params.resource;
  const data = router.db.get(resource).value();

  if (Array.isArray(data) && data.length > 0) {
    // Lấy ID lớn nhất hiện tại
    const maxId = Math.max(...data.map(item => Number(item.id) || 0));
    req.body.id = maxId + 1;
  } else {
    req.body.id = 1;
  }

  next();
});

// Dùng router mặc định
server.use(router);

// Chạy server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`JSON Server is running at http://localhost:${PORT}`);
});
