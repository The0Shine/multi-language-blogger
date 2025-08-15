const multer = require("multer");
const path = require("path");

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.memoryStorage(); // Dùng memory để upload lên cloud

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "video/mp4"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(
      new Error("Only jpg, png, gif, and mp4 files are allowed!"),
      false
    );
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter,
});

// Single file upload middleware
const uploadSingle = upload.single("image");

// Error handling middleware for upload errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB.",
      });
    }
  } else if (
    err.message.includes("Only jpg, png, gif, and mp4 files are allowed")
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid file type. Only jpg, png, gif, and mp4 files are allowed.",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Upload error occurred.",
  });
};

module.exports = {
  upload,
  uploadSingle,
  handleUploadError,
};
