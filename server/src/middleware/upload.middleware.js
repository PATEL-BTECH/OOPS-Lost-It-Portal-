/**
 * Multer Memory Storage Upload Middleware
 * Enforces 2 MB size limits and image file type validation.
 */
const multer = require('multer');

// Configure memory storage
const storage = multer.memoryStorage();

// Validate file MIME types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only JPEG, PNG, and WebP images are permitted.');
    error.statusCode = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2 MB maximum
  },
  fileFilter
});

// Helper wrapper to handle multer errors gracefully
const singlePhotoUpload = (fieldName = 'photo') => {
  const uploader = upload.single(fieldName);

  return (req, res, next) => {
    uploader(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum photo size is 2 MB.'
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      } else if (err) {
        return res.status(err.statusCode || 400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

module.exports = {
  upload,
  singlePhotoUpload
};
