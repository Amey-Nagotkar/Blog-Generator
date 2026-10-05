import { GoogleGenAI } from '@google/genai';

const TIMEOUT_MS = 30000;

function isMockMode(override) {
  if (override !== undefined && override !== null) {
    return Boolean(override);
  }
  return (
    process.env.MOCK_MODE === 'true' ||
    !process.env.GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY === 'your_gemini_api_key_here'
  );
}

function getGeminiModel() {
  return process.env.GEMINI_MODEL || '';
}

function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

/**
 * Execute a promise with a timeout
 */
async function withTimeout(promise, ms = TIMEOUT_MS) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`LLM request timed out after ${ms}ms`));
    }, ms);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Call Gemini LLM with 1 retry on error
 */
export async function callGemini({ prompt, systemInstruction, jsonMode = false }) {
  const ai = getGenAIClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const modelName = getGeminiModel();
  if (!modelName) {
    throw new Error('GEMINI_MODEL is not configured in .env');
  }

  const makeAttempt = async () => {
    const config = {};
    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }
    if (jsonMode) {
      config.responseMimeType = 'application/json';
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config,
    });

    const text = response.text || '';
    if (!text) {
      throw new Error('Empty response received from LLM');
    }
    return text;
  };

  try {
    return await withTimeout(makeAttempt(), TIMEOUT_MS);
  } catch (firstErr) {
    console.warn(`[llmClient] Attempt 1 failed (${firstErr.message}). Waiting 1.5s then retrying once...`);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    try {
      return await withTimeout(makeAttempt(), TIMEOUT_MS);
    } catch (retryErr) {
      console.error(`[llmClient] Attempt 2 also failed: ${retryErr.message}`);
      throw new Error(`LLM generation failed after retry: ${retryErr.message}`);
    }
  }
}

/**
 * Outline schema validator: { title, sections: [{ id, h2, wordBudget, h3: [{ id, text }] }] }
 */
export function validateOutlineSchema(data) {
  if (!data || typeof data !== 'object') return false;
  if (typeof data.title !== 'string' || !data.title.trim()) return false;
  if (!Array.isArray(data.sections) || data.sections.length === 0) return false;

  for (const s of data.sections) {
    if (!s || typeof s !== 'object') return false;
    if (typeof s.id !== 'string' || !s.id.trim()) return false;
    if (typeof s.h2 !== 'string' || !s.h2.trim()) return false;
    if (typeof s.wordBudget !== 'number' || s.wordBudget <= 0) return false;
    if (!Array.isArray(s.h3)) return false;

    for (const sub of s.h3) {
      if (!sub || typeof sub !== 'object') return false;
      if (typeof sub.id !== 'string' || !sub.id.trim()) return false;
      if (typeof sub.text !== 'string' || !sub.text.trim()) return false;
    }
  }

  return true;
}

/**
 * Generate Outline with schema validation and 1 schema retry
 */
export async function generateOutline({
  topic,
  primaryKeyword = '',
  secondaryKeywords = [],
  tone = 'authoritative and practical',
  wordCount = 1200,
  readingLevel = 'intermediate',
  isMockMode: mockOverride,
}) {
  if (isMockMode(mockOverride)) {
    return getMockOutline({ topic, primaryKeyword, secondaryKeywords, tone, wordCount, readingLevel });
  }

  const systemInstruction = `You are an experienced SEO content writer. Your task is to produce high-ranking, well-structured blog post outlines that satisfy search intent. You must output ONLY valid JSON matching this exact structure:
{
  "title": "Compelling SEO Title (≤ 60 chars)",
  "sections": [
    {
      "id": "section-1",
      "h2": "Section Heading",
      "wordBudget": 250,
      "h3": [
        { "id": "section-1-1", "text": "Subheading text" }
      ]
    }
  ]
}
Do not include any conversational preamble or markdown code fences if possible. Only valid JSON.`;

  const prompt = `Create an SEO-optimized blog outline for the following parameters:
- Topic: "${topic}"
- Primary Keyword: "${primaryKeyword}"
- Secondary Keywords: ${JSON.stringify(secondaryKeywords)}
- Tone: "${tone}"
- Target Total Word Count: ${wordCount} words (distribute wordBudget across sections so the sum equals approx ${wordCount})
- Target Reading Level: "${readingLevel}"

Requirements:
1. Ensure a logical hierarchy (Introduction, Core Concepts/Solutions, In-Depth Steps/Best Practices, Common Pitfalls/FAQ, Conclusion).
2. Distribute the wordBudget appropriately across all sections.
3. Include relevant H3 subheadings where beneficial for readability and SEO.`;

  const parseAndValidate = (rawText) => {
    let cleaned = rawText.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    const parsed = JSON.parse(cleaned);
    if (!validateOutlineSchema(parsed)) {
      throw new Error('Parsed outline does not match required schema');
    }
    return parsed;
  };

  try {
    const raw = await callGemini({ prompt, systemInstruction, jsonMode: true });
    return parseAndValidate(raw);
  } catch (err) {
    console.warn(`[llmClient] Outline generation or schema validation failed (${err.message}). Retrying with strict prompt...`);
    const retryPrompt = `${prompt}\n\nIMPORTANT: The previous attempt failed schema validation. Please strictly return ONLY valid JSON conforming to the schema.`;
    const retryRaw = await callGemini({ prompt: retryPrompt, systemInstruction, jsonMode: true });
    return parseAndValidate(retryRaw);
  }
}

/**
 * Generate a single section's markdown draft
 */
export async function generateSectionDraft({
  outline,
  sectionId,
  settings = {},
  earlierSummary = '',
  isMockMode: mockOverride,
}) {
  const currentSection = outline?.sections?.find((s) => s.id === sectionId);
  const sectionTitle = currentSection ? currentSection.h2 : `Section (${sectionId})`;
  const wordBudget = currentSection?.wordBudget || 300;
  const h3List = currentSection?.h3?.map((h) => (typeof h === 'string' ? h : h.text)) || [];

  if (isMockMode(mockOverride)) {
    return getMockSectionDraft({
      sectionTitle,
      wordBudget,
      h3List,
      settings,
      earlierSummary,
      outline,
      sectionId,
    });
  }

  const h3Instruction = h3List.length > 0
    ? `You MUST include and structure this section using EXACTLY these H3 subheadings with matching text (using markdown "### <Exact Heading Text>"):
${h3List.map((h, i) => `  ${i + 1}. ### ${h}`).join('\n')}
Do NOT alter, paraphrase, or omit any of these H3 subheadings.`
    : 'No specific H3 subheadings were assigned to this section.';

  const systemInstruction = `You are an experienced SEO content writer drafting an article titled "${outline?.title || 'Comprehensive Guide'}".
You write in high-quality Markdown.
Write ONLY the content for the specified section.
Do NOT repeat the entire blog title as an H1. Start with the section's H2 heading ("## ${sectionTitle}").
${h3Instruction}
Maintain the target tone (${settings.tone || 'authoritative and engaging'}), target reading level (${settings.readingLevel || 'standard'}), and smoothly incorporate target keywords where natural without keyword stuffing.`;

  const prompt = `Draft this specific section in Markdown:
- Section H2: "## ${sectionTitle}"
- Target Word Count: approx ${wordBudget} words
- Required H3 Subheadings to include exactly:
${h3List.map((h) => `- ### ${h}`).join('\n')}
- Primary Keyword: "${settings.primaryKeyword || ''}"
- Secondary Keywords: ${JSON.stringify(settings.secondaryKeywords || [])}
- Tone: "${settings.tone || 'engaging and authoritative'}"
- Context / Summary of previous sections (to maintain logical flow without repetition): "${earlierSummary || 'Beginning of the article.'}"

Generate the complete markdown text for this section only, ensuring all required H3 subheadings appear verbatim.`;

  const raw = await callGemini({ prompt, systemInstruction, jsonMode: false });
  return raw.trim();
}

/**
 * Suggest 5 related terms and tag keywords
 */
export async function generateKeywordSuggestions({
  primaryKeyword = '',
  secondaryKeywords = [],
  topic = '',
  isMockMode: mockOverride,
}) {
  if (isMockMode(mockOverride)) {
    return getMockKeywordSuggestions({ primaryKeyword, secondaryKeywords, topic }).suggestions;
  }

  const systemInstruction = `You are an expert SEO specialist.
You will be provided a topic and a list of keywords.
Return ONLY valid JSON with 5 related SEO keywords/search queries that would enhance search intent coverage.
Format:
{
  "suggestions": ["term 1", "term 2", "term 3", "term 4", "term 5"]
}`;

  const prompt = `Topic: "${topic}"
Primary Keyword: "${primaryKeyword}"
Existing Secondary Keywords: ${JSON.stringify(secondaryKeywords)}

Provide 5 high-value, related semantic search terms that are not already in the provided list.`;

  try {
    const raw = await callGemini({ prompt, systemInstruction, jsonMode: true });
    let cleaned = raw.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed.suggestions) && parsed.suggestions.length >= 5) {
      return parsed.suggestions.slice(0, 5);
    }
    if (Array.isArray(parsed.suggestions)) {
      return parsed.suggestions;
    }
    return getMockKeywordSuggestions({ primaryKeyword, secondaryKeywords, topic }).suggestions;
  } catch (err) {
    console.warn(`[llmClient] Keyword suggestions fallback triggered: ${err.message}`);
    return getMockKeywordSuggestions({ primaryKeyword, secondaryKeywords, topic }).suggestions;
  }
}

// -------------------------------------------------------------
// Dynamic, Topic-Aware Mock Data Helpers
// -------------------------------------------------------------

function getMockOutline({ topic, primaryKeyword, secondaryKeywords = [], tone, wordCount = 700 }) {
  const safeTopic = topic || 'Complete SEO Content Strategy';
  const kw = primaryKeyword || safeTopic;
  const sk = Array.isArray(secondaryKeywords) ? secondaryKeywords : [];
  const baseBudget = Math.max(100, Math.round(wordCount / 4));

  // Secondary keywords mapped across sections
  const sk1 = sk[0] || 'Core Concepts';
  const sk2 = sk[1] || 'Best Practices';
  const sk3 = sk[2] || 'Practical Frameworks';
  const sk4 = sk[3] || 'Continuous Improvement';

  // Capitalize topic cleanly for title (under 60 chars)
  let cleanTitle = `${safeTopic}: The Complete Practical Guide`;
  if (cleanTitle.length > 58) {
    cleanTitle = `${safeTopic.slice(0, 42)}: Expert Guide`;
  }

  return {
    title: cleanTitle,
    sections: [
      {
        id: 'sec-intro',
        h2: `Introduction to ${safeTopic}`,
        wordBudget: Math.round(baseBudget * 0.8),
        h3: [
          { id: 'sec-intro-1', text: `Why ${kw} Matters Today` },
          { id: 'sec-intro-2', text: `Key Benefits and Foundations of ${sk1}` },
        ],
      },
      {
        id: 'sec-core',
        h2: `Key Foundations & Strategies for ${kw}`,
        wordBudget: Math.round(baseBudget * 1.2),
        h3: [
          { id: 'sec-core-1', text: `Essential Techniques for ${sk2}` },
          { id: 'sec-core-2', text: `Common Pitfalls to Avoid in ${kw}` },
        ],
      },
      {
        id: 'sec-action',
        h2: `Step-by-Step Action Plan for ${sk3}`,
        wordBudget: Math.round(baseBudget * 1.2),
        h3: [
          { id: 'sec-action-1', text: `Setting Up and Preparing for ${kw}` },
          { id: 'sec-action-2', text: `Executing and Optimizing ${sk4}` },
        ],
      },
      {
        id: 'sec-conclusion',
        h2: `Conclusion & Actionable Next Steps for ${kw}`,
        wordBudget: Math.round(baseBudget * 0.8),
        h3: [
          { id: 'sec-conclusion-1', text: `Summary of Key Takeaways` },
          { id: 'sec-conclusion-2', text: `Your Immediate Action Checklist` },
        ],
      },
    ],
  };
}

function getMockSectionDraft({ sectionTitle, wordBudget, h3List = [], settings }) {
  const kw = settings?.primaryKeyword || 'this strategy';
  const tone = settings?.tone || 'practical';

  let body = `## ${sectionTitle}\n\n`;
  body += `Implementing effective approaches for **${kw}** is a cornerstone of modern success. In this section, we examine practical methods and actionable recommendations in a ${tone.toLowerCase()} voice to ensure measurable, high-impact outcomes.\n\n`;

  if (h3List.length > 0) {
    for (const h3 of h3List) {
      body += `### ${h3}\n\n`;
      body += `When addressing **${h3}**, clarity and consistency are crucial. Focusing on foundational principles ensures you achieve sustainable efficiency with **${kw}**. Key considerations include:\n\n`;
      body += `- **Strategic Alignment:** Establishing clear objectives directly tied to your overarching goals.\n`;
      body += `- **Streamlined Execution:** Eliminating unnecessary friction and applying tested best practices.\n`;
      body += `- **Continuous Feedback:** Measuring progress periodically to adapt and enhance results over time.\n\n`;
      body += `By applying these proven guidelines to **${h3}**, you establish repeatable workflows that yield lasting value.\n\n`;
    }
  } else {
    body += `To maximize results, teams must maintain disciplined attention to detail. Consistent application over time turns complex challenges into streamlined, enjoyable routines.\n\n`;
  }

  return body.trim();
}

function getMockKeywordSuggestions({ primaryKeyword, secondaryKeywords = [], topic }) {
  const base = (primaryKeyword || topic || 'strategy').toLowerCase();
  return {
    suggestions: [
      `${base} checklist`,
      `${base} best practices`,
      `${base} tips for beginners`,
      `how to master ${base}`,
      `advanced ${base} guide`,
    ],
  };
}
