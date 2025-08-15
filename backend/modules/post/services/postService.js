const { Post, PostContent, sequelize } = require('models');

const postService = {
  // Tạo Post + nhiều PostContent => cần TX
  create: async (data) => {
    const t = await sequelize.transaction();
    try {
      const { contents, ...postData } = data;

      // Tạo post chính
      const newPost = await Post.create(postData, { transaction: t });

      // Tạo nội dung con (nếu có)
      if (Array.isArray(contents) && contents.length > 0) {
        const contentData = contents.map(item => ({
          post_id: newPost.postid,
          type: item.type,
          content: item.content ?? null,
          url: item.url ?? null
        }));

        await PostContent.bulkCreate(contentData, { transaction: t });
      }

      await t.commit();
      return newPost;
    } catch (error) {
      await t.rollback();
      console.error('Create post error:', error);
      throw new Error('Failed to create post');
    }
  },

  // Chỉ SELECT => không cần TX
  getById: async (postid) => {
    const post = await Post.findByPk(postid, {
      include: [{ model: PostContent, as: 'contents' }]
    });
    if (!post) throw new Error('Post not found');
    return post;
  },

 getAll: async ({ limit, offset, viewer }) => {
  if (!viewer) throw new Error('viewer context is required');

  const canModerate = Array.isArray(viewer.permissions)
    && viewer.permissions.map(p => String(p).toLowerCase()).includes('moderate_posts');

  const whereCondition = canModerate ? {} : { userid: viewer.userid };

  if (limit && !isNaN(limit)) {
    const { count, rows } = await Post.findAndCountAll({
      where: whereCondition,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10) || 0,
      include: [{ model: PostContent, as: 'contents' }],
      order: [['created_at', 'DESC']]
    });
    return { total: count, data: rows };
  } else {
    const rows = await Post.findAll({
      where: whereCondition,
      include: [{ model: PostContent, as: 'contents' }],
      order: [['created_at', 'DESC']]
    });
    return { total: rows.length, data: rows };
  }
}
,

  delete: async (postid) => {
    const post = await Post.findByPk(postid);
    if (!post) throw new Error('Post not found');

    await post.destroy(); // sẽ cascade nếu FK đã cấu hình
    return { message: 'Post deleted successfully' };
  },

  // Chỉ UPDATE 1 bảng => không cần TX
  updateStatus: async (postid, newStatus) => {
    const validStatuses = [-1, 0, 1];
    if (!validStatuses.includes(Number(newStatus))) {
      throw new Error('Invalid status value');
    }

    const post = await Post.findByPk(postid);
    if (!post) throw new Error('Post not found');

    await post.update({ status: Number(newStatus) });
    return post;
  }
};

module.exports = postService;
