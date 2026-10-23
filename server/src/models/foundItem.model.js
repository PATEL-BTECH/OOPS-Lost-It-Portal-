/**
 * FoundItem Model
 * Campus Lost & Found Portal
 */
const mongoose = require('mongoose');

const foundItemSchema = new mongoose.Schema(
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
    locationFound: {
      type: String,
      required: [true, 'Location where item was found is required'],
      trim: true
    },
    dateFound: {
      type: Date,
      required: [true, 'Date found is required'],
      default: Date.now
    },
    photo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'photos.files',
      default: null
    },
    handedToSecurity: {
      type: Boolean,
      default: false
    },
    storageLocation: {
      type: String,
      trim: true,
      default: 'With Finder (Pending Security Handover)'
    },
    custodyLocation: {
      type: String,
      trim: true,
      default: 'MAIN_POST'
    },
    assignedLocker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Locker',
      default: null
    },
    // CRITICAL SECURITY REQUIREMENT:
    // Confidential distinguishing details (e.g., serial number suffix, passcode hint, engraving)
    // Never exposed in public search results.
    verificationDetails: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: ['available', 'claim_pending', 'handed_over', 'archived'],
        message: 'Status must be available, claim_pending, handed_over, or archived'
      },
      default: 'available',
      index: true
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Finder user ID is required'],
      index: true
    },
    securityReceivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Search Index for keyword querying
foundItemSchema.index({
  name: 'text',
  description: 'text',
  brand: 'text',
  color: 'text',
  locationFound: 'text'
});

foundItemSchema.index({ category: 1, status: 1 });
foundItemSchema.index({ dateFound: -1 });

const FoundItem = mongoose.model('FoundItem', foundItemSchema);

module.exports = FoundItem;
