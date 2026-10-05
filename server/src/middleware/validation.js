/**
 * Validation middleware for /api/outline and general blog generation requests
 */
export function validateOutlineRequest(req, res, next) {
  const { topic, wordCount } = req.body;

  if (!topic || typeof topic !== 'string' || !topic.trim()) {
    return res.status(400).json({
      error: {
        code: 'INVALID_TOPIC',
        message: 'The "topic" field is required and must be a non-empty string.',
      },
    });
  }

  if (wordCount !== undefined && wordCount !== null) {
    const parsedWordCount = Number(wordCount);
    if (isNaN(parsedWordCount) || parsedWordCount < 300 || parsedWordCount > 3000) {
      return res.status(400).json({
        error: {
          code: 'INVALID_WORD_COUNT',
          message: 'The "wordCount" must be a number between 300 and 3000 words.',
          received: wordCount,
        },
      });
    }
    req.body.wordCount = parsedWordCount;
  } else {
    req.body.wordCount = 1200; // default
  }

  next();
}

/**
 * Validation middleware for /api/draft/section
 */
export function validateSectionDraftRequest(req, res, next) {
  const { outline, sectionId } = req.body;

  if (!sectionId || typeof sectionId !== 'string' || !sectionId.trim()) {
    return res.status(400).json({
      error: {
        code: 'INVALID_SECTION_ID',
        message: 'The "sectionId" field is required and must identify a valid section.',
      },
    });
  }

  if (outline && typeof outline !== 'object') {
    return res.status(400).json({
      error: {
        code: 'INVALID_OUTLINE',
        message: 'The "outline" field, if provided, must be a valid outline object.',
      },
    });
  }

  next();
}

/**
 * Validation middleware for /api/keywords
 */
export function validateKeywordsRequest(req, res, next) {
  const { topic, primaryKeyword, secondaryKeywords, keywords } = req.body;

  const hasTopicOrKw = (topic && topic.trim()) ||
    (primaryKeyword && primaryKeyword.trim()) ||
    (Array.isArray(secondaryKeywords) && secondaryKeywords.length > 0) ||
    (Array.isArray(keywords) && keywords.length > 0);

  if (!hasTopicOrKw) {
    return res.status(400).json({
      error: {
        code: 'MISSING_KEYWORDS_INPUT',
        message: 'Please provide at least a topic, primaryKeyword, or secondaryKeywords array.',
      },
    });
  }

  next();
}
