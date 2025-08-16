const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api';

async function testAdminPosts() {
  try {
    console.log('🚀 Testing Admin Posts Endpoint...\n');
    
    // Step 1: Register and login
    const timestamp = Date.now();
    console.log('1️⃣ Setting up authentication...');
    
    const registerData = {
      first_name: 'Admin',
      last_name: 'Posts',
      email: `adminposts_${timestamp}@example.com`,
      username: `adminposts_${timestamp}`,
      password: 'password123'
    };
    
    await axios.post(`${BASE_URL}/auth/register`, registerData);
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: registerData.username,
      password: registerData.password
    });
    
    const authToken = loginResponse.data.data.accessToken;
    console.log('✅ Authentication successful');
    
    // Step 2: Test Admin Posts Endpoint
    console.log('\n2️⃣ Testing Admin Posts Endpoint...');
    
    try {
      const adminPostsResponse = await axios.get(`${BASE_URL}/posts/admin/all`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      console.log('✅ GET /posts/admin/all - Success');
      console.log('Response structure:', {
        success: adminPostsResponse.data.success,
        dataKeys: Object.keys(adminPostsResponse.data.data || {}),
        postsCount: adminPostsResponse.data.data?.posts?.length || 0,
        pagination: adminPostsResponse.data.data?.pagination || null
      });
      
      // Check first post structure
      if (adminPostsResponse.data.data?.posts?.length > 0) {
        const firstPost = adminPostsResponse.data.data.posts[0];
        console.log('\n📋 First post structure:');
        console.log('- Post ID:', firstPost.postid);
        console.log('- Title:', firstPost.title);
        console.log('- Status:', firstPost.status);
        console.log('- Author object:', firstPost.author ? 'Present' : 'Missing');
        console.log('- Language object:', firstPost.language ? 'Present' : 'Missing');
        console.log('- Categories array:', Array.isArray(firstPost.categories) ? `${firstPost.categories.length} items` : 'Missing');
        
        if (firstPost.author) {
          console.log('  - Author username:', firstPost.author.username);
          console.log('  - Author name:', `${firstPost.author.first_name} ${firstPost.author.last_name}`);
        }
        
        if (firstPost.language) {
          console.log('  - Language name:', firstPost.language.language_name);
          console.log('  - Language code:', firstPost.language.locale_code);
        }
      }
      
    } catch (error) {
      console.log('❌ GET /posts/admin/all - Failed:', error.response?.status, error.response?.data?.error);
      if (error.response?.data) {
        console.log('Error details:', error.response.data);
      }
    }
    
    // Step 3: Test Regular Posts Endpoint for comparison
    console.log('\n3️⃣ Testing Regular Posts Endpoint for comparison...');
    
    try {
      const regularPostsResponse = await axios.get(`${BASE_URL}/posts`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      console.log('✅ GET /posts - Success');
      console.log('Regular posts count:', regularPostsResponse.data.data?.posts?.length || 0);
      
    } catch (error) {
      console.log('❌ GET /posts - Failed:', error.response?.status);
    }
    
    console.log('\n🎉 Admin posts test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
    }
  }
}

// Run the test
testAdminPosts();
