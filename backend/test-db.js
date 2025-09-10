require("dotenv").config({ path: __dirname + "/.env.production" });

const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log("🔄 Testing database connection...");
    console.log("DATABASE_URL:", process.env.DATABASE_URL);
    
    // Parse DATABASE_URL
    const dbUrl = new URL(process.env.DATABASE_URL);
    
    const connection = await mysql.createConnection({
      host: dbUrl.hostname,
      port: dbUrl.port,
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.slice(1), // Remove leading slash
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    console.log("✅ Database connection successful!");
    
    // Test query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log("✅ Test query successful:", rows);
    
    await connection.end();
    console.log("✅ Connection closed successfully");
    
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.error("Full error:", error);
  }
}

testConnection();
