const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';
let adminToken = '';
let testUserId = '';
let testPostId = '';
let testCategoryId = '';
let testCommentId = '';

// Store all test results
const testResults = {
  auth: {},
  users: {},
  categories: {},
  posts: {},
  comments: {},
  languages: {},
  roles: {},
  upload: {}
};

// Helper function to make API calls and log results
const apiCall = async (method, endpoint, data = null, token = null, description = '') => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      ...(data && { data })
    };

    console.log(`\n🔄 ${description}`);
    console.log(`${method.toUpperCase()} ${endpoint}`);
    if (data) {
      console.log('Request Body:', JSON.stringify(data, null, 2));
    }

    const response = await axios(config);
    
    console.log(`✅ Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));

    return { 
      success: true, 
      data: response.data, 
      status: response.status,
      request: { method, endpoint, data },
      response: response.data
    };
  } catch (error) {
    console.log(`❌ Status: ${error.response?.status || 'Network Error'}`);
    console.log('Error:', JSON.stringify(error.response?.data || error.message, null, 2));
    
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
      request: { method, endpoint, data },
      response: error.response?.data || { error: error.message }
    };
  }
};

// Test Auth APIs
const testAuth = async () => {
  console.log('\n🔐 ===== TESTING AUTH APIs =====');
  
  // Test register
  const registerData = {
    first_name: 'Test',
    last_name: 'User',
    email: `test_${Date.now()}@example.com`,
    username: `testuser_${Date.now()}`,
    password: 'password123'
  };
  
  const registerResult = await apiCall('POST', '/auth/register', registerData, null, 'User Registration');
  testResults.auth.register = registerResult;
  
  if (registerResult.success) {
    testUserId = registerResult.data.data?.userid || registerResult.data.data?.user?.userid;
  }
  
  // Test login
  const loginData = {
    username: registerData.username,
    password: registerData.password
  };
  
  const loginResult = await apiCall('POST', '/auth/login', loginData, null, 'User Login');
  testResults.auth.login = loginResult;
  
  if (loginResult.success) {
    authToken = loginResult.data.data?.accessToken || loginResult.data.data?.token;
  }
  
  // Test admin login
  const adminLoginData = {
    username: 'admin',
    password: 'admin123'
  };
  
  const adminLoginResult = await apiCall('POST', '/auth/login', adminLoginData, null, 'Admin Login');
  testResults.auth.adminLogin = adminLoginResult;
  
  if (adminLoginResult.success) {
    adminToken = adminLoginResult.data.data?.accessToken || adminLoginResult.data.data?.token;
  }
};

// Test Language APIs
const testLanguages = async () => {
  console.log('\n🌐 ===== TESTING LANGUAGE APIs =====');
  
  const languagesResult = await apiCall('GET', '/languages', null, authToken, 'Get All Languages');
  testResults.languages.getAll = languagesResult;
};

// Test Category APIs
const testCategories = async () => {
  console.log('\n📂 ===== TESTING CATEGORY APIs =====');
  
  // Create category
  const categoryData = {
    category_name: `Test Category ${Date.now()}`,
    status: 1
  };
  
  const createResult = await apiCall('POST', '/categories', categoryData, authToken, 'Create Category');
  testResults.categories.create = createResult;
  
  if (createResult.success) {
    testCategoryId = createResult.data.data?.categoryid || createResult.data.data?.category?.categoryid;
  }
  
  // Get all categories
  const getAllResult = await apiCall('GET', '/categories', null, authToken, 'Get All Categories');
  testResults.categories.getAll = getAllResult;
  
  // Get category by ID
  if (testCategoryId) {
    const getByIdResult = await apiCall('GET', `/categories/${testCategoryId}`, null, authToken, 'Get Category By ID');
    testResults.categories.getById = getByIdResult;
  }
};

// Test Post APIs
const testPosts = async () => {
  console.log('\n📝 ===== TESTING POST APIs =====');
  
  // Create post
  const postData = {
    title: `Test Post ${Date.now()}`,
    content: 'This is a test post content for API testing. It contains sample text to verify the post creation functionality.',
    languageid: 1,
    categoryids: testCategoryId ? [testCategoryId] : [1],
    status: 1
  };
  
  const createResult = await apiCall('POST', '/posts', postData, authToken, 'Create Post');
  testResults.posts.create = createResult;
  
  if (createResult.success) {
    testPostId = createResult.data.data?.postid || createResult.data.data?.post?.postid;
  }
  
  // Get all posts
  const getAllResult = await apiCall('GET', '/posts', null, authToken, 'Get All Posts');
  testResults.posts.getAll = getAllResult;
  
  // Get post by ID
  if (testPostId) {
    const getByIdResult = await apiCall('GET', `/posts/${testPostId}`, null, authToken, 'Get Post By ID');
    testResults.posts.getById = getByIdResult;
  }
};

// Test Upload APIs
const testUpload = async () => {
  console.log('\n📤 ===== TESTING UPLOAD APIs =====');
  
  // Get upload signature
  const signatureResult = await apiCall('GET', '/upload/signature', null, authToken, 'Get Upload Signature');
  testResults.upload.getSignature = signatureResult;
  
  // Upload by URL
  const uploadData = {
    url: 'https://via.placeholder.com/300x200.png?text=Test+Image'
  };
  
  const uploadResult = await apiCall('POST', '/upload/image-by-url', uploadData, authToken, 'Upload Image by URL');
  testResults.upload.uploadByUrl = uploadResult;
};

// Test Role APIs (Admin only)
const testRoles = async () => {
  console.log('\n👑 ===== TESTING ROLE APIs =====');
  
  const rolesResult = await apiCall('GET', '/roles', null, adminToken || authToken, 'Get All Roles');
  testResults.roles.getAll = rolesResult;
};

// Main test runner
const runAllTests = async () => {
  console.log('🚀 Starting Comprehensive API Testing...');
  console.log('Base URL:', BASE_URL);
  
  try {
    await testAuth();
    await testLanguages();
    await testCategories();
    await testPosts();
    await testUpload();
    await testRoles();
    
    // Save results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `api-test-results-${timestamp}.json`;
    
    fs.writeFileSync(filename, JSON.stringify(testResults, null, 2));
    
    console.log('\n✅ All tests completed!');
    console.log(`📄 Results saved to: ${filename}`);
    console.log('\n📊 Test Summary:');
    console.log(`- Auth Token: ${authToken ? 'Available' : 'Not available'}`);
    console.log(`- Admin Token: ${adminToken ? 'Available' : 'Not available'}`);
    console.log(`- Test User ID: ${testUserId || 'Not created'}`);
    console.log(`- Test Category ID: ${testCategoryId || 'Not created'}`);
    console.log(`- Test Post ID: ${testPostId || 'Not created'}`);
    
  } catch (error) {
    console.error('\n❌ Test runner error:', error);
  }
};

// Check if server is running
const checkServer = async () => {
  try {
    await axios.get(`${BASE_URL.replace('/api', '')}`);
    return true;
  } catch (error) {
    return false;
  }
};

// Start testing
(async () => {
  console.log('Checking if server is running...');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server is not running. Please start the server first:');
    console.log('npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Server is running');
  await runAllTests();
})();
