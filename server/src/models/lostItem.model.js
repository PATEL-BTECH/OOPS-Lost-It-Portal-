/**
 * LostItem Model
 * Campus Lost & Found Portal
 */
const mongoose = require('mongoose');

const lostItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [120, 'Item name cannot exceed 120 characters']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Item category is required']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    brand: {
      type: String,
      trim: true,
      default: ''
    },
    color: {
      type: String,
      trim: true,
      default: ''
    },
    lastSeenLocation: {
      type: String,
      required: [true, 'Last seen location is required (e.g., Library 2nd floor, Lab 4, Canteen)'],
      trim: true
    },
    dateLost: {
      type: Date,
      required: [true, 'Date lost is required'],
      default: Date.now
    },
    photo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'photos.files',
      default: null
    },
    status: {
      type: String,
      enum: {
        values: ['open', 'matched', 'claimed', 'recovered', 'closed'],
        message: 'Status must be open, matched, claimed, recovered, or closed'
      },
      default: 'open',
      index: true
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter user ID is required'],
      index: true
    },
    rewardOffered: {
      type: String,
      trim: true,
      default: ''
    },
    contactPhone: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Search Index for keyword querying
lostItemSchema.index({
  name: 'text',
  description: 'text',
  brand: 'text',
  color: 'text',
  lastSeenLocation: 'text'
});

lostItemSchema.index({ category: 1, status: 1 });
lostItemSchema.index({ dateLost: -1 });

const LostItem = mongoose.model('LostItem', lostItemSchema);

module.exports = LostItem;
