import express from 'express';
import { calculateSeoScore } from '../seo/scoring.js';

const router = express.Router();

/**
 * POST /api/score
 * Plain code, no LLM.
 * Flesch-Kincaid grade (text-readability), keyword density (multi-word safe, ideal 0.5–2%, warn above 3%),
 * heading hierarchy check, title tag (≤60 chars), and meta description (140–160 chars).
 */
router.post('/score', (req, res, next) => {
  try {
    const {
      content = '',
      text = '',
      title = '',
      metaDescription = '',
      keywords = [],
      primaryKeyword = '',
      secondaryKeywords = [],
    } = req.body;

    const evaluationText = content || text || '';

    const report = calculateSeoScore({
      content: evaluationText,
      title,
      metaDescription,
      keywords,
      primaryKeyword,
      secondaryKeywords,
    });

    res.json(report);
  } catch (err) {
    next(err);
  }
});

export default router;
