/**
 * Rule-Based Smart Matching Engine
 * Module Lead: Krisha (Found-item module, matching service, notifications)
 * 
 * Mathematical Weighting Breakdown (100 Point Max Score):
 * 1. Category Match:        35 Points (Mandatory threshold prerequisite)
 * 2. Name Keyword Overlap:  25 Points (Tokenized Jaccard similarity)
 * 3. Brand Compatibility:   15 Points (Exact or token matching)
 * 4. Color Matching:        10 Points (Color token intersection)
 * 5. Location Proximity:    10 Points (Shared building / room keywords)
 * 6. Date Proximity:         5 Points (Time difference within 0-14 days)
 */
const LostItem = require('../models/lostItem.model');
const FoundItem = require('../models/foundItem.model');
const MatchSuggestion = require('../models/matchSuggestion.model');
const Notification = require('../models/notification.model');
const { sendMatchEmail } = require('./email.service');

const STOP_WORDS = new Set(['the', 'a', 'an', 'and', 'or', 'of', 'for', 'in', 'on', 'at', 'to', 'my', 'is', 'it', 'with', 'item', 'lost', 'found']);

const tokenize = (text) => {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
};

/**
 * Calculate similarity between a single LostItem and FoundItem
 */
const calculateSimilarity = (lostItem, foundItem) => {
  const breakdown = {
    categoryMatch: false,
    categoryScore: 0,
    nameScore: 0,
    brandScore: 0,
    colorScore: 0,
    locationScore: 0,
    dateScore: 0
  };

  // 1. Category Matching (35 pts)
  const lostCatId = lostItem.category?._id?.toString() || lostItem.category?.toString();
  const foundCatId = foundItem.category?._id?.toString() || foundItem.category?.toString();

  if (lostCatId && foundCatId && lostCatId === foundCatId) {
    breakdown.categoryMatch = true;
    breakdown.categoryScore = 35;
  } else {
    // If categories differ completely, similarity is 0
    return { score: 0, breakdown };
  }

  // 2. Name Keyword Overlap (25 pts)
  const lostNameTokens = tokenize(lostItem.name);
  const foundNameTokens = tokenize(foundItem.name);

  if (lostNameTokens.length > 0 && foundNameTokens.length > 0) {
    const intersection = lostNameTokens.filter((token) => foundNameTokens.includes(token));
    const unionSize = new Set([...lostNameTokens, ...foundNameTokens]).size;
    const jaccard = unionSize > 0 ? intersection.length / unionSize : 0;
    breakdown.nameScore = Math.round(jaccard * 25);

    // Boost if item name includes direct brand or specific model token
    if (intersection.length >= 2) {
      breakdown.nameScore = Math.min(25, breakdown.nameScore + 5);
    }
  }

  // 3. Brand Compatibility (15 pts)
  const lostBrand = (lostItem.brand || '').trim().toLowerCase();
  const foundBrand = (foundItem.brand || '').trim().toLowerCase();

  if (lostBrand && foundBrand) {
    if (lostBrand === foundBrand) {
      breakdown.brandScore = 15;
    } else if (lostBrand.includes(foundBrand) || foundBrand.includes(lostBrand)) {
      breakdown.brandScore = 10;
    }
  }

  // 4. Color Matching (10 pts)
  const lostColorTokens = tokenize(lostItem.color);
  const foundColorTokens = tokenize(foundItem.color);

  if (lostColorTokens.length > 0 && foundColorTokens.length > 0) {
    const commonColors = lostColorTokens.filter((c) => foundColorTokens.includes(c));
    if (commonColors.length > 0) {
      breakdown.colorScore = 10;
    }
  }

  // 5. Location Proximity (10 pts)
  const lostLocTokens = tokenize(lostItem.lastSeenLocation);
  const foundLocTokens = tokenize(foundItem.locationFound);

  if (lostLocTokens.length > 0 && foundLocTokens.length > 0) {
    const commonLoc = lostLocTokens.filter((l) => foundLocTokens.includes(l));
    if (commonLoc.length > 0) {
      breakdown.locationScore = Math.min(10, commonLoc.length * 5);
    }
  }

  // 6. Date Proximity (5 pts)
  if (lostItem.dateLost && foundItem.dateFound) {
    const timeDiffMs = new Date(foundItem.dateFound) - new Date(lostItem.dateLost);
    const dayDiff = Math.round(timeDiffMs / (1000 * 60 * 60 * 24));

    // Item should generally be found on or after date lost (allow -1 day buffer for timezones)
    if (dayDiff >= -1 && dayDiff <= 3) {
      breakdown.dateScore = 5;
    } else if (dayDiff > 3 && dayDiff <= 7) {
      breakdown.dateScore = 4;
    } else if (dayDiff > 7 && dayDiff <= 14) {
      breakdown.dateScore = 2;
    }
  }

  const totalScore =
    breakdown.categoryScore +
    breakdown.nameScore +
    breakdown.brandScore +
    breakdown.colorScore +
    breakdown.locationScore +
    breakdown.dateScore;

  return {
    score: Math.min(100, totalScore),
    breakdown
  };
};

/**
 * Scan for matches when a new Lost Item is reported
 */
const matchLostItemAgainstFoundItems = async (lostItemId) => {
  const lostItem = await LostItem.findById(lostItemId).populate('reportedBy');
  if (!lostItem) return;

  const foundCandidates = await FoundItem.find({
    category: lostItem.category,
    status: { $in: ['available', 'claim_pending'] }
  });

  for (const foundItem of foundCandidates) {
    const { score, breakdown } = calculateSimilarity(lostItem, foundItem);

    if (score >= 45) {
      const suggestion = await MatchSuggestion.findOneAndUpdate(
        { lostItem: lostItem._id, foundItem: foundItem._id },
        {
          similarityScore: score,
          breakdown,
          status: 'suggested'
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Notify if high confidence and not yet notified
      if (score >= 50 && !suggestion.notifiedUsers) {
        await notifyUsersOfMatch(lostItem, foundItem, score);
        suggestion.notifiedUsers = true;
        await suggestion.save();
      }
    }
  }
};

/**
 * Scan for matches when a new Found Item is reported
 */
const matchFoundItemAgainstLostItems = async (foundItemId) => {
  const foundItem = await FoundItem.findById(foundItemId).populate('reportedBy');
  if (!foundItem) return;

  const lostCandidates = await LostItem.find({
    category: foundItem.category,
    status: 'open'
  }).populate('reportedBy');

  for (const lostItem of lostCandidates) {
    const { score, breakdown } = calculateSimilarity(lostItem, foundItem);

    if (score >= 45) {
      const suggestion = await MatchSuggestion.findOneAndUpdate(
        { lostItem: lostItem._id, foundItem: foundItem._id },
        {
          similarityScore: score,
          breakdown,
          status: 'suggested'
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      if (score >= 50 && !suggestion.notifiedUsers) {
        await notifyUsersOfMatch(lostItem, foundItem, score);
        suggestion.notifiedUsers = true;
        await suggestion.save();
      }
    }
  }
};

/**
 * Create in-app notification and dispatch email to the owner of the lost item
 */
const notifyUsersOfMatch = async (lostItem, foundItem, score) => {
  try {
    if (!lostItem.reportedBy) return;

    // 1. Create In-App Notification
    await Notification.create({
      user: lostItem.reportedBy._id,
      type: 'match_suggestion',
      title: `Potential Match Detected (${score}%)`,
      message: `A found item "${foundItem.name}" closely resembles your lost item "${lostItem.name}".`,
      link: `/items/found/${foundItem._id}`,
      relatedItem: foundItem._id,
      similarityScore: score
    });

    // 2. Dispatch Email through Nodemailer
    if (lostItem.reportedBy.email) {
      await sendMatchEmail({
        toEmail: lostItem.reportedBy.email,
        recipientName: lostItem.reportedBy.name || 'Student',
        lostItemName: lostItem.name,
        foundItemName: foundItem.name,
        score,
        link: `/items/found/${foundItem._id}`
      });
    }
  } catch (error) {
    console.warn('[Notification Notice] Could not send match alert:', error.message);
  }
};

module.exports = {
  calculateSimilarity,
  matchLostItemAgainstFoundItems,
  matchFoundItemAgainstLostItems
};
