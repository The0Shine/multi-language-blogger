require("dotenv").config({ path: __dirname + "/.env" });
require("module-alias/register");

const { sequelize } = require("./models");

async function runMigrations() {
  try {
    console.log("🔄 Đang kết nối database...");

    // Test connection
    await sequelize.authenticate();
    console.log("✅ Kết nối database thành công!");

    // Sync all models (tạo bảng nếu chưa có)
    console.log("🔄 Đang tạo/cập nhật bảng...");
    await sequelize.sync({ force: false }); // force: false để không xóa data cũ

    console.log("✅ Migration hoàn thành!");

    // Tạo dữ liệu mẫu nếu cần
    await createSampleData();

    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi migration:", error);
    process.exit(1);
  }
}

async function createSampleData() {
  try {
    const { User, Role, Language, Category } = require("./models");

    // Tạo roles
    const adminRole = await Role.findOrCreate({
      where: { name: "admin" },
      defaults: { name: "admin", discription: "Administrator", status: 1 },
    });

    const userRole = await Role.findOrCreate({
      where: { name: "user" },
      defaults: { name: "user", discription: "Regular User", status: 1 },
    });

    // Tạo languages
    const languages = [
      { language_name: "English", locale_code: "en_US" },
      { language_name: "Tiếng Việt", locale_code: "vi_VN" },
      { language_name: "中文", locale_code: "zh_CN" },
      { language_name: "Français", locale_code: "fr_FR" },
      { language_name: "Deutsch", locale_code: "de_DE" },
      { language_name: "Español", locale_code: "es_ES" },
    ];

    for (const lang of languages) {
      await Language.findOrCreate({
        where: { locale_code: lang.locale_code },
        defaults: lang,
      });
    }

    // Tạo categories
    const categories = [
      { category_name: "Technology" },
      { category_name: "Programming" },
      { category_name: "Web Development" },
      { category_name: "Mobile Development" },
      { category_name: "AI & Machine Learning" },
    ];

    for (const cat of categories) {
      await Category.findOrCreate({
        where: { category_name: cat.category_name },
        defaults: cat,
      });
    }

    // Tạo admin user
    const bcrypt = require("bcrypt");
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.findOrCreate({
      where: { email: "admin@example.com" },
      defaults: {
        first_name: "Admin",
        last_name: "User",
        email: "admin@example.com",
        username: "admin",
        password: hashedPassword,
        roleid: adminRole[0].roleid,
        status: 1,
      },
    });

    console.log("✅ Tạo dữ liệu mẫu thành công!");
    console.log("📋 Thông tin đăng nhập admin:");
    console.log("   Email: admin@example.com");
    console.log("   Password: admin123");
  } catch (error) {
    console.error("❌ Lỗi tạo dữ liệu mẫu:", error);
  }
}

runMigrations();
