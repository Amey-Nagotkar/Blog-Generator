import rs from 'text-readability';

/**
 * Clean markdown text to get plain text for linguistic analysis
 */
export function cleanMarkdown(markdown = '') {
  if (!markdown) return '';
  return markdown
    .replace(/^#+\s+/gm, '') // Remove heading hashes
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // Remove bold
    .replace(/(\*|_)(.*?)\1/g, '$2') // Remove italic
    .replace(/`{1,3}[^`]*`{1,3}/g, '') // Remove inline code and codeblocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links, keep text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Remove images
    .replace(/>\s+/g, '') // Remove blockquotes
    .replace(/[-*+]\s+/g, '') // Remove list bullets
    .replace(/\n+/g, ' ') // Replace newlines with space
    .trim();
}

/**
 * Count words in plain text
 */
export function getWordCount(text = '') {
  const words = text.match(/\b[\w'-]+\b/g);
  return words ? words.length : 0;
}

/**
 * Calculate multi-word safe keyword density
 * Ideal range: 0.5% - 2.0%
 * Warning: > 3.0%
 */
export function calculateKeywordDensity(text = '', keywords = []) {
  const plain = cleanMarkdown(text).toLowerCase();
  const totalWords = getWordCount(plain);

  if (totalWords === 0 || !Array.isArray(keywords) || keywords.length === 0) {
    return {
      totalWords,
      keywords: [],
      overallStatus: 'no_keywords',
    };
  }

  const results = keywords.map((item) => {
    const rawKeyword = typeof item === 'string' ? item : item.keyword || item.name || '';
    const kw = rawKeyword.trim().toLowerCase();
    if (!kw) return null;

    // Escape regex special chars
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match whole keyword/phrase boundary
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    const matches = plain.match(regex);
    const count = matches ? matches.length : 0;

    // Word count of the keyword itself
    const kwWordCount = getWordCount(kw) || 1;
    // Standard keyword density: (count * words_in_keyword / total_words) * 100
    const densityPercent = parseFloat(((count * kwWordCount / totalWords) * 100).toFixed(2));

    let status = 'ideal';
    let message = 'Optimal keyword density (0.5% - 2.0%)';

    if (count === 0) {
      status = 'missing';
      message = 'Keyword not found in content';
    } else if (densityPercent < 0.5) {
      status = 'low';
      message = 'Slightly under-represented (< 0.5%)';
    } else if (densityPercent > 3.0) {
      status = 'warning';
      message = 'Keyword stuffing risk (> 3.0%)';
    } else if (densityPercent > 2.0) {
      status = 'high';
      message = 'Slightly elevated (2.0% - 3.0%)';
    }

    return {
      keyword: rawKeyword,
      count,
      densityPercent,
      status,
      message,
      isIdeal: densityPercent >= 0.5 && densityPercent <= 2.0,
      isWarning: densityPercent > 3.0,
    };
  }).filter(Boolean);

  const hasWarning = results.some((r) => r.isWarning);
  const allIdeal = results.length > 0 && results.every((r) => r.isIdeal);

  return {
    totalWords,
    keywords: results,
    overallStatus: hasWarning ? 'warning' : allIdeal ? 'ideal' : 'acceptable',
  };
}

/**
 * Check Heading Hierarchy in Markdown
 * Verifies single H1, and that heading levels do not skip (e.g. H2 -> H4 without H3).
 */
export function checkHeadingHierarchy(markdown = '') {
  const lines = markdown.split('\n');
  const headings = [];
  const issues = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].trim(),
        line: i + 1,
      });
    }
  }

  if (headings.length === 0) {
    return {
      valid: false,
      issues: ['No headings found in content.'],
      headings: [],
      h1Count: 0,
      h2Count: 0,
      h3Count: 0,
    };
  }

  const h1s = headings.filter((h) => h.level === 1);
  const h1Count = h1s.length;
  const h2Count = headings.filter((h) => h.level === 2).length;
  const h3Count = headings.filter((h) => h.level === 3).length;

  if (h1Count > 1) {
    issues.push(`Multiple H1 tags found (${h1Count}). An SEO-optimized page should have exactly 1 H1.`);
  }

  // Check for skipped levels
  let prevLevel = headings[0].level;
  for (let i = 1; i < headings.length; i++) {
    const current = headings[i];
    if (current.level > prevLevel + 1) {
      issues.push(`Heading level skipped: jumped from H${prevLevel} to H${current.level} ("${current.text}")`);
    }
    prevLevel = current.level;
  }

  return {
    valid: issues.length === 0,
    issues,
    headings,
    h1Count,
    h2Count,
    h3Count,
  };
}

/**
 * Check Title Tag (Target ≤ 60 chars)
 */
export function evaluateTitleTag(title = '') {
  const cleanTitle = (title || '').trim();
  const length = cleanTitle.length;
  const ideal = length > 0 && length <= 60;
  
  let status = 'optimal';
  let message = 'Title is within ideal length (≤ 60 chars)';

  if (length === 0) {
    status = 'missing';
    message = 'Title tag is missing';
  } else if (length > 60) {
    status = 'too_long';
    message = `Title is ${length} chars (exceeds recommended ≤ 60 chars and may be truncated on SERPs)`;
  } else if (length < 20) {
    status = 'too_short';
    message = `Title is very short (${length} chars). Consider making it more descriptive.`;
  }

  return {
    title: cleanTitle,
    length,
    ideal,
    status,
    message,
  };
}

/**
 * Check Meta Description (Target 140–160 chars)
 */
export function evaluateMetaDescription(metaDescription = '') {
  const cleanMeta = (metaDescription || '').trim();
  const length = cleanMeta.length;
  const ideal = length >= 140 && length <= 160;

  let status = 'optimal';
  let message = 'Meta description length is ideal (140–160 chars)';

  if (length === 0) {
    status = 'missing';
    message = 'Meta description is missing';
  } else if (length < 140) {
    status = 'too_short';
    message = `Meta description is ${length} chars (under target 140–160 chars)`;
  } else if (length > 160) {
    status = 'too_long';
    message = `Meta description is ${length} chars (exceeds 160 chars and may be truncated on SERPs)`;
  }

  return {
    metaDescription: cleanMeta,
    length,
    ideal,
    status,
    message,
  };
}

/**
 * Readability Grade using Flesch-Kincaid
 */
export function evaluateReadability(text = '') {
  const plain = cleanMarkdown(text);
  if (!plain || getWordCount(plain) < 10) {
    return {
      fleschKincaidGrade: 0,
      readingEase: 0,
      interpretation: 'Insufficient text for readability analysis',
      status: 'insufficient_text',
    };
  }

  let grade = 0;
  let ease = 0;

  try {
    grade = rs.fleschKincaidGrade(plain);
    ease = rs.fleschReadingEase(plain);
  } catch (err) {
    grade = 8;
    ease = 65;
  }

  let interpretation = 'Standard reading level (Grade 7-9)';
  if (grade <= 6) interpretation = 'Easy to read (Elementary / Middle school)';
  else if (grade <= 10) interpretation = 'Conversational & accessible (High school)';
  else if (grade <= 14) interpretation = 'Advanced / College level';
  else interpretation = 'Academic / Highly technical';

  return {
    fleschKincaidGrade: parseFloat(grade.toFixed(1)),
    readingEase: parseFloat(ease.toFixed(1)),
    interpretation,
    status: 'analyzed',
  };
}

/**
 * Complete SEO Scoring Engine
 */
export function calculateSeoScore({
  content = '',
  title = '',
  metaDescription = '',
  keywords = [],
  primaryKeyword = '',
  secondaryKeywords = [],
}) {
  // Combine all keyword inputs safely
  const keywordList = [];
  if (primaryKeyword) keywordList.push(primaryKeyword);
  if (Array.isArray(secondaryKeywords)) {
    keywordList.push(...secondaryKeywords);
  }
  if (Array.isArray(keywords)) {
    keywordList.push(...keywords);
  }

  // Deduplicate keyword list
  const uniqueKeywords = Array.from(
    new Set(
      keywordList
        .map((k) => (typeof k === 'string' ? k.trim() : k?.keyword?.trim()))
        .filter(Boolean)
    )
  );

  const readability = evaluateReadability(content);
  const keywordDensity = calculateKeywordDensity(content, uniqueKeywords);
  const headingHierarchy = checkHeadingHierarchy(content);
  const titleTag = evaluateTitleTag(title);
  const metaTag = evaluateMetaDescription(metaDescription);

  // Calculate composite score (0-100)
  let score = 100;

  // Title penalties
  if (titleTag.status === 'missing') score -= 20;
  else if (titleTag.status === 'too_long') score -= 10;
  else if (titleTag.status === 'too_short') score -= 5;

  // Meta description penalties
  if (metaTag.status === 'missing') score -= 15;
  else if (!metaTag.ideal) score -= 5;

  // Heading penalties
  if (!headingHierarchy.valid) {
    score -= Math.min(20, headingHierarchy.issues.length * 8);
  }

  // Keyword density penalties
  if (keywordDensity.keywords.length > 0) {
    for (const kw of keywordDensity.keywords) {
      if (kw.isWarning) score -= 15;
      else if (kw.status === 'missing') score -= 8;
    }
  }

  // Readability bounds
  if (readability.fleschKincaidGrade > 14) score -= 8;

  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    overallScore: score,
    readability,
    keywordDensity,
    headingHierarchy,
    titleTag,
    metaDescription: metaTag,
    wordCount: keywordDensity.totalWords,
  };
}
