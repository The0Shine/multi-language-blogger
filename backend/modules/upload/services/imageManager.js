const cloudinary = require("config/cloudinary");
const fs = require("fs").promises;
const path = require("path");

/**
 * Image Manager Service
 * Handles temporary image storage, optimization, and cleanup
 */
class ImageManager {
  constructor() {
    this.tempFolder = "medium-clone/temp";
    this.postsFolder = "medium-clone/posts";
    this.draftsFolder = "medium-clone/drafts";
  }

  /**
   * Upload image to temporary storage
   * @param {string|Buffer} fileInput - Local file path or buffer
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  async uploadToTemp(fileInput, options = {}) {
    try {
      console.log("🔄 ImageManager: Starting upload to temp storage");
      console.log(
        "🔄 Input type:",
        Buffer.isBuffer(fileInput) ? "Buffer" : "File path"
      );

      // Handle both file path and buffer input
      let uploadInput;
      if (Buffer.isBuffer(fileInput)) {
        // For memory storage (buffer)
        uploadInput = `data:${
          options.mimetype || "image/jpeg"
        };base64,${fileInput.toString("base64")}`;
        console.log("🔄 Using buffer input with base64 encoding");
      } else {
        // For file path (traditional)
        uploadInput = fileInput;
        console.log("🔄 Using file path input:", fileInput);
      }

      const result = await cloudinary.uploader.upload(uploadInput, {
        folder: this.tempFolder,
        resource_type: "image",
        transformation: this.getOptimizedTransformations(options),
        tags: ["temp", "draft"],
        context: {
          uploaded_at: new Date().toISOString(),
          user_id: options.userId || "unknown",
          filename: options.filename || "unknown",
        },
      });

      console.log("✅ ImageManager: Upload successful:", {
        public_id: result.public_id,
        url: result.secure_url,
        format: result.format,
        bytes: result.bytes,
      });

      // Clean up local temp file only if it's a file path
      if (!Buffer.isBuffer(fileInput)) {
        await this.cleanupLocalFile(fileInput);
      }

      return {
        success: 1,
        file: {
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          is_temp: true,
        },
      };
    } catch (error) {
      // Clean up local file even if upload fails
      await this.cleanupLocalFile(filePath);
      throw error;
    }
  }

  /**
   * Move image from temp to permanent storage
   * @param {string} publicId - Cloudinary public ID
   * @param {string} targetFolder - Target folder (posts/drafts)
   * @returns {Promise<Object>} Move result
   */
  async moveToPermament(publicId, targetFolder = "posts") {
    try {
      const folder =
        targetFolder === "posts" ? this.postsFolder : this.draftsFolder;

      // Get current image info
      const resource = await cloudinary.api.resource(publicId);

      // Create new public ID for permanent storage
      const newPublicId = `${folder}/${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Copy to new location with updated tags
      const result = await cloudinary.uploader.upload(resource.secure_url, {
        public_id: newPublicId,
        resource_type: "image",
        tags: [targetFolder, "permanent"],
        context: {
          moved_at: new Date().toISOString(),
          original_temp_id: publicId,
        },
      });

      // Delete temp image
      await this.deleteImage(publicId);

      return {
        success: true,
        file: {
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          is_temp: false,
        },
      };
    } catch (error) {
      console.error("Error moving image to permanent storage:", error);
      throw error;
    }
  }

  /**
   * Delete image from Cloudinary
   * @param {string} publicId - Cloudinary public ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteImage(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return {
        success: result.result === "ok",
        public_id: publicId,
        result: result.result,
      };
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  }

  /**
   * Clean up temporary images older than specified time
   * @param {number} maxAgeHours - Maximum age in hours (default: 24)
   * @returns {Promise<Object>} Cleanup result
   */
  async cleanupTempImages(maxAgeHours = 24) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - maxAgeHours);

      // Get all temp images
      const result = await cloudinary.api.resources({
        type: "upload",
        prefix: this.tempFolder,
        tags: ["temp"],
        max_results: 500,
      });

      const imagesToDelete = result.resources.filter((resource) => {
        const uploadedAt = new Date(resource.created_at);
        return uploadedAt < cutoffDate;
      });

      const deletePromises = imagesToDelete.map((resource) =>
        this.deleteImage(resource.public_id)
      );

      const deleteResults = await Promise.allSettled(deletePromises);

      const successful = deleteResults.filter(
        (result) => result.status === "fulfilled"
      ).length;
      const failed = deleteResults.filter(
        (result) => result.status === "rejected"
      ).length;

      return {
        total_checked: result.resources.length,
        deleted: successful,
        failed: failed,
        cutoff_date: cutoffDate.toISOString(),
      };
    } catch (error) {
      console.error("Error cleaning up temp images:", error);
      throw error;
    }
  }

  /**
   * Get optimized transformations based on image type and size
   * @param {Object} options - Transformation options
   * @returns {Array} Cloudinary transformations
   */
  getOptimizedTransformations(options = {}) {
    const { width, height, quality = "auto:good", format = "auto" } = options;

    const transformations = [
      { quality: quality },
      { fetch_format: format },
      { dpr: "auto" }, // Auto device pixel ratio
    ];

    // Better responsive sizing for editor images
    if (width || height) {
      transformations.unshift({
        width: width || 800,
        height: height || 600,
        crop: "fill", // Fill the dimensions, crop if necessary
        gravity: "auto", // Smart cropping
      });
    } else {
      // Default optimizations - larger size for better display in editor
      transformations.unshift({
        width: 800,
        height: 600,
        crop: "fill",
        gravity: "auto",
      });
    }

    return transformations;
  }

  /**
   * Clean up local temporary file
   * @param {string} filePath - Local file path
   */
  async cleanupLocalFile(filePath) {
    try {
      await fs.unlink(filePath);
      console.log(`Cleaned up local temp file: ${filePath}`);
    } catch (error) {
      console.warn(`Failed to cleanup local file ${filePath}:`, error.message);
    }
  }

  /**
   * Get image info from Cloudinary
   * @param {string} publicId - Cloudinary public ID
   * @returns {Promise<Object>} Image info
   */
  async getImageInfo(publicId) {
    try {
      const resource = await cloudinary.api.resource(publicId);
      return {
        public_id: resource.public_id,
        url: resource.secure_url,
        width: resource.width,
        height: resource.height,
        format: resource.format,
        bytes: resource.bytes,
        created_at: resource.created_at,
        tags: resource.tags,
        context: resource.context,
      };
    } catch (error) {
      console.error("Error getting image info:", error);
      throw error;
    }
  }

  /**
   * Batch move images from temp to permanent
   * @param {Array} publicIds - Array of public IDs
   * @param {string} targetFolder - Target folder
   * @returns {Promise<Object>} Batch move result
   */
  async batchMoveToPermament(publicIds, targetFolder = "posts") {
    try {
      const movePromises = publicIds.map((publicId) =>
        this.moveToPermament(publicId, targetFolder)
      );

      const results = await Promise.allSettled(movePromises);

      const successful = results.filter(
        (result) => result.status === "fulfilled"
      );
      const failed = results.filter((result) => result.status === "rejected");

      return {
        total: publicIds.length,
        successful: successful.length,
        failed: failed.length,
        results: results.map((result, index) => ({
          public_id: publicIds[index],
          status: result.status,
          data: result.status === "fulfilled" ? result.value : null,
          error: result.status === "rejected" ? result.reason.message : null,
        })),
      };
    } catch (error) {
      console.error("Error in batch move:", error);
      throw error;
    }
  }
}

module.exports = new ImageManager();
