const { User, Role, Category, Language, Post } = require('../models');
const bcrypt = require('bcrypt');

async function seedData() {
  try {
    console.log('🌱 Starting database seeding...');

    // 1. Tạo Roles
    console.log('📝 Creating roles...');
    const roles = await Role.bulkCreate([
      { role_name: 'admin', description: 'Administrator' },
      { role_name: 'user', description: 'Regular User' },
      { role_name: 'moderator', description: 'Content Moderator' }
    ], { ignoreDuplicates: true });

    // 2. Tạo Languages
    console.log('🌍 Creating languages...');
    const languages = await Language.bulkCreate([
      { language_name: 'English', locale_code: 'en', status: 1 },
      { language_name: 'Tiếng Việt', locale_code: 'vi', status: 1 },
      { language_name: 'Français', locale_code: 'fr', status: 1 },
      { language_name: '中文', locale_code: 'zh', status: 1 },
      { language_name: 'Deutsch', locale_code: 'de', status: 1 },
      { language_name: '한국어', locale_code: 'ko', status: 1 }
    ], { ignoreDuplicates: true });

    // 3. Tạo Categories
    console.log('📂 Creating categories...');
    const categories = await Category.bulkCreate([
      { category_name: 'Technology', description: 'Tech articles and tutorials', status: 1 },
      { category_name: 'Programming', description: 'Programming guides and tips', status: 1 },
      { category_name: 'Web Development', description: 'Frontend and backend development', status: 1 },
      { category_name: 'Mobile Development', description: 'iOS and Android development', status: 1 },
      { category_name: 'Data Science', description: 'AI, ML, and data analysis', status: 1 },
      { category_name: 'DevOps', description: 'Deployment and infrastructure', status: 1 },
      { category_name: 'Design', description: 'UI/UX and graphic design', status: 1 },
      { category_name: 'Business', description: 'Startup and business insights', status: 1 },
      { category_name: 'Lifestyle', description: 'Personal development and lifestyle', status: 1 },
      { category_name: 'Tutorial', description: 'Step-by-step tutorials', status: 1 }
    ], { ignoreDuplicates: true });

    // 4. Tạo Users
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    const users = await User.bulkCreate([
      {
        roleid: 1, // admin
        first_name: 'Admin',
        last_name: 'User',
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        status: 1,
        extra_info: JSON.stringify({ bio: 'System Administrator' })
      },
      {
        roleid: 2, // user
        first_name: 'John',
        last_name: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: userPassword,
        status: 1,
        extra_info: JSON.stringify({ bio: 'Tech enthusiast and blogger' })
      },
      {
        roleid: 2, // user
        first_name: 'Jane',
        last_name: 'Smith',
        username: 'janesmith',
        email: 'jane@example.com',
        password: userPassword,
        status: 1,
        extra_info: JSON.stringify({ bio: 'Frontend developer and designer' })
      },
      {
        roleid: 3, // moderator
        first_name: 'Mike',
        last_name: 'Wilson',
        username: 'mikewilson',
        email: 'mike@example.com',
        password: userPassword,
        status: 1,
        extra_info: JSON.stringify({ bio: 'Content moderator' })
      }
    ], { ignoreDuplicates: true });

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Created:
    - ${roles.length} roles
    - ${languages.length} languages  
    - ${categories.length} categories
    - ${users.length} users`);

    console.log(`
🔑 Login credentials:
Admin: admin@example.com / admin123
User: john@example.com / user123
User: jane@example.com / user123
Moderator: mike@example.com / user123
    `);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

module.exports = seedData;

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
  seedData().then(() => {
    console.log('🏁 Seeding process finished');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });
}
