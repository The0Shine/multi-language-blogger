const { User, Role, Category, Language, Post } = require("../models");

async function fixStatus() {
  try {
    console.log("🔧 Fixing status fields...");

    // 1. Fix Language status
    console.log("📝 Updating Language status...");
    const languageResult = await Language.update(
      { status: 1 },
      {
        where: { status: null },
        paranoid: false, // Include soft-deleted records
      }
    );
    console.log(`✅ Updated ${languageResult[0]} languages`);

    // 2. Fix Category status
    console.log("📂 Updating Category status...");
    const categoryResult = await Category.update(
      { status: 1 },
      {
        where: { status: null },
        paranoid: false,
      }
    );
    console.log(`✅ Updated ${categoryResult[0]} categories`);

    // 3. Fix User status
    console.log("👥 Updating User status...");
    const userResult = await User.update(
      { status: 1 },
      {
        where: { status: null },
        paranoid: false,
      }
    );
    console.log(`✅ Updated ${userResult[0]} users`);

    // 4. Fix Role status (if exists)
    console.log("🔑 Updating Role status...");
    const roleResult = await Role.update(
      { status: 1 },
      {
        where: { status: null },
        paranoid: false,
      }
    );
    console.log(`✅ Updated ${roleResult[0]} roles`);

    // 5. Fix Post status (if exists) - Post status: -1=rejected, 0=pending, 1=approved
    console.log("📄 Updating Post status...");
    const postResult = await Post.update(
      { status: 1 }, // 1 = approved
      {
        where: { status: null },
        paranoid: false,
      }
    );
    console.log(`✅ Updated ${postResult[0]} posts`);

    console.log("🎉 Status fix completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing status:", error);
    process.exit(1);
  }
}

fixStatus();
