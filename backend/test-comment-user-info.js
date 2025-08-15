const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testCommentUserInfo() {
  try {
    console.log('🚀 Testing Comment API with User Information...\n');
    
    // Step 1: Register and login
    const timestamp = Date.now();
    console.log('1️⃣ Setting up authentication...');
    
    const registerData = {
      first_name: 'UserInfo',
      last_name: 'Tester',
      email: `userinfo_${timestamp}@example.com`,
      username: `userinfo_${timestamp}`,
      password: 'password123'
    };
    
    await axios.post(`${BASE_URL}/auth/register`, registerData);
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: registerData.username,
      password: registerData.password
    });
    
    const authToken = loginResponse.data.data.accessToken;
    console.log('✅ Authentication successful');
    
    // Step 2: Create a test post
    console.log('\n2️⃣ Creating test post...');
    const postData = {
      title: `User Info Comment Test Post ${timestamp}`,
      content: JSON.stringify({
        time: timestamp,
        blocks: [
          {
            id: "userinfo_block",
            type: "paragraph",
            data: {
              text: "This is a test post for comment user info testing."
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
    
    const testPostId = createPostResponse.data.data.post.postid;
    console.log('✅ Test post created, ID:', testPostId);
    
    // Step 3: Create comment
    console.log('\n3️⃣ Creating comment...');
    const commentData = {
      content: "This is a test comment to verify user information is included in the response.",
      parent_id: null
    };
    
    const createCommentResponse = await axios.post(
      `${BASE_URL}/posts/${testPostId}/comments`, 
      commentData, 
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('✅ Comment created:');
    console.log('Response:', JSON.stringify(createCommentResponse.data, null, 2));
    
    // Step 4: Get comments to verify user info
    console.log('\n4️⃣ Getting comments to verify user info...');
    const getCommentsResponse = await axios.get(
      `${BASE_URL}/posts/${testPostId}/comments`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('✅ Comments retrieved:');
    console.log('Response:', JSON.stringify(getCommentsResponse.data, null, 2));
    
    // Step 5: Get comment tree to verify user info
    console.log('\n5️⃣ Getting comment tree to verify user info...');
    const getTreeResponse = await axios.get(
      `${BASE_URL}/posts/${testPostId}/comments/tree`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('✅ Comment tree retrieved:');
    console.log('Response:', JSON.stringify(getTreeResponse.data, null, 2));
    
    // Step 6: Verify user information structure
    console.log('\n6️⃣ Verifying user information structure...');
    
    if (getCommentsResponse.data.data && getCommentsResponse.data.data.items) {
      const firstComment = getCommentsResponse.data.data.items[0];
      console.log('📋 First comment structure:');
      console.log('- Comment ID:', firstComment.commentid);
      console.log('- Author (username):', firstComment.author);
      console.log('- Author User Info:', firstComment.authorUser);
      
      if (firstComment.authorUser) {
        console.log('  - User ID:', firstComment.authorUser.userid);
        console.log('  - First Name:', firstComment.authorUser.first_name);
        console.log('  - Last Name:', firstComment.authorUser.last_name);
        console.log('  - Username:', firstComment.authorUser.username);
        console.log('✅ User information is properly enriched!');
      } else {
        console.log('⚠️ User information is missing from comment');
      }
    }
    
    console.log('\n🎉 Comment user info test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
    }
  }
}

// Run the test
testCommentUserInfo();
