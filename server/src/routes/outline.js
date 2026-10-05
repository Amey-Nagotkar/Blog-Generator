import express from 'express';
import { generateOutline } from '../services/llmClient.js';
import { validateOutlineRequest } from '../middleware/validation.js';

const router = express.Router();

/**
 * POST /api/outline
 * Role: "experienced SEO content writer"
 * Input: topic, primary and secondary keywords, tone, word count, reading level.
 * Output only JSON: { title, sections: [{ id, h2, wordBudget, h3: [{ id, text }] }] }
 */
router.post('/outline', validateOutlineRequest, async (req, res, next) => {
  try {
    const {
      topic,
      primaryKeyword = '',
      secondaryKeywords = [],
      tone = 'authoritative and engaging',
      wordCount = 1200,
      readingLevel = 'intermediate',
    } = req.body;

    const outline = await generateOutline({
      topic,
      primaryKeyword,
      secondaryKeywords: Array.isArray(secondaryKeywords) ? secondaryKeywords : [secondaryKeywords].filter(Boolean),
      tone,
      wordCount,
      readingLevel,
      isMockMode: req.isMockMode,
    });

    res.json(outline);
  } catch (err) {
    next(err);
  }
});

export default router;
