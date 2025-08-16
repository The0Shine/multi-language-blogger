const cloudinary = require("config/cloudinary");
const responseUtils = require("utils/responseUtils");
const imageManager = require("../services/imageManager");

const uploadController = {
  // Upload single image to temporary storage
  uploadImage: async (req, res) => {
    try {
      if (!req.file) {
        return responseUtils.badRequest(res, "No image file provided");
      }

      console.log("📤 Upload request received:", {
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        userId: req.user?.userid,
      });

      // Upload to temporary storage with user context (using buffer for memory storage)
      const result = await imageManager.uploadToTemp(req.file.buffer, {
        userId: req.user?.userid,
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        width: req.body.width,
        height: req.body.height,
        quality: req.body.quality || "auto",
      });

      return responseUtils.ok(
        res,
        result,
        "Image uploaded to temporary storage successfully"
      );
    } catch (error) {
      console.error("Upload error:", error);
      return responseUtils.error(res, "Failed to upload image");
    }
  },

  // Upload image by URL (for EditorJS Image tool)
  uploadByUrl: async (req, res) => {
    try {
      const { url } = req.body;

      if (!url) {
        return responseUtils.badRequest(res, "No URL provided");
      }

      // Upload from URL to Cloudinary
      const result = await cloudinary.uploader.upload(url, {
        folder: "medium-clone/posts",
        resource_type: "image",
        transformation: [
          { width: 1200, height: 800, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
      });

      return responseUtils.ok(
        res,
        {
          success: 1, // EditorJS format
          file: {
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          },
        },
        "Image uploaded successfully"
      );
    } catch (error) {
      console.error("Upload by URL error:", error);
      return responseUtils.error(res, "Failed to upload image from URL");
    }
  },

  // Delete image
  deleteImage: async (req, res) => {
    try {
      const { public_id } = req.params;

      if (!public_id) {
        return responseUtils.badRequest(res, "No public_id provided");
      }

      // Delete using image manager
      const result = await imageManager.deleteImage(public_id);

      if (result.success) {
        return responseUtils.ok(
          res,
          { deleted: true, public_id },
          "Image deleted successfully"
        );
      } else {
        return responseUtils.notFound(res, "Image not found");
      }
    } catch (error) {
      console.error("Delete error:", error);
      return responseUtils.error(res, "Failed to delete image");
    }
  },

  // Get upload signature for direct uploads (optional)
  getUploadSignature: async (req, res) => {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const params = {
        timestamp,
        folder: "medium-clone/posts",
        transformation: "w_1200,h_800,c_limit,q_auto,f_auto",
      };

      const signature = cloudinary.utils.api_sign_request(
        params,
        process.env.CLOUDINARY_API_SECRET
      );

      return responseUtils.ok(
        res,
        {
          signature,
          timestamp,
          api_key: process.env.CLOUDINARY_API_KEY,
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          folder: params.folder,
          transformation: params.transformation,
        },
        "Upload signature generated"
      );
    } catch (error) {
      console.error("Signature error:", error);
      return responseUtils.error(res, "Failed to generate upload signature");
    }
  },

  // Move images from temp to permanent storage
  moveToPermament: async (req, res) => {
    try {
      const { public_ids, target_folder = "posts" } = req.body;

      if (!public_ids || !Array.isArray(public_ids)) {
        return responseUtils.badRequest(res, "public_ids array is required");
      }

      const result = await imageManager.batchMoveToPermament(
        public_ids,
        target_folder
      );

      return responseUtils.ok(
        res,
        result,
        `Moved ${result.successful} images to permanent storage`
      );
    } catch (error) {
      console.error("Move to permanent error:", error);
      return responseUtils.error(
        res,
        "Failed to move images to permanent storage"
      );
    }
  },

  // Clean up temporary images
  cleanupTempImages: async (req, res) => {
    try {
      const { max_age_hours = 24 } = req.query;

      const result = await imageManager.cleanupTempImages(
        parseInt(max_age_hours)
      );

      return responseUtils.ok(
        res,
        result,
        `Cleanup completed: ${result.deleted} images deleted`
      );
    } catch (error) {
      console.error("Cleanup error:", error);
      return responseUtils.error(res, "Failed to cleanup temporary images");
    }
  },

  // Get image info
  getImageInfo: async (req, res) => {
    try {
      const { public_id } = req.params;

      if (!public_id) {
        return responseUtils.badRequest(res, "No public_id provided");
      }

      const result = await imageManager.getImageInfo(public_id);

      return responseUtils.ok(res, result, "Image info retrieved successfully");
    } catch (error) {
      console.error("Get image info error:", error);
      return responseUtils.error(res, "Failed to get image info");
    }
  },
};

module.exports = uploadController;
