/**
 * Notification Model
 * Campus Lost & Found Portal
 */
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['match_suggestion', 'claim_status', 'item_update', 'announcement', 'security_handover'],
      default: 'match_suggestion'
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    link: {
      type: String,
      default: ''
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    relatedItem: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    similarityScore: {
      type: Number,
      default: null
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ user: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
