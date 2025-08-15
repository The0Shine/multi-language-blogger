const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";

async function debugMultiLang() {
  try {
    console.log("🔍 Debug Multi-Language Post Creation...\n");

    // Step 1: Register and login
    const timestamp = Date.now();
    console.log("1️⃣ Registering user...");

    const registerData = {
      first_name: "Debug",
      last_name: "User",
      email: `debug_${timestamp}@example.com`,
      username: `debuguser_${timestamp}`,
      password: "password123",
    };

    const registerResponse = await axios.post(
      `${BASE_URL}/auth/register`,
      registerData
    );
    console.log("✅ Registration response:", registerResponse.status);

    console.log("2️⃣ Logging in...");
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: registerData.username,
      password: registerData.password,
    });
    console.log("✅ Login response:", loginResponse.status);

    const authToken = loginResponse.data.data.accessToken;
    console.log("🔑 Token obtained:", authToken.substring(0, 20) + "...\n");

    // Step 2: Get languages
    console.log("3️⃣ Getting available languages...");
    const languagesResponse = await axios.get(`${BASE_URL}/languages`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log("✅ Languages response:", languagesResponse.status);
    console.log(
      "📋 Languages response data:",
      JSON.stringify(languagesResponse.data, null, 2)
    );

    // Handle different response formats
    let languages = [];
    if (
      languagesResponse.data.data &&
      languagesResponse.data.data.data &&
      Array.isArray(languagesResponse.data.data.data)
    ) {
      languages = languagesResponse.data.data.data;
    } else if (
      languagesResponse.data.data &&
      Array.isArray(languagesResponse.data.data)
    ) {
      languages = languagesResponse.data.data;
    } else if (Array.isArray(languagesResponse.data)) {
      languages = languagesResponse.data;
    }

    console.log("📋 Available languages:");
    languages.forEach((lang) => {
      console.log(`   - ${lang.language_name} (ID: ${lang.languageid})`);
    });
    console.log("");

    // Step 3: Create post with create_for_all_languages = true
    console.log("4️⃣ Creating multi-language post...");

    const editorJSContent = {
      time: timestamp,
      blocks: [
        {
          id: "debug_block_1",
          type: "header",
          data: {
            text: "Debug Multi-Language Post",
            level: 2,
          },
        },
        {
          id: "debug_block_2",
          type: "paragraph",
          data: {
            text: "This is a debug post to test multi-language creation feature.",
          },
        },
      ],
      version: "2.31.0",
    };

    const postData = {
      title: `Debug Multi-Lang Post ${timestamp}`,
      content: JSON.stringify(editorJSContent),
      languageid: 1, // English
      create_for_all_languages: true,
      status: 1,
    };

    console.log("📝 Post data:");
    console.log("   - Title:", postData.title);
    console.log("   - Language ID:", postData.languageid);
    console.log(
      "   - create_for_all_languages:",
      postData.create_for_all_languages
    );
    console.log("   - Status:", postData.status);
    console.log("   - Content length:", postData.content.length, "chars\n");

    console.log("🚀 Sending POST request...");
    const createResponse = await axios.post(`${BASE_URL}/posts`, postData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Create response status:", createResponse.status);
    console.log("📄 Response data:");
    console.log(JSON.stringify(createResponse.data, null, 2));

    // Step 4: Get all posts to verify
    console.log("\n5️⃣ Getting all posts to verify...");
    const allPostsResponse = await axios.get(`${BASE_URL}/posts`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    console.log("✅ All posts response:", allPostsResponse.status);
    console.log(
      "� All posts response data:",
      JSON.stringify(allPostsResponse.data, null, 2)
    );

    // Handle different response formats for posts
    let posts = [];
    if (
      allPostsResponse.data.data &&
      allPostsResponse.data.data.posts &&
      Array.isArray(allPostsResponse.data.data.posts)
    ) {
      posts = allPostsResponse.data.data.posts;
    } else if (
      allPostsResponse.data.data &&
      Array.isArray(allPostsResponse.data.data)
    ) {
      posts = allPostsResponse.data.data;
    } else if (Array.isArray(allPostsResponse.data)) {
      posts = allPostsResponse.data;
    }

    console.log("📊 Total posts found:", posts.length);

    console.log("\n📋 Posts breakdown:");
    posts.forEach((post) => {
      console.log(`   - Post ID: ${post.postid}`);
      console.log(`     Title: "${post.title}"`);
      console.log(
        `     Language: ${post.language_name} (ID: ${post.languageid})`
      );
      console.log(
        `     Original ID: ${post.originalid || "N/A (original post)"}`
      );
      console.log(`     Status: ${post.status}`);
      console.log("");
    });

    // Step 5: Check specific post by ID
    const createdPostId = createResponse.data.data.postid;
    console.log(`6️⃣ Getting specific post (ID: ${createdPostId})...`);

    const specificPostResponse = await axios.get(
      `${BASE_URL}/posts/${createdPostId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    console.log("✅ Specific post response:", specificPostResponse.status);
    console.log("📄 Post details:");
    console.log(JSON.stringify(specificPostResponse.data, null, 2));
  } catch (error) {
    console.error("❌ Debug failed:");
    console.error("Status:", error.response?.status);
    console.error("Error data:", JSON.stringify(error.response?.data, null, 2));
    console.error("Error message:", error.message);
  }
}

// Run debug
debugMultiLang();
