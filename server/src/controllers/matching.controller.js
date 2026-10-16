/**
 * Match Suggestion Controller
 * Module Lead: Krisha (Found-item module, matching service, notifications)
 */
const MatchSuggestion = require('../models/matchSuggestion.model');
const LostItem = require('../models/lostItem.model');

/**
 * GET /api/matches/item/:id
 * Retrieve suggested matches for a specific item
 */
const getItemMatches = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type = 'lost' } = req.query;

    const query = { status: { $ne: 'dismissed' } };
    if (type === 'lost') {
      query.lostItem = id;
    } else {
      query.foundItem = id;
    }

    const matches = await MatchSuggestion.find(query)
      .populate({
        path: 'lostItem',
        select: 'name category brand color lastSeenLocation dateLost photo status reportedBy',
        populate: { path: 'category', select: 'name icon' }
      })
      .populate({
        path: 'foundItem',
        select: 'name category brand color locationFound dateFound photo status storageLocation reportedBy',
        populate: { path: 'category', select: 'name icon' }
      })
      .sort({ similarityScore: -1 });

    res.status(200).json({
      success: true,
      count: matches.length,
      matches
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/matches/my
 * Retrieve all matches for any lost items reported by logged-in student
 */
const getMyMatches = async (req, res, next) => {
  try {
    const myLostItems = await LostItem.find({ reportedBy: req.user._id }).select('_id');
    const lostItemIds = myLostItems.map((i) => i._id);

    const matches = await MatchSuggestion.find({
      lostItem: { $in: lostItemIds },
      status: { $ne: 'dismissed' }
    })
      .populate({
        path: 'lostItem',
        select: 'name category brand color photo status',
        populate: { path: 'category', select: 'name icon' }
      })
      .populate({
        path: 'foundItem',
        select: 'name category brand color locationFound dateFound photo status storageLocation',
        populate: { path: 'category', select: 'name icon' }
      })
      .sort({ similarityScore: -1 });

    res.status(200).json({
      success: true,
      count: matches.length,
      matches
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/matches/:id/dismiss
 * Dismiss an irrelevant match suggestion
 */
const dismissMatch = async (req, res, next) => {
  try {
    const match = await MatchSuggestion.findByIdAndUpdate(
      req.params.id,
      { status: 'dismissed' },
      { new: true }
    );

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match suggestion record not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Match dismissed successfully.',
      match
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItemMatches,
  getMyMatches,
  dismissMatch
};
