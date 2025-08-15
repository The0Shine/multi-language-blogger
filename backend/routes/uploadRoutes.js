const express = require("express");
const router = express.Router();

const uploadController = require("../modules/upload/controllers/uploadController");
const authMiddleware = require("../middlewares/authMiddleware");

// Require login for all routes
router.use(authMiddleware.authenticate);

// Get upload signature
router.get("/signature", uploadController.getUploadSignature);

// Upload image file
router.post("/image", uploadController.uploadImage);

// Upload image by URL
router.post("/image-by-url", uploadController.uploadByUrl);

// Delete image
router.delete("/image/:public_id", uploadController.deleteImage);

// Get image info
router.get("/info/:public_id", uploadController.getImageInfo);

module.exports = router;
