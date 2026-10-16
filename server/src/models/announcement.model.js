/**
 * Announcement Model
 * Campus Lost & Found Portal
 */
const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    content: {
      type: String,
      required: [true, 'Announcement content is required'],
      maxlength: [2000, 'Content cannot exceed 2000 characters']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    priority: {
      type: String,
      enum: ['normal', 'urgent', 'pinned'],
      default: 'normal'
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

announcementSchema.index({ createdAt: -1 });

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
