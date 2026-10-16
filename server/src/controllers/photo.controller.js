/**
 * Photo Streaming Controller
 * Campus Lost & Found Portal
 */
const { getPhotoFromGridFS } = require('../services/photo.service');

/**
 * GET /api/photos/:id
 * Stream image binary directly from MongoDB GridFS
 */
const streamPhoto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { downloadStream, contentType, length } = await getPhotoFromGridFS(id);

    // Set HTTP response headers
    res.setHeader('Content-Type', contentType);
    if (length) {
      res.setHeader('Content-Length', length);
    }
    // Enable browser cache for performance
    res.setHeader('Cache-Control', 'public, max-age=86400');

    // Handle stream errors
    downloadStream.on('error', (err) => {
      console.error('[GridFS Stream Error]:', err.message);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Error streaming image from storage' });
      }
    });

    // Pipe download stream to Express response
    downloadStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  streamPhoto
};
