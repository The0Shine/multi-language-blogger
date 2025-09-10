const { Post, User, Category, Language } = require('../models');

async function seedPosts() {
  try {
    console.log('📝 Creating sample posts...');

    // Lấy users, categories, languages đã tạo
    const users = await User.findAll();
    const categories = await Category.findAll();
    const languages = await Language.findAll();

    if (!users.length || !categories.length || !languages.length) {
      console.log('❌ Please run seed-data.js first to create users, categories, and languages');
      return;
    }

    const samplePosts = [
      {
        userid: users[1].userid, // John Doe
        categoryid: categories[0].categoryid, // Technology
        languageid: languages[0].languageid, // English
        title: 'Getting Started with Node.js and Express',
        content: JSON.stringify({
          "time": 1640995200000,
          "blocks": [
            {
              "type": "header",
              "data": {
                "text": "Introduction to Node.js",
                "level": 2
              }
            },
            {
              "type": "paragraph",
              "data": {
                "text": "Node.js is a powerful JavaScript runtime built on Chrome's V8 JavaScript engine. It allows developers to build scalable network applications using JavaScript on the server side."
              }
            },
            {
              "type": "list",
              "data": {
                "style": "unordered",
                "items": [
                  "Fast and efficient",
                  "Large ecosystem (npm)",
                  "Great for real-time applications",
                  "Single language for frontend and backend"
                ]
              }
            }
          ],
          "version": "2.22.2"
        }),
        status: 'published',
        featured_image: 'https://via.placeholder.com/800x400/4CAF50/white?text=Node.js+Tutorial',
        excerpt: 'Learn the basics of Node.js and how to build your first web application with Express framework.'
      },
      {
        userid: users[2].userid, // Jane Smith
        categoryid: categories[2].categoryid, // Web Development
        languageid: languages[0].languageid, // English
        title: 'Modern CSS Grid Layout Techniques',
        content: JSON.stringify({
          "time": 1640995200000,
          "blocks": [
            {
              "type": "header",
              "data": {
                "text": "CSS Grid Revolution",
                "level": 2
              }
            },
            {
              "type": "paragraph",
              "data": {
                "text": "CSS Grid Layout is a two-dimensional layout system for the web. It lets you lay content out in rows and columns, and has many features that make building complex layouts straightforward."
              }
            },
            {
              "type": "code",
              "data": {
                "code": ".container {\\n  display: grid;\\n  grid-template-columns: repeat(3, 1fr);\\n  gap: 20px;\\n}"
              }
            }
          ],
          "version": "2.22.2"
        }),
        status: 'published',
        featured_image: 'https://via.placeholder.com/800x400/2196F3/white?text=CSS+Grid+Layout',
        excerpt: 'Master modern CSS Grid techniques to create responsive and flexible web layouts.'
      },
      {
        userid: users[1].userid, // John Doe
        categoryid: categories[4].categoryid, // Data Science
        languageid: languages[1].languageid, // Vietnamese
        title: 'Giới thiệu về Machine Learning với Python',
        content: JSON.stringify({
          "time": 1640995200000,
          "blocks": [
            {
              "type": "header",
              "data": {
                "text": "Machine Learning là gì?",
                "level": 2
              }
            },
            {
              "type": "paragraph",
              "data": {
                "text": "Machine Learning (Học máy) là một nhánh của trí tuệ nhân tạo (AI) cho phép máy tính học hỏi và đưa ra quyết định từ dữ liệu mà không cần được lập trình cụ thể."
              }
            }
          ],
          "version": "2.22.2"
        }),
        status: 'published',
        featured_image: 'https://via.placeholder.com/800x400/FF9800/white?text=Machine+Learning',
        excerpt: 'Tìm hiểu các khái niệm cơ bản về Machine Learning và cách áp dụng với Python.'
      }
    ];

    const posts = await Post.bulkCreate(samplePosts, { ignoreDuplicates: true });

    console.log(`✅ Created ${posts.length} sample posts successfully!`);

  } catch (error) {
    console.error('❌ Error creating sample posts:', error);
  }
}

module.exports = seedPosts;

if (require.main === module) {
  seedPosts().then(() => {
    console.log('🏁 Posts seeding finished');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Posts seeding failed:', error);
    process.exit(1);
  });
}
