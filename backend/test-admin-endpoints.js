const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api';

async function testAdminEndpoints() {
  try {
    console.log('🚀 Testing Admin Endpoints...\n');
    
    // Step 1: Register and login as admin
    const timestamp = Date.now();
    console.log('1️⃣ Setting up admin authentication...');
    
    const registerData = {
      first_name: 'Admin',
      last_name: 'Tester',
      email: `admin_${timestamp}@example.com`,
      username: `admin_${timestamp}`,
      password: 'password123'
    };
    
    await axios.post(`${BASE_URL}/auth/register`, registerData);
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: registerData.username,
      password: registerData.password
    });
    
    const authToken = loginResponse.data.data.accessToken;
    console.log('✅ Authentication successful');
    
    // Step 2: Test Language Admin Endpoints
    console.log('\n2️⃣ Testing Language Admin Endpoints...');
    
    try {
      const languagesResponse = await axios.get(`${BASE_URL}/languages/admin/languages`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ GET /languages/admin/languages - Success');
      console.log('Languages found:', languagesResponse.data.data?.data?.length || 0);
    } catch (error) {
      console.log('❌ GET /languages/admin/languages - Failed:', error.response?.status, error.response?.data?.error);
    }
    
    // Step 3: Test User Admin Endpoints
    console.log('\n3️⃣ Testing User Admin Endpoints...');
    
    try {
      const usersResponse = await axios.get(`${BASE_URL}/users/admin/users`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ GET /users/admin/users - Success');
      console.log('Users found:', usersResponse.data.data?.length || 0);
    } catch (error) {
      console.log('❌ GET /users/admin/users - Failed:', error.response?.status, error.response?.data?.error);
    }
    
    // Step 4: Test other endpoints
    console.log('\n4️⃣ Testing other endpoints...');
    
    // Test public language endpoint
    try {
      const publicLangResponse = await axios.get(`${BASE_URL}/languages`);
      console.log('✅ GET /languages (public) - Success');
      console.log('Public languages found:', publicLangResponse.data.data?.data?.length || 0);
    } catch (error) {
      console.log('❌ GET /languages (public) - Failed:', error.response?.status);
    }
    
    // Test categories
    try {
      const categoriesResponse = await axios.get(`${BASE_URL}/categories`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ GET /categories - Success');
      console.log('Categories found:', categoriesResponse.data.data?.length || 0);
    } catch (error) {
      console.log('❌ GET /categories - Failed:', error.response?.status);
    }
    
    console.log('\n🎉 Admin endpoints test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
    }
  }
}

// Run the test
testAdminEndpoints();
