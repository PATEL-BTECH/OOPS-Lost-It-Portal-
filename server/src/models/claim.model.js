/**
 * Claim Model
 * Module Lead: Neerja (Claims, verification, security staff, storage, handover)
 */
const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    foundItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoundItem',
      required: [true, 'Found item reference is required'],
      index: true
    },
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Claimant user ID is required'],
      index: true
    },
    // Detailed evidence proving ownership (e.g. answers to private verification questions)
    evidenceDescription: {
      type: String,
      required: [true, 'Ownership evidence and description are required'],
      maxlength: [2000, 'Evidence cannot exceed 2000 characters']
    },
    // Optional bill, purchase receipt, or photo proof in GridFS
    proofPhoto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'photos.files',
      default: null
    },
    contactPhone: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected', 'handed_over', 'cancelled'],
        message: 'Status must be pending, approved, rejected, handed_over, or cancelled'
      },
      default: 'pending',
      index: true
    },
    // Administrative Review
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    decisionReason: {
      type: String,
      default: ''
    },
    decidedAt: {
      type: Date,
      default: null
    },
    // Security Staff Physical Handover Record & Digital Receipt
    handoverDetails: {
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
      },
      claimantIdProof: {
        type: String,
        trim: true,
        default: ''
      },
      handoverDate: {
        type: Date,
        default: null
      },
      handoverNotes: {
        type: String,
        trim: true,
        default: ''
      },
      digitalReceiptNumber: {
        type: String,
        trim: true,
        default: ''
      }
    }
  },
  {
    timestamps: true
  }
);

claimSchema.index({ claimant: 1, createdAt: -1 });
claimSchema.index({ foundItem: 1, status: 1 });

const Claim = mongoose.model('Claim', claimSchema);

module.exports = Claim;
