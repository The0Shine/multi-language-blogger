const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function debugComment() {
  try {
    console.log('🔍 Debug Comment Creation...\n');
    
    // Step 1: Register and login
    const timestamp = Date.now();
    console.log('1️⃣ Registering user...');
    
    const registerData = {
      first_name: 'Debug',
      last_name: 'Comment',
      email: `debugcomment_${timestamp}@example.com`,
      username: `debugcomment_${timestamp}`,
      password: 'password123'
    };
    
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
    console.log('✅ Registration response:', registerResponse.status);
    
    console.log('2️⃣ Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: registerData.username,
      password: registerData.password
    });
    console.log('✅ Login response:', loginResponse.status);
    
    const authToken = loginResponse.data.data.accessToken;
    console.log('🔑 Token obtained:', authToken.substring(0, 20) + '...\n');
    
    // Step 2: Create a simple post
    console.log('3️⃣ Creating test post...');
    const postData = {
      title: `Debug Comment Post ${timestamp}`,
      content: JSON.stringify({
        time: timestamp,
        blocks: [
          {
            id: "debug_block",
            type: "paragraph",
            data: {
              text: "This is a debug post for comment testing."
            }
          }
        ],
        version: "2.31.0"
      }),
      languageid: 1,
      status: 1
    };
    
    const createPostResponse = await axios.post(`${BASE_URL}/posts`, postData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Post created:', createPostResponse.status);
    const testPostId = createPostResponse.data.data.post.postid;
    console.log('📝 Test Post ID:', testPostId);
    
    // Step 3: Try to create comment with detailed logging
    console.log('\n4️⃣ Creating comment...');
    
    const commentData = {
      content: "This is a debug comment to test the comment creation functionality.",
      parent_id: null
    };
    
    console.log('📝 Comment request data:');
    console.log('- URL:', `${BASE_URL}/posts/${testPostId}/comments`);
    console.log('- Method: POST');
    console.log('- Headers: Authorization: Bearer', authToken.substring(0, 20) + '...');
    console.log('- Body:', JSON.stringify(commentData, null, 2));
    
    try {
      const createCommentResponse = await axios.post(
        `${BASE_URL}/posts/${testPostId}/comments`, 
        commentData, 
        {
          headers: { 
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Comment created successfully:');
      console.log('Status:', createCommentResponse.status);
      console.log('Response:', JSON.stringify(createCommentResponse.data, null, 2));
      
    } catch (error) {
      console.log('❌ Comment creation failed:');
      console.log('Status:', error.response?.status);
      console.log('Error data:', JSON.stringify(error.response?.data, null, 2));
      console.log('Error message:', error.message);
      
      // Try to get more details from server logs
      console.log('\n🔍 Check server logs for detailed error information');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
  }
}

// Run debug
debugComment();
