/**
 * Physical Storage Locker Model
 * Campus Lost & Found Portal
 * Module Lead: Neerja (Security Desk & Physical Custody)
 */
const mongoose = require('mongoose');

const lockerHistorySchema = new mongoose.Schema({
  foundItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoundItem',
    required: true
  },
  itemName: {
    type: String,
    default: ''
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  releasedAt: {
    type: Date,
    default: null
  },
  releasedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  digitalReceiptNumber: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
});

const lockerSchema = new mongoose.Schema(
  {
    lockerNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    label: {
      type: String,
      required: true
    },
    zone: {
      type: String,
      required: true
    },
    capacityType: {
      type: String,
      enum: ['Safe', 'Vault', 'Bin', 'Bay'],
      default: 'Bin'
    },
    status: {
      type: String,
      enum: {
        values: ['vacant', 'occupied', 'maintenance'],
        message: 'Status must be vacant, occupied, or maintenance'
      },
      default: 'vacant',
      index: true
    },
    currentFoundItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoundItem',
      default: null
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    assignedAt: {
      type: Date,
      default: null
    },
    history: [lockerHistorySchema]
  },
  {
    timestamps: true
  }
);

const Locker = mongoose.model('Locker', lockerSchema);

module.exports = Locker;
