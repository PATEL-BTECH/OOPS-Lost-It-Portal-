/**
 * MongoDB GridFS Bucket Configuration
 * Campus Lost & Found Portal
 */
const mongoose = require('mongoose');

let gridfsBucket = null;

/**
 * Initialize or retrieve GridFS bucket named 'photos'
 */
const getGridFSBucket = () => {
  if (gridfsBucket) {
    return gridfsBucket;
  }

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('MongoDB connection is not established yet. Cannot access GridFS bucket.');
  }

  gridfsBucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: 'photos'
  });

  return gridfsBucket;
};

module.exports = {
  getGridFSBucket
};
