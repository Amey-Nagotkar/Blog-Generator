import React, { useState } from 'react';
import { Plus, X, Lightbulb, ArrowRight, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { fetchKeywords } from '../api/client.js';

const DEMOS = [
  {
    name: 'Next.js',
    label: 'Demo 1/3 · Next.js',
    topic: 'Next.js 14 App Router Performance Optimization',
    primaryKeyword: 'Next.js 14 App Router',
    secondaryKeywords: [
      'React Server Components',
      'Streaming SSR',
      'Core Web Vitals',
      'Dynamic Routes',
    ],
    tone: 'Authoritative and practical',
    wordCount: 700,
    readingLevel: 'intermediate',
  },
  {
    name: 'Meal Prep',
    label: 'Demo 2/3 · Meal Prep',
    topic: "Beginner's Guide to Meal Prepping for a Busy Week",
    primaryKeyword: 'meal prep for beginners',
    secondaryKeywords: [
      'weekly meal planning',
      'healthy lunch ideas',
      'budget grocery list',
      'food storage tips',
    ],
    tone: 'Friendly and encouraging',
    wordCount: 700,
    readingLevel: 'intermediate',
  },
  {
    name: 'Small Biz',
    label: 'Demo 3/3 · Small Biz',
    topic: 'How Small Businesses Can Use Social Media to Get Local Customers',
    primaryKeyword: 'social media for small business',
    secondaryKeywords: [
      'local marketing',
      'Instagram for business',
      'Google Business Profile',
      'customer engagement',
    ],
    tone: 'Practical and persuasive',
    wordCount: 700,
    readingLevel: 'intermediate',
  },
];

const TONES = [
  'Authoritative and practical',
  'Friendly and encouraging',
  'Practical and persuasive',
  'Conversational and engaging',
  'Technical and in-depth',
  'Thought leadership and opinionated',
];

const READING_LEVELS = [
  { id: 'elementary', label: 'Elementary (Grade 5-6)' },
  { id: 'intermediate', label: 'Standard / General (Grade 8-10)' },
  { id: 'advanced', label: 'Advanced / Professional (Grade 12+)' },
];

export default function Step1TopicForm({
  formData,
  setFormData,
  onSubmit,
  loading,
  error,
  onRetry,
  onSwitchToMock,
  isMockMode,
}) {
  const [demoIndex, setDemoIndex] = useState(0);
  const [newSecondary, setNewSecondary] = useState('');
  const [suggestingKeywords, setSuggestingKeywords] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [validationError, setValidationError] = useState('');

  const handleCycleDemo = () => {
    const demo = DEMOS[demoIndex];
    setFormData({
      topic: demo.topic,
      primaryKeyword: demo.primaryKeyword,
      secondaryKeywords: [...demo.secondaryKeywords],
      tone: demo.tone,
      wordCount: demo.wordCount,
      readingLevel: demo.readingLevel,
    });
    setValidationError('');
    setSuggestions([]);
    setDemoIndex((prev) => (prev + 1) % DEMOS.length);
  };

  const handleAddSecondary = (text) => {
    const val = (text || newSecondary).trim();
    if (!val) return;
    if (formData.secondaryKeywords.includes(val)) {
      setNewSecondary('');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      secondaryKeywords: [...prev.secondaryKeywords, val],
    }));
    setNewSecondary('');
  };

  const handleRemoveSecondary = (kw) => {
    setFormData((prev) => ({
      ...prev,
      secondaryKeywords: prev.secondaryKeywords.filter((k) => k !== kw),
    }));
  };

  const handleFetchKeywordSuggestions = async () => {
    if (!formData.topic.trim() && !formData.primaryKeyword.trim()) {
      setValidationError('Enter a topic or primary keyword first to discover related keywords.');
      return;
    }
    setSuggestingKeywords(true);
    setValidationError('');
    try {
      const res = await fetchKeywords({
        topic: formData.topic,
        primaryKeyword: formData.primaryKeyword,
        secondaryKeywords: formData.secondaryKeywords,
      });
      if (Array.isArray(res.suggestions)) {
        const filtered = res.suggestions.filter(
          (s) =>
            !formData.secondaryKeywords.some(
              (existing) => existing.toLowerCase() === s.toLowerCase()
            ) && s.toLowerCase() !== formData.primaryKeyword.toLowerCase()
        );
        setSuggestions(filtered);
      }
    } catch (err) {
      console.warn('Failed to fetch suggestions:', err);
    } finally {
      setSuggestingKeywords(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.topic.trim()) {
      setValidationError('Topic is required to create a blog outline.');
      return;
    }
    if (formData.wordCount < 300 || formData.wordCount > 3000) {
      setValidationError('Target word count must be between 300 and 3,000 words.');
      return;
    }
    setValidationError('');
    onSubmit();
  };

  const currentDemoButtonLabel = DEMOS[demoIndex].label;

  return (
    <div className="max-w-3xl mx-auto px-4 pb-16">
      <div className="bg-white border border-[#E8E3DA] rounded-3xl p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-8">
        {/* Header & Cycling Demo Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E3DA] pb-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#0B3B38] tracking-tight">
              1. Topic &amp; Keywords
            </h2>
            <p className="text-xs text-[#7A8583] mt-1">
              Configure search parameters, target keywords, voice, and target length
            </p>
          </div>

          {/* Load Demo Pill Button */}
          <button
            type="button"
            onClick={handleCycleDemo}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-white hover:bg-[#FBF8F3] text-[#0E5C55] border border-[#E8E3DA] hover:border-[#0E5C55]/30 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
            title="Cycle between Tech, Meal Prep, and Small Business demos"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#C2652B]" />
            <span>Load Demo ({currentDemoButtonLabel})</span>
          </button>
        </div>

        {/* Validation or API Error Banner */}
        {(validationError || error) && (
          <div className="p-4 rounded-2xl bg-[#B3261E]/8 border border-[#B3261E]/25 text-[#B3261E] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-[#B3261E] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#B3261E]">Notice</p>
                <p className="text-xs text-[#3F4B49] mt-0.5">{validationError || error}</p>
              </div>
            </div>

            {/* Error actions: Retry & Switch to Mock */}
            {error && (
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                {!isMockMode && onSwitchToMock && (
                  <button
                    type="button"
                    onClick={onSwitchToMock}
                    className="px-3.5 py-1.5 bg-white hover:bg-[#F8E9DF] text-[#C2652B] border border-[#E8E3DA] rounded-full text-xs font-semibold shadow-sm transition-colors"
                  >
                    Switch to Mock
                  </button>
                )}
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="px-3.5 py-1.5 bg-[#B3261E] hover:bg-[#921e17] text-white rounded-full text-xs font-semibold shadow-sm transition-colors"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Topic Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="topic-input" className="text-xs font-semibold uppercase tracking-wider text-[#0B3B38]">
                Blog Topic <span className="text-[#B3261E]">*</span>
              </label>
              <span className="text-[11px] text-[#7A8583]">Required</span>
            </div>
            <input
              id="topic-input"
              type="text"
              value={formData.topic}
              onChange={(e) => {
                setFormData({ ...formData, topic: e.target.value });
                if (validationError) setValidationError('');
              }}
              placeholder="e.g. Next.js 14 App Router Performance Optimization"
              className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8E3DA] focus:border-[#C2652B] focus:ring-2 focus:ring-[#C2652B]/20 text-[#3F4B49] placeholder-[#7A8583]/50 text-sm transition-all outline-none"
            />
          </div>

          {/* Primary Keyword Input */}
          <div className="space-y-2">
            <label htmlFor="primary-kw-input" className="text-xs font-semibold uppercase tracking-wider text-[#0B3B38]">
              Primary Keyword (Target Query)
            </label>
            <input
              id="primary-kw-input"
              type="text"
              value={formData.primaryKeyword}
              onChange={(e) => setFormData({ ...formData, primaryKeyword: e.target.value })}
              placeholder="e.g. Next.js 14 App Router"
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E3DA] focus:border-[#C2652B] focus:ring-2 focus:ring-[#C2652B]/20 text-[#3F4B49] placeholder-[#7A8583]/50 text-sm transition-all outline-none"
            />
          </div>

          {/* Secondary Keywords Input & Chips */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#0B3B38]">
                Secondary Keywords
              </label>
              <button
                type="button"
                onClick={handleFetchKeywordSuggestions}
                disabled={suggestingKeywords || loading}
                className="text-xs text-[#C2652B] hover:text-[#A85220] flex items-center gap-1 font-semibold transition-colors disabled:opacity-50"
              >
                {suggestingKeywords ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Lightbulb className="w-3.5 h-3.5" />
                )}
                <span>Suggest 5 Terms</span>
              </button>
            </div>

            {/* Keyword Chips List (Teal Tint: #E6F1EF with #0E5C55 text) */}
            <div className="flex flex-wrap gap-2 min-h-[44px] p-3 rounded-xl bg-[#FBF8F3] border border-[#E8E3DA]">
              {formData.secondaryKeywords.length === 0 ? (
                <span className="text-xs text-[#7A8583] italic py-0.5">
                  No secondary keywords added yet. Add below or click "Suggest 5 Terms".
                </span>
              ) : (
                formData.secondaryKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#E6F1EF] text-[#0E5C55] border border-[#0E5C55]/20 shadow-xs"
                  >
                    <span>{kw}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSecondary(kw)}
                      className="text-[#0E5C55]/60 hover:text-[#B3261E] transition-colors"
                      title={`Remove "${kw}"`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Add Custom Keyword */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSecondary}
                onChange={(e) => setNewSecondary(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSecondary();
                  }
                }}
                placeholder="Type keyword and press Enter..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-[#E8E3DA] focus:border-[#C2652B] focus:ring-2 focus:ring-[#C2652B]/20 text-[#3F4B49] placeholder-[#7A8583]/50 text-xs transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddSecondary()}
                className="px-4 py-2 bg-white hover:bg-[#FBF8F3] text-[#0E5C55] rounded-full text-xs font-semibold border border-[#E8E3DA] transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 text-[#0E5C55]" />
                <span>Add</span>
              </button>
            </div>

            {/* Suggestions list (Terracotta Tint: #F8E9DF with #C2652B text) */}
            {suggestions.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-semibold text-[#7A8583] uppercase tracking-wider">
                  Suggested terms (Click to add):
                </span>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => handleAddSecondary(sug)}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-[#F8E9DF] text-[#C2652B] border border-[#C2652B]/30 hover:bg-[#C2652B]/15 transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-3 h-3 text-[#C2652B]" />
                      <span>{sug}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Settings Grid: Tone, Reading Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#E8E3DA]">
            <div className="space-y-2">
              <label htmlFor="tone-select" className="text-xs font-semibold uppercase tracking-wider text-[#0B3B38]">
                Writing Tone
              </label>
              <select
                id="tone-select"
                value={formData.tone}
                onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8E3DA] text-[#3F4B49] text-xs focus:border-[#C2652B] focus:ring-2 focus:ring-[#C2652B]/20 transition-all outline-none cursor-pointer"
              >
                {TONES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="reading-level-select" className="text-xs font-semibold uppercase tracking-wider text-[#0B3B38]">
                Reading Level
              </label>
              <select
                id="reading-level-select"
                value={formData.readingLevel}
                onChange={(e) => setFormData({ ...formData, readingLevel: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8E3DA] text-[#3F4B49] text-xs focus:border-[#C2652B] focus:ring-2 focus:ring-[#C2652B]/20 transition-all outline-none cursor-pointer"
              >
                {READING_LEVELS.map((rl) => (
                  <option key={rl.id} value={rl.id}>
                    {rl.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Word Count Slider (300 - 3000) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label htmlFor="word-count-range" className="text-xs font-semibold uppercase tracking-wider text-[#0B3B38]">
                Target Word Count: <span className="text-[#0E5C55] font-bold">{formData.wordCount} words</span>
              </label>
              <span className="text-[11px] text-[#7A8583]">300 – 3,000 words (Demos preset to 700w)</span>
            </div>
            <div className="flex items-center gap-4">
              <input
                id="word-count-range"
                type="range"
                min="300"
                max="3000"
                step="50"
                value={formData.wordCount}
                onChange={(e) => setFormData({ ...formData, wordCount: Number(e.target.value) })}
                className="w-full h-2 bg-[#E8E3DA] rounded-lg appearance-none cursor-pointer accent-[#0E5C55]"
              />
              <input
                type="number"
                min="300"
                max="3000"
                value={formData.wordCount}
                onChange={(e) => setFormData({ ...formData, wordCount: Number(e.target.value) })}
                className="w-24 px-3 py-1.5 rounded-xl bg-white border border-[#E8E3DA] text-[#3F4B49] text-xs text-center font-mono focus:border-[#C2652B] outline-none"
              />
            </div>
          </div>

          {/* Primary Button: Solid Teal Pill with Serif Semi-bold Label */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#0E5C55] hover:bg-[#0A4A44] text-white font-serif font-semibold text-sm shadow-sm transition-all hover:shadow active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Generating Outline...</span>
                </>
              ) : (
                <>
                  <span>Create Outline</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
