const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

console.log('🚀 Testing Comment API...');

async function testComments() {
  let authToken = '';
  let testPostId = '';
  let testCommentId = '';
  
  try {
    // Step 1: Register and login
    console.log('\n1️⃣ Setting up authentication...');
    const timestamp = Date.now();
    
    const registerData = {
      first_name: 'Comment',
      last_name: 'Tester',
      email: `commenttest_${timestamp}@example.com`,
      username: `commenttester_${timestamp}`,
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
    console.log('🔑 Token obtained');
    
    // Step 2: Create a test post first
    console.log('\n2️⃣ Creating test post...');
    
    const editorJSContent = {
      time: timestamp,
      blocks: [
        {
          id: "comment_test_block",
          type: "header",
          data: {
            text: "Test Post for Comments",
            level: 2
          }
        },
        {
          id: "comment_test_block_2",
          type: "paragraph",
          data: {
            text: "This post is created to test the comment functionality."
          }
        }
      ],
      version: "2.31.0"
    };
    
    const postData = {
      title: `Comment Test Post ${timestamp}`,
      content: JSON.stringify(editorJSContent),
      languageid: 1,
      status: 1
    };
    
    const createPostResponse = await axios.post(`${BASE_URL}/posts`, postData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Test post created');
    testPostId = createPostResponse.data.data.post.postid;
    console.log('📝 Test Post ID:', testPostId);
    
    // Step 3: Test create comment
    console.log('\n3️⃣ Testing create comment...');
    
    const commentData = {
      content: "This is a test comment for the post. Testing comment functionality!",
      parent_id: null // Root comment
    };
    
    console.log('📝 Comment data:');
    console.log('- Content:', commentData.content);
    console.log('- Parent ID:', commentData.parent_id);
    
    const createCommentResponse = await axios.post(
      `${BASE_URL}/posts/${testPostId}/comments`, 
      commentData, 
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('✅ Comment created successfully:');
    console.log(JSON.stringify(createCommentResponse.data, null, 2));
    
    testCommentId = createCommentResponse.data.data.comment.commentid;
    
    // Step 4: Test get comments for post
    console.log('\n4️⃣ Testing get comments for post...');
    
    const getCommentsResponse = await axios.get(
      `${BASE_URL}/posts/${testPostId}/comments`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('✅ Comments retrieved:');
    console.log(JSON.stringify(getCommentsResponse.data, null, 2));
    
    // Step 5: Test create reply comment
    console.log('\n5️⃣ Testing create reply comment...');
    
    const replyData = {
      content: "This is a reply to the first comment. Testing nested comments!",
      parent_id: testCommentId
    };
    
    const createReplyResponse = await axios.post(
      `${BASE_URL}/posts/${testPostId}/comments`, 
      replyData, 
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('✅ Reply comment created:');
    console.log(JSON.stringify(createReplyResponse.data, null, 2));
    
    // Step 6: Test get comment tree
    console.log('\n6️⃣ Testing get comment tree...');
    
    const getTreeResponse = await axios.get(
      `${BASE_URL}/posts/${testPostId}/comments/tree`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('✅ Comment tree retrieved:');
    console.log(JSON.stringify(getTreeResponse.data, null, 2));
    
    // Step 7: Test update comment
    console.log('\n7️⃣ Testing update comment...');
    
    const updateData = {
      content: "This is an updated comment content. Testing comment update functionality!"
    };
    
    const updateResponse = await axios.put(
      `${BASE_URL}/comments/${testCommentId}`, 
      updateData, 
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('✅ Comment updated:');
    console.log(JSON.stringify(updateResponse.data, null, 2));
    
    // Step 8: Test get comments with pagination
    console.log('\n8️⃣ Testing get comments with pagination...');
    
    // Create a few more comments for pagination test
    for (let i = 1; i <= 3; i++) {
      await axios.post(
        `${BASE_URL}/posts/${testPostId}/comments`, 
        {
          content: `Additional test comment #${i} for pagination testing.`,
          parent_id: null
        }, 
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
    }
    
    const paginatedResponse = await axios.get(
      `${BASE_URL}/posts/${testPostId}/comments?page=1&limit=2`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('✅ Paginated comments retrieved:');
    console.log(JSON.stringify(paginatedResponse.data, null, 2));
    
    // Step 9: Test comments on translated post
    console.log('\n9️⃣ Testing comments on translated post...');
    
    // Create multi-language post
    const multiLangPostData = {
      title: `Multi-Lang Comment Test ${timestamp}`,
      content: JSON.stringify(editorJSContent),
      languageid: 1,
      create_for_all_languages: true,
      status: 1
    };
    
    const multiLangResponse = await axios.post(`${BASE_URL}/posts`, multiLangPostData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const originalPostId = multiLangResponse.data.data.post.postid;
    console.log('📝 Multi-language post created, original ID:', originalPostId);
    
    // Get all posts to find translated versions
    const allPostsResponse = await axios.get(`${BASE_URL}/posts`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    // Find translated post
    let translatedPost = null;
    if (allPostsResponse.data.data && allPostsResponse.data.data.posts) {
      translatedPost = allPostsResponse.data.data.posts.find(
        post => post.originalid === originalPostId && post.languageid !== 1
      );
    }
    
    if (translatedPost) {
      console.log('📝 Found translated post ID:', translatedPost.postid);
      
      // Add comment to original post
      await axios.post(
        `${BASE_URL}/posts/${originalPostId}/comments`, 
        {
          content: "Comment on original post (English)",
          parent_id: null
        }, 
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
      
      // Get comments from translated post (should show same comments)
      const translatedCommentsResponse = await axios.get(
        `${BASE_URL}/posts/${translatedPost.postid}/comments`,
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
      
      console.log('✅ Comments from translated post (should share with original):');
      console.log(JSON.stringify(translatedCommentsResponse.data, null, 2));
    }
    
    // Step 10: Test error cases
    console.log('\n🔟 Testing error cases...');
    
    // Test comment on non-existent post
    try {
      await axios.post(
        `${BASE_URL}/posts/99999/comments`, 
        {
          content: "Comment on non-existent post",
          parent_id: null
        }, 
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
    } catch (error) {
      console.log('✅ Error for non-existent post:', error.response?.status, error.response?.data?.error);
    }
    
    // Test comment without authentication
    try {
      await axios.post(
        `${BASE_URL}/posts/${testPostId}/comments`, 
        {
          content: "Unauthorized comment",
          parent_id: null
        }
      );
    } catch (error) {
      console.log('✅ Error for unauthorized request:', error.response?.status, error.response?.data?.error);
    }
    
    console.log('\n🎉 All comment tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

// Run the test
testComments();
