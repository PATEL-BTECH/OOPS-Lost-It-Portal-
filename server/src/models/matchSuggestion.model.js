/**
 * MatchSuggestion Model
 * Module Lead: Krisha (Found-item module, matching service, notifications)
 */
const mongoose = require('mongoose');

const matchSuggestionSchema = new mongoose.Schema(
  {
    lostItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LostItem',
      required: true,
      index: true
    },
    foundItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoundItem',
      required: true,
      index: true
    },
    similarityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    breakdown: {
      categoryMatch: { type: Boolean, default: false },
      categoryScore: { type: Number, default: 0 },
      nameScore: { type: Number, default: 0 },
      brandScore: { type: Number, default: 0 },
      colorScore: { type: Number, default: 0 },
      locationScore: { type: Number, default: 0 },
      dateScore: { type: Number, default: 0 }
    },
    status: {
      type: String,
      enum: ['suggested', 'dismissed', 'claimed', 'confirmed'],
      default: 'suggested'
    },
    notifiedUsers: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate match records between the same lost and found items
matchSuggestionSchema.index({ lostItem: 1, foundItem: 1 }, { unique: true });
matchSuggestionSchema.index({ similarityScore: -1 });

const MatchSuggestion = mongoose.model('MatchSuggestion', matchSuggestionSchema);

module.exports = MatchSuggestion;
