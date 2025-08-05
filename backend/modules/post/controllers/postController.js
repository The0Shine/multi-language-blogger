const postService = require('modules/post/services/postService');
const responseUtils = require('utils/responseUtils');

const postController = {
  // User tạo mới bài viết
  create: async (req, res) => {
  try {
    // Tạo bài viết
    const post = await postService.create({
      ...req.body,
      userid: req.user.userid,
      status: 0 // mặc định là pending
    });

    // Sau khi tạo xong, lấy lại đầy đủ post + contents
    const fullPost = await postService.getById(post.postid);

    return responseUtils.ok(res, {
      message: 'Post created successfully',
      data: fullPost
    });
  } catch (error) {
    console.error('Create post error:', error);
    return responseUtils.serverError(res, error.message);
  }
},
     upload: async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { secure_url } = await uploadToCloudinary(
      req.file.buffer,
      req.file.mimetype
    );

    return res.json({ path: secure_url });
  },

  // Admin xem danh sách
  getAll: async (req, res) => {
    try {
      const posts = await postService.getAll({
        limit: req.query.limit || 10,
        offset: req.query.offset || 0
      });
      return responseUtils.ok(res, {
        message: 'Posts retrieved successfully',
        data: posts
      });
    } catch (error) {
      console.error('Get all posts error:', error);
      return responseUtils.serverError(res, error.message);
    }
  },

  delete: async (req, res) => {
    try {
      const { postid } = req.params;
      const result = await postService.delete(postid);
      return responseUtils.ok(res, result);
    } catch (error) {
      console.error('Delete post error:', error);
      return responseUtils.serverError(res, error.message);
    }
  },

  accept: async (req, res) => {
    try {
      const { postid } = req.params;
      const updatedPost = await postService.updateStatus(postid, 1);

      return responseUtils.ok(res, {
        message: 'Post accepted and published',
        data: updatedPost
      });
    } catch (error) {
      console.error('Accept post error:', error);
      return responseUtils.serverError(res, error.message);
    }
  },

  reject: async (req, res) => {
    try {
      const { postid } = req.params;
      const updatedPost = await postService.updateStatus(postid, -1);

      return responseUtils.ok(res, {
        message: 'Post rejected and marked as drafted',
        data: updatedPost
      });
    } catch (error) {
      console.error('Reject post error:', error);
      return responseUtils.serverError(res, error.message);
    }
  }
};

module.exports = postController;
