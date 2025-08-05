const { Post, PostContent, sequelize } = require('models');

const postService = {
  create: async (data) => {
    const transaction = await sequelize.transaction();
    try {
      const { contents, ...postData } = data;

      // Tạo bài post chính
      const newPost = await Post.create(postData, { transaction });

      // Tạo các nội dung con (text/image/video)
      if (Array.isArray(contents)) {
        const contentData = contents.map(item => ({
          post_id: newPost.postid,
          type: item.type,
          content: item.content || null,
          url: item.url || null
        }));

        await PostContent.bulkCreate(contentData, { transaction });
      }

      await transaction.commit();
      return newPost;
    } catch (error) {
      await transaction.rollback();
      console.error('Create post error:', error);
      throw new Error('Failed to create post');
    }
  },
  getById: async (postid) => {
  const post = await Post.findByPk(postid, {
    include: [
      {
        model: PostContent,
        as: 'contents'
      }
    ]
  });

  if (!post) {
    throw new Error('Post not found');
  }

  return post;
},


  getAll: async ({ limit = 10, offset = 0 }) => {
    try {
      return await Post.findAll({
        limit,
        offset,
        include: [
          {
            model: PostContent,
            as: 'contents'
          }
        ],
        order: [['created_at', 'DESC']]
      });
    } catch (error) {
      console.error('Get all posts error:', error);
      throw new Error('Failed to retrieve posts');
    }
  },

  delete: async (postid) => {
    try {
      const post = await Post.findByPk(postid);
      if (!post) throw new Error('Post not found');

      await post.destroy();
      return { message: 'Post deleted successfully' };
    } catch (error) {
      console.error('Delete post error:', error);
      throw error;
    }
  },

  updateStatus: async (postid, newStatus) => {
    const validStatuses = [-1, 0, 1];
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Invalid status value');
    }

    const post = await Post.findByPk(postid);
    if (!post) throw new Error('Post not found');

    await post.update({ status: newStatus });
    return post;
  }
};

module.exports = postService;
