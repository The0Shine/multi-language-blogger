require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nodejs_core_new',
  port: process.env.DB_PORT || 3306
};

let connection;

// Initialize database connection
async function initDB() {
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
}

// Basic routes
app.get("/", (req, res) => {
  res.json({ 
    success: true,
    message: "NodeJS Core API Test Server is running!",
    timestamp: new Date().toISOString()
  });
});

// Auth routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { first_name, last_name, email, username, password } = req.body;
    
    if (!first_name || !last_name || !email || !username || !password) {
      return res.status(400).json({
        success: false,
        error: "All fields are required"
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const [result] = await connection.execute(
      `INSERT INTO user (first_name, last_name, email, username, password, roleid, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, 1, 1, NOW(), NOW())`,
      [first_name, last_name, email, username, hashedPassword]
    );
    
    res.status(201).json({
      success: true,
      data: {
        userid: result.insertId,
        message: "User registered successfully"
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username and password are required"
      });
    }
    
    // Find user
    const [users] = await connection.execute(
      `SELECT u.*, r.name as role_name FROM user u 
       LEFT JOIN role r ON u.roleid = r.roleid 
       WHERE u.username = ? AND u.status = 1`,
      [username]
    );
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }
    
    const user = users[0];
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }
    
    // Generate token
    const token = jwt.sign(
      { userid: user.userid, roleid: user.roleid },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );
    
    res.json({
      success: true,
      data: {
        message: "Login successful.",
        accessToken: token,
        user: {
          userid: user.userid,
          username: user.username,
          role: user.role_name
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Middleware to verify token
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Access token required"
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Invalid token"
    });
  }
};

// Language routes
app.get("/api/languages", authenticate, async (req, res) => {
  try {
    const [languages] = await connection.execute(
      "SELECT * FROM language WHERE status = 1 ORDER BY language_name"
    );
    
    res.json({
      success: true,
      data: languages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Category routes
app.get("/api/categories", authenticate, async (req, res) => {
  try {
    const [categories] = await connection.execute(
      "SELECT * FROM category WHERE status = 1 ORDER BY category_name"
    );
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post("/api/categories", authenticate, async (req, res) => {
  try {
    const { category_name, status = 1 } = req.body;
    
    if (!category_name) {
      return res.status(400).json({
        success: false,
        error: "Category name is required"
      });
    }
    
    const [result] = await connection.execute(
      "INSERT INTO category (category_name, status, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
      [category_name, status]
    );
    
    res.status(201).json({
      success: true,
      data: {
        categoryid: result.insertId,
        category_name,
        status,
        message: "Category created successfully"
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.get("/api/categories/:id", authenticate, async (req, res) => {
  try {
    const [categories] = await connection.execute(
      "SELECT * FROM category WHERE categoryid = ?",
      [req.params.id]
    );
    
    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Category not found"
      });
    }
    
    res.json({
      success: true,
      data: categories[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Post routes
app.get("/api/posts", authenticate, async (req, res) => {
  try {
    const [posts] = await connection.execute(`
      SELECT p.*, u.username, l.language_name 
      FROM post p 
      LEFT JOIN user u ON p.userid = u.userid 
      LEFT JOIN language l ON p.languageid = l.languageid 
      ORDER BY p.created_at DESC
    `);
    
    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post("/api/posts", authenticate, async (req, res) => {
  try {
    const { title, content, languageid, categoryids = [], status = 0 } = req.body;
    
    if (!title || !content || !languageid) {
      return res.status(400).json({
        success: false,
        error: "Title, content, and language ID are required"
      });
    }
    
    // Insert post
    const [result] = await connection.execute(
      `INSERT INTO post (title, content, languageid, userid, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [title, content, languageid, req.user.userid, status]
    );
    
    const postId = result.insertId;
    
    // Add categories if provided
    if (categoryids.length > 0) {
      for (const categoryId of categoryids) {
        await connection.execute(
          "INSERT INTO category_post (postid, categoryid) VALUES (?, ?)",
          [postId, categoryId]
        );
      }
    }
    
    res.status(201).json({
      success: true,
      data: {
        postid: postId,
        title,
        content,
        message: "Post created successfully"
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.get("/api/posts/:id", authenticate, async (req, res) => {
  try {
    const [posts] = await connection.execute(`
      SELECT p.*, u.username, l.language_name 
      FROM post p 
      LEFT JOIN user u ON p.userid = u.userid 
      LEFT JOIN language l ON p.languageid = l.languageid 
      WHERE p.postid = ?
    `, [req.params.id]);
    
    if (posts.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Post not found"
      });
    }
    
    // Get categories for this post
    const [categories] = await connection.execute(`
      SELECT c.* FROM category c 
      JOIN category_post cp ON c.categoryid = cp.categoryid 
      WHERE cp.postid = ?
    `, [req.params.id]);
    
    const post = posts[0];
    post.categories = categories;
    
    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Upload routes (mock)
app.get("/api/upload/signature", authenticate, (req, res) => {
  res.json({
    success: true,
    data: {
      signature: "mock_signature_" + Date.now(),
      timestamp: Date.now(),
      api_key: "mock_api_key",
      cloud_name: "mock_cloud"
    }
  });
});

app.post("/api/upload/image-by-url", authenticate, (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({
      success: false,
      error: "URL is required"
    });
  }
  
  res.json({
    success: true,
    data: {
      public_id: "mock_public_id_" + Date.now(),
      secure_url: url,
      original_url: url,
      message: "Image uploaded successfully (mock)"
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    error: "Internal server error" 
  });
});

app.use("*", (req, res) => {
  res.status(404).json({ 
    success: false,
    error: "Route not found" 
  });
});

const PORT = process.env.PORT || 3000;

// Start server
async function startServer() {
  await initDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Simple API Test Server is running on port ${PORT}`);
    console.log(`📡 Base URL: http://localhost:${PORT}`);
    console.log(`📚 API Base: http://localhost:${PORT}/api`);
  });
}

startServer().catch(console.error);
