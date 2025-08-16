const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testCommentsSimple() {
  try {
    console.log('🚀 Testing Comment API (Simple)...\n');
    
    // Step 1: Register and login
    const timestamp = Date.now();
    console.log('1️⃣ Setting up authentication...');
    
    const registerData = {
      first_name: 'Simple',
      last_name: 'Tester',
      email: `simpletest_${timestamp}@example.com`,
      username: `simpletest_${timestamp}`,
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
      title: `Simple Comment Test Post ${timestamp}`,
      content: JSON.stringify({
        time: timestamp,
        blocks: [
          {
            id: "simple_block",
            type: "paragraph",
            data: {
              text: "This is a simple test post for comment testing."
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
    
    // Step 3: Create root comment
    console.log('\n3️⃣ Creating root comment...');
    const rootCommentData = {
      content: "This is a root comment for testing.",
      parent_id: null
    };
    
    const rootCommentResponse = await axios.post(
      `${BASE_URL}/posts/${testPostId}/comments`, 
      rootCommentData, 
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('✅ Root comment created:');
    console.log('Response:', JSON.stringify(rootCommentResponse.data, null, 2));
    
    const rootCommentId = rootCommentResponse.data.data.comment.commentid;
    
    // Step 4: Create reply comment
    console.log('\n4️⃣ Creating reply comment...');
    const replyCommentData = {
      content: "This is a reply to the root comment.",
      parent_id: rootCommentId
    };
    
    const replyCommentResponse = await axios.post(
      `${BASE_URL}/posts/${testPostId}/comments`, 
      replyCommentData, 
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('✅ Reply comment created:');
    console.log('Response:', JSON.stringify(replyCommentResponse.data, null, 2));
    
    // Step 5: Get comments for post
    console.log('\n5️⃣ Getting comments for post...');
    const getCommentsResponse = await axios.get(
      `${BASE_URL}/posts/${testPostId}/comments`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('✅ Comments retrieved:');
    console.log('Response:', JSON.stringify(getCommentsResponse.data, null, 2));
    
    // Step 6: Get comment tree
    console.log('\n6️⃣ Getting comment tree...');
    const getTreeResponse = await axios.get(
      `${BASE_URL}/posts/${testPostId}/comments/tree`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('✅ Comment tree retrieved:');
    console.log('Response:', JSON.stringify(getTreeResponse.data, null, 2));
    
    // Step 7: Update comment
    console.log('\n7️⃣ Updating comment...');
    const updateData = {
      content: "This is an updated root comment content."
    };
    
    const updateResponse = await axios.put(
      `${BASE_URL}/comments/${rootCommentId}`, 
      updateData, 
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('✅ Comment updated:');
    console.log('Response:', JSON.stringify(updateResponse.data, null, 2));
    
    console.log('\n🎉 All comment tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
    }
  }
}

// Run the test
testCommentsSimple();
