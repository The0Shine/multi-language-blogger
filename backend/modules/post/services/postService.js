const { Post, User, Language, Category, Comment } = require("models");
const { Op } = require("sequelize");
const translationService = require("services/translationService");

// Simple content validation
function validateContent(content) {
  if (!content || typeof content !== "string") {
    return "";
  }

  // Trim and return content
  return content.trim();
}

const postService = {
  /**
   * Get all posts for admin (including pending/rejected) with associations
   * @param {Object} params - Query parameters
   * @returns {Object} - Posts with pagination info
   */
  async getPostsForAdmin(params) {
    const {
      page = 1,
      limit = 10,
      status,
      categoryid,
      search,
      sortBy = "created_at",
      sortOrder = "DESC",
      startDate,
      endDate,
      languageid,
    } = params;

    const offset = (page - 1) * limit;

    // Build where clause - Include ALL statuses for admin
    const whereClause = {};

    // Status filter (optional for admin)
    if (status !== undefined) {
      whereClause.status = status;
    }

    // Category filter
    if (categoryid) {
      whereClause["$categories.categoryid$"] = categoryid;
    }

    // Language filter
    if (languageid) {
      whereClause.languageid = languageid;
    }

    // Search filter
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      whereClause.created_at = {};
      if (startDate) {
        whereClause.created_at[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereClause.created_at[Op.lte] = new Date(endDate);
      }
    }

    // Include associations
    const include = [
      {
        model: User,
        as: "author",
        attributes: ["userid", "first_name", "last_name", "username"],
        paranoid: false, // Include soft-deleted users for admin
      },
      {
        model: Language,
        as: "language",
        attributes: ["languageid", "language_name", "locale_code"],
      },
      {
        model: Category,
        as: "categories",
        attributes: ["categoryid", "category_name"],
        through: { attributes: [] },
      },
    ];

    // Get total count
    const totalCount = await Post.count({
      where: whereClause,
      include,
      distinct: true,
    });

    // Get posts
    const posts = await Post.findAll({
      where: whereClause,
      include,
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
      attributes: {
        include: [
          [
            Post.sequelize.literal(
              `(SELECT COUNT(*) FROM comment WHERE comment.postid = IFNULL(Post.originalid, Post.postid))`
            ),
            "comment_count",
          ],
        ],
      },
    });

    return {
      posts,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: Number.parseInt(limit),
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1,
      },
    };
  },

  /**
   * Get posts with pagination and filters (Public - published only)
   * @param {Object} params - Query parameters
   * @returns {Object} - Posts with pagination info
   */
  async getPosts(params) {
    try {
      console.log("📄 PostService.getPosts called with params:", params);

      const {
        page = 1,
        limit = 10,
        status,
        categoryid,
        search,
        sortBy = "created_at",
        sortOrder = "DESC",
        startDate,
        endDate,
        languageid,
      } = params;

      const offset = (page - 1) * limit;

      // Build where clause - Only show published posts in public feed
      const whereClause = {
        status: 1, // 1 = published, 0 = draft, 2 = rejected
      };

      // Override status filter if explicitly provided (for admin/moderation)
      if (status !== undefined) {
        whereClause.status = status;
      }

      // Category filter - will be handled in include
      let categoryFilter = null;
      if (categoryid) {
        categoryFilter = categoryid;
      }

      // Language filter - default to English if not specified
      if (languageid) {
        whereClause.languageid = languageid;
      }
      // } else {
      //   whereClause.languageid = 1; // Default to English
      // }

      // Search filter
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { content: { [Op.like]: `%${search}%` } },
        ];
      }

      // Date range filter
      if (startDate || endDate) {
        whereClause.created_at = {};
        if (startDate) {
          whereClause.created_at[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          whereClause.created_at[Op.lte] = new Date(endDate);
        }
      }

      // Include associations
      const include = [
        {
          model: User,
          as: "author",
          attributes: ["userid", "first_name", "last_name", "username"],
          where: { status: 1 },
          paranoid: true,
        },
        {
          model: Language,
          as: "language",
          attributes: ["languageid", "language_name", "locale_code"],
        },
        {
          model: Category,
          as: "categories",
          attributes: ["categoryid", "category_name"],
          through: { attributes: [] },
          // Add category filter if specified
          ...(categoryFilter && {
            where: { categoryid: categoryFilter },
            required: true, // INNER JOIN to filter posts by category
          }),
        },
      ];

      // Get total count
      const totalCount = await Post.count({
        where: whereClause,
        include,
        distinct: true,
      });

      // Get posts
      const posts = await Post.findAll({
        where: whereClause,
        include,
        limit: Number.parseInt(limit),
        offset: Number.parseInt(offset),
        order: [[sortBy, sortOrder.toUpperCase()]],
        attributes: {
          include: [
            [
              Post.sequelize.literal(
                `(SELECT COUNT(*) FROM comment WHERE comment.postid = IFNULL(Post.originalid, Post.postid))`
              ),
              "comment_count",
            ],
          ],
        },
      });

      console.log("📄 PostService.getPosts completed successfully");
      console.log("📄 Posts found:", posts.length);
      console.log("📄 Total count:", totalCount);

      return {
        posts,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: Number.parseInt(limit),
          hasNextPage: page * limit < totalCount,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      console.error("📄 PostService.getPosts error:", error);
      console.error("📄 Error details:", error.message);
      console.error("📄 Stack trace:", error.stack);
      throw error;
    }
  },

  /**
   * Create a new post
   * @param {Object} postData - Post data
   * @param {number} userid - Author user ID
   * @returns {Object} - Created post
   */
  async createPost(postData, userid) {
    const {
      title,
      content,
      languageid,
      categoryids,
      status = 0, // Default to pending status (0 = pending, 1 = approved, -1 = rejected)
      create_for_all_languages = false,
    } = postData;

    // Validate content before saving
    const validatedContent = validateContent(content);

    // Create post
    const post = await Post.create({
      userid,
      title,
      content: validatedContent,
      languageid: languageid || 1, // Use languageid
      status,
    });

    // Add categories if provided
    if (categoryids && categoryids.length > 0) {
      const categories = await Category.findAll({
        where: { categoryid: categoryids },
      });
      await post.setCategories(categories);
      console.log("✅ Categories assigned successfully");
    }

    // Auto-translate to all other languages

    if (languageid && create_for_all_languages) {
      try {
        const availableLanguages = await Language.findAll({
          where: {
            languageid: { [Op.ne]: languageid }, // Exclude the original language
            status: 1,
          },
        });
        console.log(
          `📋 Found ${availableLanguages.length} target languages:`,
          availableLanguages.map((l) => `${l.language_name} (${l.locale_code})`)
        );
        const sourceLanguage = await Language.findByPk(languageid);
        if (!sourceLanguage) {
          throw new Error("Source language not found");
        }

        // Create translations for each available language
        const translationPromises = availableLanguages.map(async (language) => {
          try {
            console.log(
              `Translating to ${language.language_name} (${language.locale_code})`
            );

            const translatedContent =
              await translationService.translatePostContent(
                content,
                language.locale_code,
                sourceLanguage.locale_code
              );

            const translatedTitle = await translationService.translateText(
              title,
              language.locale_code,
              sourceLanguage.locale_code
            );

            // Validate translated content before saving
            const validatedTranslatedContent =
              validateContent(translatedContent);

            // Ensure title meets minimum length requirement (2 chars for Unicode)
            let finalTitle = translatedTitle;
            if (finalTitle.length < 2) {
              finalTitle = `${translatedTitle} - ${language.language_name}`;
            }

            const translatedPost = await Post.create({
              userid,
              title: finalTitle,
              content: validatedTranslatedContent,
              languageid: language.languageid,
              originalid: post.postid, // Link to original post
              status: 0, // Default to pending status for translations
            });

            return translatedPost;
          } catch (translationError) {
            console.error(
              `Translation failed for language ${language.language_name}:`,
              translationError
            );
            return null;
          }
        });

        const results = await Promise.allSettled(translationPromises);
        const successful = results.filter(
          (r) => r.status === "fulfilled" && r.value
        ).length;
        const failed = results.filter(
          (r) => r.status === "rejected" || !r.value
        ).length;

        console.log(
          `🎯 Translation results: ${successful} successful, ${failed} failed`
        );
      } catch (error) {
        console.error("Auto-translation error:", error);
      }
    } else {
      console.log("⚠️ Auto-translation skipped:", {
        hasLanguageid: !!languageid,
        createForAllLanguages: create_for_all_languages,
        reason: !languageid
          ? "No languageid"
          : "create_for_all_languages is false",
      });
    }

    // Return post with associations
    return await Post.scope("full").findByPk(post.postid);
  },

  /**
   * Get post by ID with translations
   * @param {number} postid - Post ID
   * @returns {Object} - Post with translations
   */
  async getPostById(postid) {
    const post = await Post.scope("full").findByPk(postid);

    if (!post) {
      throw new Error("Post not found");
    }

    // Get all translations (including the original post if this is a translation)
    const translations = await Post.findAll({
      where: {
        [Op.or]: [
          { originalid: postid }, // Include translations
          {
            // If this post is a translation, find its siblings
            originalid: post.originalid || postid,
          },
        ],
      },
      include: [
        {
          model: Language,
          as: "language",
          attributes: ["languageid", "language_name", "locale_code"],
        },
      ],
      order: [["languageid", "ASC"]],
    });

    // Also include the original post if this is a translation
    if (post.originalid) {
      const originalPost = await Post.findByPk(post.originalid, {
        include: [
          {
            model: Language,
            as: "language",
            attributes: ["languageid", "language_name", "locale_code"],
          },
        ],
      });
      if (originalPost) {
        translations.unshift(originalPost);
      }
    }

    return {
      post,
      translations,
    };
  },

  /**
   * Get post by ID with comments (for show page)
   * @param {number} postid - Post ID
   * @returns {Object} - Post with comments
   */
  async getPostByIdWithComments(postid) {
    const post = await Post.scope("full").findOne({
      where: {
        postid,
      },
      include: [
        {
          model: Comment,
          as: "comments",
          attributes: ["commentid", "author", "content", "created_at"],
        },
      ],
      order: [[{ model: Comment, as: "comments" }, "left", "ASC"]],
    });

    if (!post) {
      throw new Error("Post not found");
    }

    return post;
  },

  /**
   * Update post
   * @param {number} postid - Post ID
   * @param {Object} updateData - Update data
   * @param {number} userid - User ID (for authorization)
   * @returns {Object} - Updated post
   */
  async updatePost(postid, updateData, userid) {
    const post = await Post.findByPk(postid);

    if (!post) {
      throw new Error("Post not found");
    }

    // Check if user owns the post (basic authorization)
    if (post.userid !== userid) {
      throw new Error("Unauthorized to update this post");
    }

    const { title, content, languageid, categoryids, status } = updateData;

    // Update post fields - only update fields that are explicitly provided
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (content !== undefined) {
      // Validate content before updating
      updateFields.content = validateContent(content);
    }
    if (languageid !== undefined) updateFields.languageid = languageid;
    // Only update status if explicitly provided (not undefined)
    if (status !== undefined) updateFields.status = status;

    await post.update(updateFields);

    // Update categories if provided
    if (categoryids !== undefined) {
      if (categoryids.length > 0) {
        const categories = await Category.findAll({
          where: { categoryid: categoryids },
        });
        await post.setCategories(categories);
        console.log("✅ Categories updated successfully");
      } else {
        await post.setCategories([]);
        console.log("✅ Categories cleared successfully");
      }
    }

    // Auto-update translations if this is the original post and content/title changed
    if (!post.originalid && (title !== undefined || content !== undefined)) {
      console.log(`🌍 Auto-updating translations for post ${postid}`);

      try {
        // Find all translations of this post
        const translations = await Post.findAll({
          where: { originalid: postid },
          include: [
            {
              model: Language,
              as: "language",
              attributes: ["languageid", "language_name", "locale_code"],
            },
          ],
        });

        if (translations.length > 0) {
          console.log(`📋 Found ${translations.length} translations to update`);

          // Get source language
          const sourceLanguage = await Language.findByPk(post.languageid);
          if (!sourceLanguage) {
            throw new Error("Source language not found");
          }

          // Update each translation
          const updatePromises = translations.map(async (translation) => {
            try {
              console.log(
                `🔄 Updating translation for ${translation.language.language_name}`
              );

              const updateTranslationFields = {};

              // Translate title if it was updated
              if (title !== undefined) {
                const translatedTitle = await translationService.translateText(
                  title,
                  translation.language.locale_code,
                  sourceLanguage.locale_code
                );
                updateTranslationFields.title = translatedTitle;
                console.log(`   Updated title: "${translatedTitle}"`);
              }

              // Translate content if it was updated
              if (content !== undefined) {
                const translatedContent =
                  await translationService.translatePostContent(
                    content,
                    translation.language.locale_code,
                    sourceLanguage.locale_code
                  );
                // Validate translated content before updating
                updateTranslationFields.content =
                  validateContent(translatedContent);
                console.log(
                  `   Updated content: "${translatedContent.substring(
                    0,
                    100
                  )}..."`
                );
              }

              // Update the translation
              await translation.update(updateTranslationFields);
              console.log(
                `✅ Updated translation ${translation.postid} for ${translation.language.language_name}`
              );

              return translation;
            } catch (translationError) {
              console.error(
                `Translation update failed for ${translation.language.language_name}:`,
                translationError
              );
              return null;
            }
          });

          const results = await Promise.allSettled(updatePromises);
          const successful = results.filter(
            (r) => r.status === "fulfilled" && r.value
          ).length;
          const failed = results.filter(
            (r) => r.status === "rejected" || !r.value
          ).length;

          console.log(
            `🎯 Translation update results: ${successful} successful, ${failed} failed`
          );
        } else {
          console.log("⚠️ No translations found to update");
        }
      } catch (error) {
        console.error("Auto-translation update error:", error);
      }
    }

    // Return updated post with associations
    return await Post.scope("full").findByPk(postid);
  },

  /**
   * Delete post and all its translations
   * @param {number} postid - Post ID
   * @param {number} userid - User ID (for authorization)
   * @returns {boolean} - Success status
   */
  async deletePost(postid, userid) {
    const post = await Post.findByPk(postid);

    if (!post) {
      throw new Error("Post not found");
    }

    // Check if user owns the post (basic authorization)
    if (post.userid !== userid) {
      throw new Error("Unauthorized to delete this post");
    }

    console.log(`🗑️ Deleting post ${postid} and all its translations`);

    // Determine if this is the original post or a translation
    const originalPostId = post.originalid || post.postid;

    console.log(`📝 Original post ID: ${originalPostId}`);

    // Find all posts related to this original post (including the original itself)
    const relatedPosts = await Post.findAll({
      where: {
        [Op.or]: [
          { postid: originalPostId }, // The original post
          { originalid: originalPostId }, // All translations
        ],
      },
    });

    console.log(
      `🔍 Found ${relatedPosts.length} related posts to delete:`,
      relatedPosts.map((p) => ({
        postid: p.postid,
        originalid: p.originalid,
        title: p.title,
      }))
    );

    // Soft delete all related posts (original + translations)
    for (const relatedPost of relatedPosts) {
      console.log(
        `🗑️ Soft deleting post ${relatedPost.postid}: "${relatedPost.title}"`
      );
      await relatedPost.destroy(); // Sequelize soft delete with paranoid: true
    }

    console.log(`✅ Successfully soft deleted ${relatedPosts.length} posts`);
    return true;
  },

  /**
   * Approve post (admin only)
   * @param {number} postid - Post ID
   * @returns {Object} - Updated post
   */
  async approvePost(postid) {
    const post = await Post.findByPk(postid);

    if (!post) {
      throw new Error("Post not found");
    }

    if (post.status === 1) {
      throw new Error("Post is already approved");
    }

    await post.update({ status: 1 });

    // Return updated post with associations
    return await Post.scope("full").findByPk(postid);
  },

  /**
   * Reject post (admin only)
   * @param {number} postid - Post ID
   * @returns {Object} - Updated post
   */
  async rejectPost(postid) {
    const post = await Post.findByPk(postid);

    if (!post) {
      throw new Error("Post not found");
    }

    if (post.status === -1) {
      throw new Error("Post is already rejected");
    }

    await post.update({ status: -1 });

    // Return updated post with associations
    return await Post.scope("full").findByPk(postid);
  },

  /**
   * Get user's own posts
   * @param {number} userid - User ID
   * @param {Object} params - Query parameters
   * @returns {Object} - Posts with pagination info
   */
  async getMyPosts(userid, params) {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = "created_at",
      sortOrder = "DESC",
      startDate,
      endDate,
    } = params;

    const offset = (page - 1) * limit;

    // Build where clause - Only get original posts (not translations)
    const whereClause = {
      userid,
      originalid: null, // Only get original posts, not translations
    };

    // Filter by status
    if (status !== undefined) {
      whereClause.status = status;
    }

    // Search filter
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      whereClause.created_at = {};
      if (startDate) {
        whereClause.created_at[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereClause.created_at[Op.lte] = new Date(endDate);
      }
    }

    // Include associations
    const include = [
      {
        model: Language,
        as: "language",
        attributes: ["languageid", "language_name", "locale_code"],
      },
      {
        model: Category,
        as: "categories",
        attributes: ["categoryid", "category_name"],
        through: { attributes: [] },
      },
    ];

    // Get total count
    const totalCount = await Post.count({
      where: whereClause,
      include,
      distinct: true,
    });

    // Get posts
    const posts = await Post.findAll({
      where: whereClause,
      include,
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
      attributes: {
        include: [
          [
            Post.sequelize.literal(
              "(SELECT COUNT(*) FROM comment WHERE comment.postid = Post.postid)"
            ),
            "comment_count",
          ],
        ],
      },
    });

    return {
      items: posts, // Chuẩn hóa thành 'items' thay vì 'posts'
      pagination: {
        page: Number.parseInt(page), // Chuẩn hóa thành 'page' thay vì 'currentPage'
        totalPages: Math.ceil(totalCount / limit),
        total: totalCount, // Chuẩn hóa thành 'total' thay vì 'totalItems'
        limit: Number.parseInt(limit), // Chuẩn hóa thành 'limit' thay vì 'itemsPerPage'
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1,
      },
    };
  },
};

module.exports = postService;
