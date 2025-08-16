const axios = require('axios');

async function testPostDetail() {
  console.log('🔍 Testing Post Detail API');
  console.log('==========================');

  try {
    // Step 1: Login to get token
    console.log('1. Login...');
    const loginResponse = await axios.post('http://localhost:4000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }

    const token = loginResponse.data.data.accessToken;
    console.log('✅ Login successful');

    // Step 2: Get list of posts first
    console.log('\n2. Getting posts list...');
    const postsResponse = await axios.get('http://localhost:4000/api/posts', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (postsResponse.data.success && postsResponse.data.data?.posts?.length > 0) {
      const firstPost = postsResponse.data.data.posts[0];
      console.log(`✅ Found ${postsResponse.data.data.posts.length} posts`);
      console.log(`First post ID: ${firstPost.postid}, Title: ${firstPost.title}`);

      // Step 3: Test post detail API
      console.log(`\n3. Testing post detail for ID ${firstPost.postid}...`);
      const detailResponse = await axios.get(`http://localhost:4000/api/posts/${firstPost.postid}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (detailResponse.data.success) {
        console.log('✅ Post detail API successful');
        console.log('Post title:', detailResponse.data.data.post.title);
        console.log('Post author:', detailResponse.data.data.post.author?.username);
        console.log('Post language:', detailResponse.data.data.post.language?.language_name);
        console.log('Comments count:', detailResponse.data.data.post.comments?.length || 0);
        
        if (detailResponse.data.data.post.comments?.length > 0) {
          console.log('First comment:', detailResponse.data.data.post.comments[0].content);
        }
      } else {
        console.log('❌ Post detail failed:', detailResponse.data.message);
      }

    } else {
      console.log('❌ No posts found to test');
    }

  } catch (error) {
    console.log('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
    
    if (error.response?.status === 500) {
      console.log('🔍 This is the 500 error we fixed!');
      console.log('Full error response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testPostDetail();
