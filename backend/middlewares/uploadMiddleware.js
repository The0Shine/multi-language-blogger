const multer = require('multer');
const path = require('path');

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.memoryStorage(); // Dùng memory để upload lên cloud

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only jpg, png, gif, and mp4 files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter
});

module.exports = upload;
 