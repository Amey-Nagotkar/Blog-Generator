import express from 'express';
import { generateKeywordSuggestions } from '../services/llmClient.js';
import { validateKeywordsRequest } from '../middleware/validation.js';

const router = express.Router();

/**
 * POST /api/keywords
 * Dedupe and tag keywords, and suggest 5 related terms
 */
router.post('/keywords', validateKeywordsRequest, async (req, res, next) => {
  try {
    const { topic = '', primaryKeyword = '', secondaryKeywords = [], keywords = [] } = req.body;

    // Build raw list
    const rawList = [];
    if (primaryKeyword && primaryKeyword.trim()) {
      rawList.push({ keyword: primaryKeyword.trim(), tag: 'primary' });
    }

    if (Array.isArray(secondaryKeywords)) {
      for (const item of secondaryKeywords) {
        if (typeof item === 'string' && item.trim()) {
          rawList.push({ keyword: item.trim(), tag: 'secondary' });
        } else if (item && typeof item === 'object' && item.keyword) {
          rawList.push({ keyword: item.keyword.trim(), tag: item.tag || 'secondary' });
        }
      }
    }

    if (Array.isArray(keywords)) {
      for (const item of keywords) {
        if (typeof item === 'string' && item.trim()) {
          rawList.push({ keyword: item.trim(), tag: rawList.length === 0 ? 'primary' : 'secondary' });
        } else if (item && typeof item === 'object' && item.keyword) {
          rawList.push({ keyword: item.keyword.trim(), tag: item.tag || 'secondary' });
        }
      }
    }

    // Deduplicate case-insensitively while preserving original casing and highest priority tag
    const seen = new Map();
    for (const item of rawList) {
      const lower = item.keyword.toLowerCase();
      if (!seen.has(lower)) {
        seen.set(lower, item);
      } else {
        // If existing is secondary but current is primary, upgrade tag
        if (seen.get(lower).tag === 'secondary' && item.tag === 'primary') {
          seen.set(lower, item);
        }
      }
    }

    const dedupedKeywords = Array.from(seen.values());

    const effectivePrimary =
      dedupedKeywords.find((k) => k.tag === 'primary')?.keyword ||
      primaryKeyword ||
      dedupedKeywords[0]?.keyword ||
      topic;

    const effectiveSecondary = dedupedKeywords
      .filter((k) => k.keyword.toLowerCase() !== effectivePrimary.toLowerCase())
      .map((k) => k.keyword);

    const suggestions = await generateKeywordSuggestions({
      topic,
      primaryKeyword: effectivePrimary,
      secondaryKeywords: effectiveSecondary,
      isMockMode: req.isMockMode,
    });

    const suggestionsList = Array.isArray(suggestions)
      ? suggestions
      : suggestions?.suggestions || [];

    res.json({
      keywords: dedupedKeywords,
      suggestions: suggestionsList.slice(0, 5),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
