const postService = require('modules/post/services/postService');
const responseUtils = require('utils/responseUtils');
// const { uploadToCloudinary } = require('where/ever'); // NHỚ import đúng

const postController = {
  // User tạo mới bài viết
  create: async (req, res) => {
    try {
      const post = await postService.create({
        ...req.body,
        userid: req.user.userid,
        status: 0 // pending
      });

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
      return responseUtils.badRequest(res, 'No file uploaded');
    }
    try {
      const { secure_url } = await uploadToCloudinary(
        req.file.buffer,
        req.file.mimetype
      );
      return responseUtils.ok(res, { path: secure_url });
    } catch (e) {
      console.error('Upload error:', e);
      return responseUtils.serverError(res, 'Upload failed');
    }
  },

  // Admin xem danh sách
  getAll: async (req, res) => {
    try {
      const limit = Number.parseInt(req.query.limit, 10) || 10;
      const offset = Number.parseInt(req.query.offset, 10) || 0;

      const posts = await postService.getAll({ limit, offset });
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
