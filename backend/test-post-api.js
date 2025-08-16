const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";
let authToken = "";
let testUserId = "";
let testPostId = "";

// EditorJS content format for testing
const editorJSContent = {
  time: Date.now(),
  blocks: [
    {
      id: "block1",
      type: "header",
      data: {
        text: "This is a test header",
        level: 2,
      },
    },
    {
      id: "block2",
      type: "paragraph",
      data: {
        text: "This is a paragraph with <b>bold text</b> and <i>italic text</i>. This content is formatted using EditorJS structure.",
      },
    },
    {
      id: "block3",
      type: "list",
      data: {
        style: "unordered",
        items: [
          "First list item",
          "Second list item with <mark>highlighted text</mark>",
          "Third list item",
        ],
      },
    },
    {
      id: "block4",
      type: "paragraph",
      data: {
        text: "Another paragraph to test the EditorJS content structure. This should be properly validated and stored.",
      },
    },
  ],
  version: "2.31.0",
};

// Helper function to make API calls
const apiCall = async (
  method,
  endpoint,
  data = null,
  token = null,
  description = ""
) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...(data && { data }),
    };

    console.log(`\n🔄 ${description}`);
    console.log(`${method.toUpperCase()} ${endpoint}`);
    if (data) {
      console.log("Request Body:", JSON.stringify(data, null, 2));
    }

    const response = await axios(config);

    console.log(`✅ Status: ${response.status}`);
    console.log("Response:", JSON.stringify(response.data, null, 2));

    return {
      success: true,
      data: response.data,
      status: response.status,
      request: { method, endpoint, data },
      response: response.data,
    };
  } catch (error) {
    console.log(`❌ Status: ${error.response?.status || "Network Error"}`);
    console.log(
      "Error:",
      JSON.stringify(error.response?.data || error.message, null, 2)
    );

    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
      request: { method, endpoint, data },
      response: error.response?.data || { error: error.message },
    };
  }
};

// Test authentication first
const testAuth = async () => {
  console.log("\n🔐 ===== TESTING AUTHENTICATION =====");

  // Register user
  const registerData = {
    first_name: "Test",
    last_name: "User",
    email: `test_${Date.now()}@example.com`,
    username: `testuser_${Date.now()}`,
    password: "password123",
  };

  const registerResult = await apiCall(
    "POST",
    "/auth/register",
    registerData,
    null,
    "User Registration"
  );

  if (registerResult.success) {
    testUserId = registerResult.data.data?.userid;
  }

  // Login user
  const loginData = {
    username: registerData.username,
    password: registerData.password,
  };

  const loginResult = await apiCall(
    "POST",
    "/auth/login",
    loginData,
    null,
    "User Login"
  );

  if (loginResult.success) {
    authToken = loginResult.data.data?.accessToken;
  }

  return authToken ? true : false;
};

// Test Post APIs with EditorJS content
const testPostAPIs = async () => {
  console.log("\n📝 ===== TESTING POST APIs WITH EDITORJS CONTENT =====");

  // Test 1: Create post with EditorJS content
  const createPostData = {
    title: `Test Post with EditorJS ${Date.now()}`,
    content: JSON.stringify(editorJSContent),
    languageid: 1,
    categoryids: [1, 2],
    status: 1,
  };

  const createResult = await apiCall(
    "POST",
    "/posts",
    createPostData,
    authToken,
    "Create Post with EditorJS Content"
  );

  if (createResult.success) {
    testPostId = createResult.data.data?.postid;
  }

  // Test 2: Get all posts
  const getAllResult = await apiCall(
    "GET",
    "/posts",
    null,
    authToken,
    "Get All Posts"
  );

  // Test 3: Get post by ID
  if (testPostId) {
    const getByIdResult = await apiCall(
      "GET",
      `/posts/${testPostId}`,
      null,
      authToken,
      "Get Post By ID"
    );
  }

  // Test 4: Update post with new EditorJS content
  if (testPostId) {
    const updatedEditorJSContent = {
      ...editorJSContent,
      time: Date.now(),
      blocks: [
        ...editorJSContent.blocks,
        {
          id: "block5",
          type: "paragraph",
          data: {
            text: "This is an updated paragraph added to test the update functionality.",
          },
        },
      ],
    };

    const updatePostData = {
      title: `Updated Test Post with EditorJS ${Date.now()}`,
      content: JSON.stringify(updatedEditorJSContent),
      status: 1,
    };

    const updateResult = await apiCall(
      "PUT",
      `/posts/${testPostId}`,
      updatePostData,
      authToken,
      "Update Post with EditorJS Content"
    );
  }

  // Test 5: Create post with invalid EditorJS content
  const invalidPostData = {
    title: `Invalid EditorJS Test ${Date.now()}`,
    content: JSON.stringify({ invalid: "structure" }),
    languageid: 1,
    status: 0,
  };

  const invalidResult = await apiCall(
    "POST",
    "/posts",
    invalidPostData,
    authToken,
    "Create Post with Invalid EditorJS Content"
  );

  // Test 6: Create post with empty content
  const emptyPostData = {
    title: `Empty Content Test ${Date.now()}`,
    content: "",
    languageid: 1,
    status: 0,
  };

  const emptyResult = await apiCall(
    "POST",
    "/posts",
    emptyPostData,
    authToken,
    "Create Post with Empty Content"
  );

  // Test 7: Delete post (soft delete)
  if (testPostId) {
    const deleteResult = await apiCall(
      "DELETE",
      `/posts/${testPostId}`,
      null,
      authToken,
      "Delete Post (Soft Delete)"
    );
  }
};

// Main test runner
const runPostAPITests = async () => {
  console.log("🚀 Starting Post API Testing with EditorJS Content...");
  console.log("Base URL:", BASE_URL);

  try {
    // First authenticate
    const authSuccess = await testAuth();

    if (!authSuccess) {
      console.log(
        "❌ Authentication failed. Cannot proceed with Post API tests."
      );
      return;
    }

    console.log(
      `✅ Authentication successful. Token: ${authToken.substring(0, 20)}...`
    );

    // Test Post APIs
    await testPostAPIs();

    console.log("\n✅ All Post API tests completed!");
    console.log("\n📊 Test Summary:");
    console.log(`- Auth Token: ${authToken ? "Available" : "Not available"}`);
    console.log(`- Test User ID: ${testUserId || "Not created"}`);
    console.log(`- Test Post ID: ${testPostId || "Not created"}`);
  } catch (error) {
    console.error("\n❌ Test runner error:", error);
  }
};

// Check if server is running
const checkServer = async () => {
  try {
    const response = await axios.get(`http://localhost:3000`);
    return true;
  } catch (error) {
    console.log("Server check error:", error.message);
    return false;
  }
};

// Start testing
(async () => {
  console.log(
    "🚀 Starting Post API tests (assuming server is running on port 3000)..."
  );
  try {
    await runPostAPITests();
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
})();
