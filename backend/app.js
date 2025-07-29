require("module-alias/register");
const express = require("express");
const app = express();
const rootRoutes = require("./routes"); // Import root route
const sequelize = require("./models").sequelize; // Import Sequelize instance
require("dotenv").config();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

// Use root routes
app.use("/api", rootRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});