/**
 * Centralized API client for Blog Generator
 */

const MOCK_STORAGE_KEY = 'blog_generator_mock_mode';

export function getStoredMockMode() {
  const val = localStorage.getItem(MOCK_STORAGE_KEY);
  if (val === null) return null;
  return val === 'true';
}

export function setStoredMockMode(isMock) {
  localStorage.setItem(MOCK_STORAGE_KEY, String(isMock));
}

function getHeaders(mockModeOverride) {
  const headers = { 'Content-Type': 'application/json' };
  const mock = mockModeOverride !== undefined ? mockModeOverride : getStoredMockMode();
  if (mock !== null && mock !== undefined) {
    headers['X-Mock-Mode'] = String(mock);
  }
  return headers;
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data?.error?.message || `Request failed with status ${res.status}`;
    const error = new Error(errorMsg);
    error.status = res.status;
    error.code = data?.error?.code;
    error.details = data?.error;
    throw error;
  }
  return data;
}

export async function fetchHealth() {
  const res = await fetch('/api/health');
  return handleResponse(res);
}

export async function fetchKeywords({ topic, primaryKeyword, secondaryKeywords, mockMode }) {
  const res = await fetch('/api/keywords', {
    method: 'POST',
    headers: getHeaders(mockMode),
    body: JSON.stringify({
      topic,
      primaryKeyword,
      secondaryKeywords,
    }),
  });
  return handleResponse(res);
}

export async function fetchOutline({
  topic,
  primaryKeyword,
  secondaryKeywords,
  tone,
  wordCount,
  readingLevel,
  mockMode,
}) {
  const res = await fetch('/api/outline', {
    method: 'POST',
    headers: getHeaders(mockMode),
    body: JSON.stringify({
      topic,
      primaryKeyword,
      secondaryKeywords,
      tone,
      wordCount,
      readingLevel,
    }),
  });
  return handleResponse(res);
}

export async function fetchDraftSection({
  outline,
  sectionId,
  settings,
  earlierSummary,
  mockMode,
}) {
  const res = await fetch('/api/draft/section', {
    method: 'POST',
    headers: getHeaders(mockMode),
    body: JSON.stringify({
      outline,
      sectionId,
      settings,
      earlierSummary,
    }),
  });
  return handleResponse(res);
}

export async function fetchScore({
  content,
  title,
  metaDescription,
  primaryKeyword,
  secondaryKeywords,
  mockMode,
}) {
  const res = await fetch('/api/score', {
    method: 'POST',
    headers: getHeaders(mockMode),
    body: JSON.stringify({
      content,
      title,
      metaDescription,
      primaryKeyword,
      secondaryKeywords,
    }),
  });
  return handleResponse(res);
}
