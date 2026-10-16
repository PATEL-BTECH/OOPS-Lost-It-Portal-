/**
 * GridFS Photo Storage Service
 * Campus Lost & Found Portal
 */
const { Readable } = require('stream');
const mongoose = require('mongoose');
const { getGridFSBucket } = require('../config/gridfs');

/**
 * Upload a photo buffer into MongoDB GridFS
 * @param {Buffer} buffer - Image file buffer
 * @param {string} originalname - Original file name
 * @param {string} mimetype - Validated image MIME type
 * @returns {Promise<ObjectId>} - Stored GridFS file ID
 */
const uploadPhotoToGridFS = (buffer, originalname, mimetype) => {
  return new Promise((resolve, reject) => {
    const bucket = getGridFSBucket();
    const sanitizedFilename = `${Date.now()}-${originalname.replace(/\s+/g, '_')}`;

    const uploadStream = bucket.openUploadStream(sanitizedFilename, {
      contentType: mimetype,
      metadata: {
        originalName: originalname,
        uploadedAt: new Date()
      }
    });

    const readableBufferStream = new Readable();
    readableBufferStream.push(buffer);
    readableBufferStream.push(null); // End of stream

    readableBufferStream
      .pipe(uploadStream)
      .on('error', (error) => {
        reject(error);
      })
      .on('finish', () => {
        resolve(uploadStream.id);
      });
  });
};

/**
 * Retrieve photo metadata and download stream from GridFS
 * @param {string} fileIdString - GridFS file ObjectId
 */
const getPhotoFromGridFS = async (fileIdString) => {
  if (!mongoose.Types.ObjectId.isValid(fileIdString)) {
    const error = new Error('Invalid photo ID format.');
    error.statusCode = 400;
    throw error;
  }

  const bucket = getGridFSBucket();
  const fileId = new mongoose.Types.ObjectId(fileIdString);

  // Find file metadata in photos.files
  const files = await bucket.find({ _id: fileId }).toArray();
  if (!files || files.length === 0) {
    const error = new Error('Photo not found.');
    error.statusCode = 404;
    throw error;
  }

  const fileDoc = files[0];
  const downloadStream = bucket.openDownloadStream(fileId);

  return {
    downloadStream,
    contentType: fileDoc.contentType || 'image/jpeg',
    length: fileDoc.length,
    filename: fileDoc.filename
  };
};

/**
 * Delete a photo from GridFS
 * @param {string} fileIdString - GridFS file ObjectId
 */
const deletePhotoFromGridFS = async (fileIdString) => {
  if (!fileIdString || !mongoose.Types.ObjectId.isValid(fileIdString)) {
    return false;
  }

  try {
    const bucket = getGridFSBucket();
    const fileId = new mongoose.Types.ObjectId(fileIdString);
    await bucket.delete(fileId);
    return true;
  } catch (error) {
    console.warn(`[GridFS Warning] Failed to delete photo ${fileIdString}:`, error.message);
    return false;
  }
};

module.exports = {
  uploadPhotoToGridFS,
  getPhotoFromGridFS,
  deletePhotoFromGridFS
};
