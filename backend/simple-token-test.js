const axios = require('axios');

async function simpleTokenTest() {
  console.log('🔍 Simple Token Test');
  console.log('===================');

  try {
    // Step 1: Login
    console.log('1. Login...');
    const loginResponse = await axios.post('http://localhost:4000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });

    if (loginResponse.data.success) {
      const { accessToken, refreshToken } = loginResponse.data.data;
      console.log('✅ Login successful');
      console.log('AccessToken:', accessToken.substring(0, 30) + '...');
      console.log('RefreshToken:', refreshToken ? refreshToken.substring(0, 30) + '...' : 'null');

      // Step 2: Test API call immediately
      console.log('\n2. Test API call with token...');
      const apiResponse = await axios.get('http://localhost:4000/api/posts', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      console.log('✅ API call successful');
      console.log('Status:', apiResponse.status);
      console.log('Posts count:', apiResponse.data.data?.posts?.length || 0);

      // Step 3: Test admin API
      console.log('\n3. Test admin API...');
      const adminResponse = await axios.get('http://localhost:4000/api/posts/admin/all', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      console.log('✅ Admin API call successful');
      console.log('Status:', adminResponse.status);
      console.log('Admin posts count:', adminResponse.data.data?.posts?.length || 0);

    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }

  } catch (error) {
    console.log('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
    
    if (error.response?.data) {
      console.log('Full error response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

simpleTokenTest();
