const axios = require("axios");

const BASE_URL = "http://localhost:4000/api";

console.log("🚀 Testing create_for_all_languages parameter...");

// EditorJS content format
const editorJSContent = {
  time: Date.now(),
  blocks: [
    {
      id: "block1",
      type: "header",
      data: {
        text: "Test Multi-Language Post",
        level: 2,
      },
    },
    {
      id: "block2",
      type: "paragraph",
      data: {
        text: "This post will be created in multiple languages automatically using the create_for_all_languages parameter.",
      },
    },
  ],
  version: "2.31.0",
};

async function testCreateForAllLanguages() {
  let authToken = "";

  try {
    // Step 1: Register and login
    console.log("\n1️⃣ Setting up authentication...");
    const timestamp = Date.now();

    const registerData = {
      first_name: "Test",
      last_name: "User",
      email: `test_${timestamp}@example.com`,
      username: `testuser_${timestamp}`,
      password: "password123",
    };

    const registerResponse = await axios.post(
      `${BASE_URL}/auth/register`,
      registerData
    );
    console.log("✅ Registration successful");

    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: registerData.username,
      password: registerData.password,
    });
    console.log("✅ Login successful");

    authToken = loginResponse.data.data.accessToken;

    // Step 2: Get available languages
    console.log("\n2️⃣ Getting available languages...");
    const languagesResponse = await axios.get(`${BASE_URL}/languages`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    console.log("Available languages:");
    languagesResponse.data.data.forEach((lang) => {
      console.log(
        `- ${lang.language_name} (ID: ${lang.languageid}, Code: ${lang.locale_code})`
      );
    });

    // Step 3: Test create_for_all_languages = false (default)
    console.log("\n3️⃣ Testing create_for_all_languages = false...");
    const postData1 = {
      title: `Single Language Post ${timestamp}`,
      content: JSON.stringify(editorJSContent),
      languageid: 1, // English
      create_for_all_languages: false,
      status: 1,
    };

    console.log("Request payload:");
    console.log(JSON.stringify(postData1, null, 2));

    const createResponse1 = await axios.post(`${BASE_URL}/posts`, postData1, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    console.log("✅ Single language post created:");
    console.log(JSON.stringify(createResponse1.data, null, 2));

    // Step 4: Test create_for_all_languages = true
    console.log("\n4️⃣ Testing create_for_all_languages = true...");
    const postData2 = {
      title: `Multi Language Post ${timestamp}`,
      content: JSON.stringify({
        ...editorJSContent,
        blocks: [
          {
            id: "block1",
            type: "header",
            data: {
              text: "Multi-Language Test Post",
              level: 2,
            },
          },
          {
            id: "block2",
            type: "paragraph",
            data: {
              text: "This post should be automatically translated to all available languages.",
            },
          },
        ],
      }),
      languageid: 1, // English (original)
      create_for_all_languages: true,
      status: 1,
    };

    console.log("Request payload:");
    console.log(JSON.stringify(postData2, null, 2));

    const createResponse2 = await axios.post(`${BASE_URL}/posts`, postData2, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    console.log("✅ Multi-language post created:");
    console.log(JSON.stringify(createResponse2.data, null, 2));

    // Step 5: Get all posts to see if translations were created
    console.log("\n5️⃣ Checking all posts to verify translations...");
    const allPostsResponse = await axios.get(`${BASE_URL}/posts`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    console.log("All posts:");
    allPostsResponse.data.data.forEach((post) => {
      console.log(
        `- Post ID: ${post.postid}, Title: "${post.title}", Language: ${post.language_name} (${post.languageid})`
      );
    });

    // Step 6: Test without create_for_all_languages parameter (should default to false)
    console.log("\n6️⃣ Testing without create_for_all_languages parameter...");
    const postData3 = {
      title: `Default Behavior Post ${timestamp}`,
      content: JSON.stringify(editorJSContent),
      languageid: 2, // Vietnamese
      status: 1,
    };

    const createResponse3 = await axios.post(`${BASE_URL}/posts`, postData3, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    console.log("✅ Default behavior post created:");
    console.log(JSON.stringify(createResponse3.data, null, 2));

    console.log("\n🎉 All create_for_all_languages tests completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
    }
  }
}

// Run the test
testCreateForAllLanguages();
