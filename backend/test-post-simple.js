const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

console.log('🚀 Starting Post API Test...');

// EditorJS content format
const editorJSContent = {
  time: Date.now(),
  blocks: [
    {
      id: "block1",
      type: "header",
      data: {
        text: "Test Header with EditorJS",
        level: 2
      }
    },
    {
      id: "block2", 
      type: "paragraph",
      data: {
        text: "This is a paragraph with <b>bold text</b> and <i>italic text</i>. This content is formatted using EditorJS structure for testing the Post API."
      }
    },
    {
      id: "block3",
      type: "list",
      data: {
        style: "unordered",
        items: [
          "First list item for testing",
          "Second list item with <mark>highlighted text</mark>",
          "Third list item to verify EditorJS structure"
        ]
      }
    }
  ],
  version: "2.31.0"
};

async function testPostAPI() {
  let authToken = '';
  let testPostId = '';
  
  try {
    // Step 1: Register user
    console.log('\n1️⃣ Testing User Registration...');
    const registerData = {
      first_name: 'Test',
      last_name: 'User',
      email: `test_${Date.now()}@example.com`,
      username: `testuser_${Date.now()}`,
      password: 'password123'
    };
    
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
    console.log('✅ Registration successful:', registerResponse.data);
    
    // Step 2: Login user
    console.log('\n2️⃣ Testing User Login...');
    const loginData = {
      username: registerData.username,
      password: registerData.password
    };
    
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
    console.log('✅ Login successful:', loginResponse.data);
    
    authToken = loginResponse.data.data.accessToken;
    console.log('🔑 Auth Token:', authToken.substring(0, 20) + '...');
    
    // Step 3: Create post with EditorJS content
    console.log('\n3️⃣ Testing Create Post with EditorJS Content...');
    const createPostData = {
      title: `Test Post with EditorJS ${Date.now()}`,
      content: JSON.stringify(editorJSContent),
      languageid: 1,
      categoryids: [1, 2],
      status: 1
    };
    
    console.log('📝 Post Data:');
    console.log('- Title:', createPostData.title);
    console.log('- Content Type: EditorJS JSON');
    console.log('- Content Preview:', JSON.stringify(editorJSContent, null, 2).substring(0, 200) + '...');
    
    const createResponse = await axios.post(`${BASE_URL}/posts`, createPostData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Post created successfully:', createResponse.data);
    
    testPostId = createResponse.data.data.postid;
    
    // Step 4: Get post by ID
    console.log('\n4️⃣ Testing Get Post by ID...');
    const getResponse = await axios.get(`${BASE_URL}/posts/${testPostId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Post retrieved successfully:', getResponse.data);
    
    // Verify EditorJS content
    const retrievedContent = JSON.parse(getResponse.data.data.content);
    console.log('📄 Retrieved EditorJS Content:');
    console.log('- Blocks count:', retrievedContent.blocks.length);
    console.log('- First block type:', retrievedContent.blocks[0].type);
    console.log('- Version:', retrievedContent.version);
    
    // Step 5: Update post
    console.log('\n5️⃣ Testing Update Post...');
    const updatedEditorJSContent = {
      ...editorJSContent,
      time: Date.now(),
      blocks: [
        ...editorJSContent.blocks,
        {
          id: "block4",
          type: "paragraph",
          data: {
            text: "This is an updated paragraph added to test the update functionality with EditorJS."
          }
        }
      ]
    };
    
    const updatePostData = {
      title: `Updated Test Post with EditorJS ${Date.now()}`,
      content: JSON.stringify(updatedEditorJSContent),
      status: 1
    };
    
    const updateResponse = await axios.put(`${BASE_URL}/posts/${testPostId}`, updatePostData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Post updated successfully:', updateResponse.data);
    
    // Step 6: Get all posts
    console.log('\n6️⃣ Testing Get All Posts...');
    const getAllResponse = await axios.get(`${BASE_URL}/posts`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ All posts retrieved:', getAllResponse.data);
    console.log('📊 Total posts:', getAllResponse.data.data.length);
    
    // Step 7: Test invalid EditorJS content
    console.log('\n7️⃣ Testing Invalid EditorJS Content...');
    const invalidPostData = {
      title: `Invalid EditorJS Test ${Date.now()}`,
      content: JSON.stringify({ invalid: "structure", missing: "blocks" }),
      languageid: 1,
      status: 0
    };
    
    try {
      const invalidResponse = await axios.post(`${BASE_URL}/posts`, invalidPostData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('⚠️ Invalid content was accepted (might be auto-corrected):', invalidResponse.data);
    } catch (error) {
      console.log('✅ Invalid content was rejected:', error.response?.data || error.message);
    }
    
    console.log('\n🎉 All Post API tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log(`- ✅ User Registration: Success`);
    console.log(`- ✅ User Login: Success`);
    console.log(`- ✅ Create Post with EditorJS: Success`);
    console.log(`- ✅ Get Post by ID: Success`);
    console.log(`- ✅ Update Post: Success`);
    console.log(`- ✅ Get All Posts: Success`);
    console.log(`- ✅ Invalid Content Test: Completed`);
    console.log(`\n🔑 Test Post ID: ${testPostId}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run the test
testPostAPI();
