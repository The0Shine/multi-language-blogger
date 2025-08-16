const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

console.log('🚀 Testing Post Creation with Categories...');

// EditorJS content format
const editorJSContent = {
  time: Date.now(),
  blocks: [
    {
      id: "cat_block_1",
      type: "header",
      data: {
        text: "Post with Categories Test",
        level: 2
      }
    },
    {
      id: "cat_block_2", 
      type: "paragraph",
      data: {
        text: "This post will be created with multiple categories to test the category assignment functionality."
      }
    },
    {
      id: "cat_block_3",
      type: "list",
      data: {
        style: "unordered",
        items: [
          "Test category assignment",
          "Verify category relationships",
          "Check multi-language category support"
        ]
      }
    }
  ],
  version: "2.31.0"
};

async function testPostWithCategories() {
  let authToken = '';
  let testPostId = '';
  
  try {
    // Step 1: Register and login
    console.log('\n1️⃣ Setting up authentication...');
    const timestamp = Date.now();
    
    const registerData = {
      first_name: 'Category',
      last_name: 'Tester',
      email: `cattest_${timestamp}@example.com`,
      username: `cattester_${timestamp}`,
      password: 'password123'
    };
    
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
    console.log('✅ Registration successful');
    
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: registerData.username,
      password: registerData.password
    });
    console.log('✅ Login successful');
    
    authToken = loginResponse.data.data.accessToken;
    
    // Step 2: Get available categories
    console.log('\n2️⃣ Getting available categories...');
    const categoriesResponse = await axios.get(`${BASE_URL}/categories`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('📋 Categories response data:', JSON.stringify(categoriesResponse.data, null, 2));
    
    // Handle different response formats
    let categories = [];
    if (categoriesResponse.data.data && categoriesResponse.data.data.data && Array.isArray(categoriesResponse.data.data.data)) {
      categories = categoriesResponse.data.data.data;
    } else if (categoriesResponse.data.data && Array.isArray(categoriesResponse.data.data)) {
      categories = categoriesResponse.data.data;
    } else if (Array.isArray(categoriesResponse.data)) {
      categories = categoriesResponse.data;
    }
    
    console.log('📋 Available categories:');
    categories.forEach(cat => {
      console.log(`   - ${cat.category_name} (ID: ${cat.categoryid})`);
    });
    
    if (categories.length === 0) {
      console.log('⚠️ No categories found. Creating test categories...');
      
      // Create test categories
      const testCategories = [
        { category_name: 'Technology', status: 1 },
        { category_name: 'Tutorial', status: 1 },
        { category_name: 'Testing', status: 1 }
      ];
      
      for (const catData of testCategories) {
        const createCatResponse = await axios.post(`${BASE_URL}/categories`, catData, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log(`✅ Created category: ${catData.category_name}`);
        categories.push({
          categoryid: createCatResponse.data.data.categoryid,
          category_name: catData.category_name,
          status: 1
        });
      }
    }
    
    // Step 3: Test create post with single category
    console.log('\n3️⃣ Testing create post with single category...');
    const singleCatPostData = {
      title: `Single Category Post ${timestamp}`,
      content: JSON.stringify(editorJSContent),
      languageid: 1,
      categoryids: [categories[0].categoryid],
      status: 1
    };
    
    console.log('📝 Single category post data:');
    console.log('- Title:', singleCatPostData.title);
    console.log('- Categories:', singleCatPostData.categoryids);
    
    const singleCatResponse = await axios.post(`${BASE_URL}/posts`, singleCatPostData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Single category post created:');
    console.log(JSON.stringify(singleCatResponse.data, null, 2));
    
    // Step 4: Test create post with multiple categories
    console.log('\n4️⃣ Testing create post with multiple categories...');
    const multiCatPostData = {
      title: `Multi Category Post ${timestamp}`,
      content: JSON.stringify({
        ...editorJSContent,
        blocks: [
          ...editorJSContent.blocks,
          {
            id: "cat_block_4",
            type: "paragraph",
            data: {
              text: "This post has multiple categories assigned to test the many-to-many relationship."
            }
          }
        ]
      }),
      languageid: 1,
      categoryids: categories.slice(0, Math.min(3, categories.length)).map(cat => cat.categoryid),
      create_for_all_languages: true,
      status: 1
    };
    
    console.log('📝 Multi category post data:');
    console.log('- Title:', multiCatPostData.title);
    console.log('- Categories:', multiCatPostData.categoryids);
    console.log('- create_for_all_languages:', multiCatPostData.create_for_all_languages);
    
    const multiCatResponse = await axios.post(`${BASE_URL}/posts`, multiCatPostData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Multi category post created:');
    console.log(JSON.stringify(multiCatResponse.data, null, 2));
    
    testPostId = multiCatResponse.data.data.post.postid;
    
    // Step 5: Get post by ID to verify categories
    console.log('\n5️⃣ Verifying post categories...');
    const getPostResponse = await axios.get(`${BASE_URL}/posts/${testPostId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Post retrieved with categories:');
    console.log(JSON.stringify(getPostResponse.data, null, 2));
    
    // Step 6: Test create post with no categories
    console.log('\n6️⃣ Testing create post with no categories...');
    const noCatPostData = {
      title: `No Category Post ${timestamp}`,
      content: JSON.stringify(editorJSContent),
      languageid: 2, // Vietnamese
      categoryids: [],
      status: 1
    };
    
    const noCatResponse = await axios.post(`${BASE_URL}/posts`, noCatPostData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ No category post created:');
    console.log(JSON.stringify(noCatResponse.data, null, 2));
    
    // Step 7: Test update post categories
    console.log('\n7️⃣ Testing update post categories...');
    const updateData = {
      title: `Updated Multi Category Post ${timestamp}`,
      categoryids: [categories[categories.length - 1].categoryid] // Change to last category only
    };
    
    const updateResponse = await axios.put(`${BASE_URL}/posts/${testPostId}`, updateData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Post categories updated:');
    console.log(JSON.stringify(updateResponse.data, null, 2));
    
    // Step 8: Verify updated categories
    console.log('\n8️⃣ Verifying updated categories...');
    const verifyResponse = await axios.get(`${BASE_URL}/posts/${testPostId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Updated post verified:');
    console.log('Categories:', verifyResponse.data.data.categories);
    
    // Step 9: Get all posts to see category relationships
    console.log('\n9️⃣ Getting all posts to verify category relationships...');
    const allPostsResponse = await axios.get(`${BASE_URL}/posts`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    // Handle different response formats for posts
    let posts = [];
    if (allPostsResponse.data.data && allPostsResponse.data.data.posts && Array.isArray(allPostsResponse.data.data.posts)) {
      posts = allPostsResponse.data.data.posts;
    } else if (allPostsResponse.data.data && Array.isArray(allPostsResponse.data.data)) {
      posts = allPostsResponse.data.data;
    } else if (Array.isArray(allPostsResponse.data)) {
      posts = allPostsResponse.data;
    }
    
    console.log('📊 Posts with categories:');
    posts.slice(0, 5).forEach(post => {
      console.log(`- Post ID: ${post.postid}, Title: "${post.title}"`);
      console.log(`  Language: ${post.language?.language_name || 'Unknown'}`);
      console.log(`  Categories: ${post.categories?.map(cat => cat.category_name).join(', ') || 'None'}`);
      console.log('');
    });
    
    console.log('\n🎉 All category tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

// Run the test
testPostWithCategories();
