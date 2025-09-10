require("dotenv").config({ path: __dirname + "/.env.production" });
require("module-alias/register");

const { sequelize } = require("./models");

async function runSimpleMigration() {
  try {
    console.log("🔄 Đang kết nối database...");
    
    // Test connection
    await sequelize.authenticate();
    console.log("✅ Kết nối database thành công!");

    // Sync all models (tạo bảng nếu chưa có)
    console.log("🔄 Đang tạo/cập nhật bảng...");
    await sequelize.sync({ force: false });
    
    console.log("✅ Migration hoàn thành!");
    
    // Tạo dữ liệu mẫu bằng SQL thuần
    await createSampleDataWithSQL();
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi migration:", error);
    process.exit(1);
  }
}

async function createSampleDataWithSQL() {
  try {
    console.log("🔄 Tạo dữ liệu mẫu...");
    
    // Tạo roles
    await sequelize.query(`
      INSERT IGNORE INTO role (name, status, discription, created_at, updated_at) 
      VALUES 
        ('admin', 1, 'Administrator', NOW(), NOW()),
        ('user', 1, 'Regular User', NOW(), NOW())
    `);
    
    // Tạo languages
    await sequelize.query(`
      INSERT IGNORE INTO language (language_name, locale_code, created_at, updated_at) 
      VALUES 
        ('English', 'en_US', NOW(), NOW()),
        ('Tiếng Việt', 'vi_VN', NOW(), NOW()),
        ('中文', 'zh_CN', NOW(), NOW()),
        ('Français', 'fr_FR', NOW(), NOW()),
        ('Deutsch', 'de_DE', NOW(), NOW()),
        ('Español', 'es_ES', NOW(), NOW())
    `);
    
    // Tạo categories
    await sequelize.query(`
      INSERT IGNORE INTO category (category_name, created_at, updated_at) 
      VALUES 
        ('Technology', NOW(), NOW()),
        ('Programming', NOW(), NOW()),
        ('Web Development', NOW(), NOW()),
        ('Mobile Development', NOW(), NOW()),
        ('AI & Machine Learning', NOW(), NOW())
    `);
    
    // Tạo admin user
    const bcrypt = require("bcrypt");
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    await sequelize.query(`
      INSERT IGNORE INTO user (first_name, last_name, email, username, password, roleid, status, created_at, updated_at) 
      VALUES ('Admin', 'User', 'admin@example.com', 'admin', '${hashedPassword}', 1, 1, NOW(), NOW())
    `);
    
    console.log("✅ Tạo dữ liệu mẫu thành công!");
    console.log("📋 Thông tin đăng nhập admin:");
    console.log("   Email: admin@example.com");
    console.log("   Password: admin123");
    
  } catch (error) {
    console.error("❌ Lỗi tạo dữ liệu mẫu:", error);
  }
}

runSimpleMigration();
