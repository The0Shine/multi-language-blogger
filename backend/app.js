require("dotenv").config({ path: __dirname + "/.env" }); // 🔹 Load env trước
require("module-alias/register");

const express = require("express");
const cors = require("cors"); // <-- Thêm dòng này
// const swaggerUi = require("swagger-ui-express");
// const swaggerSpecs = require("./swagger-docs");
const app = express();
const rootRoutes = require("./routes");
const sequelize = require("./models").sequelize; // Bây giờ mới import models

// =================================================================
// <<< BƯỚC 1: THÊM CÁC MODULE CẦN THIẾT CHO WEBSOCKET >>>
// =================================================================
const http = require("http");
const { Server } = require("socket.io");

// =================================================================
// <<< BƯỚC 2: TẠO HTTP SERVER VÀ TÍCH HỢP SOCKET.IO >>>
// =================================================================
const server = http.createServer(app); // Dùng app của Express để tạo http server
const io = new Server(server, {
  // Cấu hình CORS cho Socket.IO để Angular có thể kết nối
  cors: {
    origin: "*", // Hoặc "http://localhost:4200" để chặt chẽ hơn
    methods: ["GET", "POST"],
  },
});

// Middleware parse body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware CORS cho Angular
app.use(
  cors({
    origin: "*", // Cho phép tất cả domains
    credentials: true, // Cho phép gửi cookie/token
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Test database connection
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected successfully.");
  })
  .catch((err) => {
    console.error("❌ Unable to connect to the database:", err);
  });

// =================================================================
// <<< BƯỚC 3: THIẾT LẬP LOGIC CHO SOCKET.IO >>>
// =================================================================

// Dùng để lưu map giữa userid và socket.id của họ
let userSocketMap = {};
io.on("connection", (socket) => {
  console.log(`🔌 WebSocket user connected: ${socket.id}`);

  // Lắng nghe sự kiện "register" từ client sau khi họ đăng nhập
  socket.on("register", (userId) => {
    if (userId) {
      console.log(`🔗 Registering userId ${userId} to socketId ${socket.id}`);
      userSocketMap[userId] = socket.id;
    }
  });

  // Xử lý khi client ngắt kết nối
  socket.on("disconnect", () => {
    console.log(`🔌 WebSocket user disconnected: ${socket.id}`);
    // Xóa user khỏi map
    for (const userId in userSocketMap) {
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
        break;
      }
    }
  });
});

// Tạo một middleware để truyền `io` và `userSocketMap` vào các request
// Giúp các controller có thể truy cập và gửi sự kiện
app.use((req, res, next) => {
  req.io = io;
  req.userSocketMap = userSocketMap;
  next();
});

// Swagger documentation (temporarily disabled)
// app.use(
//   "/api-docs",
//   swaggerUi.serve,
//   swaggerUi.setup(swaggerSpecs, {
//     customCss: ".swagger-ui .topbar { display: none }",
//     customSiteTitle: "NodeJS Core API Documentation",
//   })
// );

// Use root routes
app.use("/api", rootRoutes);

// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
