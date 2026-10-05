import express from 'express';
import { generateSectionDraft } from '../services/llmClient.js';
import { validateSectionDraftRequest } from '../middleware/validation.js';
import { getWordCount } from '../seo/scoring.js';

const router = express.Router();

/**
 * POST /api/draft/section
 * Input: approved outline, a section id, settings, and a summary of earlier sections.
 * Output is markdown for that section only.
 */
router.post('/draft/section', validateSectionDraftRequest, async (req, res, next) => {
  try {
    const {
      outline = {},
      sectionId,
      settings = {},
      earlierSummary = '',
    } = req.body;

    const markdown = await generateSectionDraft({
      outline,
      sectionId,
      settings,
      earlierSummary,
      isMockMode: req.isMockMode,
    });

    const wordCount = getWordCount(markdown);

    res.json({
      sectionId,
      content: markdown,
      wordCount,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
