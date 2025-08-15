require("dotenv").config({ path: __dirname + "/.env" }); // 🔹 Load env trước
require("module-alias/register");

const express = require("express");
const cors = require("cors"); // <-- Thêm dòng này
// const swaggerUi = require("swagger-ui-express");
// const swaggerSpecs = require("./swagger-docs");
const app = express();
const rootRoutes = require("./routes");
const sequelize = require("./models").sequelize; // Bây giờ mới import models

// Middleware parse body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware CORS cho Angular
app.use(
  cors({
    origin: "http://localhost:4200", // Cho phép Angular gọi
    credentials: true, // Cho phép gửi cookie/token
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
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
