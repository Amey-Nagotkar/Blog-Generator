import React, { useMemo } from 'react';
import { marked } from 'marked';
import {
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  FileText,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Clock,
  Info,
} from 'lucide-react';

export default function Step3DraftGeneration({
  outline,
  drafts,
  currentDraftingIndex,
  isDrafting,
  error,
  onStartDrafting,
  onPauseDrafting,
  onRetrySection,
  onSwitchToMock,
  isMockMode,
  onProceedToScore,
  onBack,
}) {
  const sections = outline?.sections || [];
  const totalSections = sections.length;
  const completedSections = Object.keys(drafts).length;
  const percentComplete = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
  const isFinished = totalSections > 0 && completedSections === totalSections;

  // Compile full article markdown
  const fullMarkdown = useMemo(() => {
    let md = '';
    if (outline?.title) {
      md += `# ${outline.title}\n\n`;
    }
    for (const sec of sections) {
      if (drafts[sec.id]) {
        md += `${drafts[sec.id]}\n\n`;
      }
    }
    return md;
  }, [outline, sections, drafts]);

  // Convert to HTML via marked
  const renderedHtml = useMemo(() => {
    try {
      return marked.parse(fullMarkdown || '*No content generated yet.*', { breaks: true });
    } catch (e) {
      return '<p>Error rendering markdown preview</p>';
    }
  }, [fullMarkdown]);

  // Word count of generated content
  const totalWords = useMemo(() => {
    const words = fullMarkdown.match(/\b[\w'-]+\b/g);
    return words ? words.length : 0;
  }, [fullMarkdown]);

  return (
    <div className="max-w-5xl mx-auto px-4 pb-16 space-y-6">
      {/* Progress & Controls Banner */}
      <div className="bg-white border border-[#E8E3DA] rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-serif font-bold text-[#0B3B38] tracking-tight">
                3. Section-by-Section Drafting
              </h2>
              <span className="text-[11px] font-sans font-medium px-2.5 py-0.5 rounded-full bg-[#E6F1EF] text-[#0E5C55] border border-[#0E5C55]/20">
                Generation Engine
              </span>
            </div>
            <p className="text-xs text-[#7A8583] mt-1">
              Generating focused, context-aware sections with coherent narrative flow
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {!isFinished && (
              <>
                {isDrafting ? (
                  <button
                    type="button"
                    onClick={onPauseDrafting}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-serif font-semibold bg-white hover:bg-[#FBF8F3] text-[#C2652B] border border-[#C2652B]/40 shadow-sm transition-colors"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onStartDrafting}
                    disabled={isDrafting}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-serif font-semibold bg-[#0E5C55] hover:bg-[#0A4A44] text-white shadow-sm transition-all hover:scale-[1.01]"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{completedSections > 0 ? 'Resume Drafting' : 'Start Drafting'}</span>
                  </button>
                )}
              </>
            )}

            {isFinished && (
              <button
                type="button"
                onClick={onProceedToScore}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0E5C55] hover:bg-[#0A4A44] text-white font-serif font-semibold text-xs shadow-sm transition-all hover:scale-[1.01]"
              >
                <span>Proceed to SEO Audit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar & Status (Thin track #E8E3DA with teal fill) */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#3F4B49] font-medium flex items-center gap-1.5">
              {isDrafting && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0E5C55]" />}
              {isFinished && <CheckCircle className="w-3.5 h-3.5 text-[#0E5C55]" />}
              {isDrafting
                ? `Drafting Section ${currentDraftingIndex + 1} of ${totalSections}: "${sections[currentDraftingIndex]?.h2}"`
                : isFinished
                ? 'All sections drafted successfully!'
                : `Ready to draft (${completedSections}/${totalSections} sections completed)`}
            </span>
            <span className="font-mono text-[#0E5C55] font-bold">{percentComplete}%</span>
          </div>

          <div className="w-full bg-[#E8E3DA] rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#0E5C55] h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>

        {/* Word count & Review disclaimer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#E8E3DA] text-xs text-[#7A8583]">
          <div className="flex items-center gap-4">
            <span>
              Generated Words: <strong className="text-[#0B3B38] font-mono">{totalWords}</strong>
            </span>
            <span>
              Target Budget: <strong className="text-[#0E5C55] font-mono">{sections.reduce((a, b) => a + (b.wordBudget || 0), 0)}</strong>
            </span>
          </div>

          {/* Mandatory "Draft, needs human review" badge in terracotta tint */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8E9DF] border border-[#C2652B]/30 text-[#A85220] text-[11px] font-medium">
            <Info className="w-3.5 h-3.5 text-[#C2652B]" />
            <span>Draft, needs human review</span>
          </div>
        </div>

        {/* Error notification banner with Retry & Switch to Mock */}
        {error && (
          <div className="p-4 rounded-2xl bg-[#B3261E]/8 border border-[#B3261E]/30 text-[#B3261E] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#B3261E] shrink-0" />
              <div>
                <p className="font-semibold text-[#B3261E]">Drafting paused due to an error</p>
                <p className="text-[11px] text-[#7A8583] mt-0.5">{error}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!isMockMode && onSwitchToMock && (
                <button
                  type="button"
                  onClick={onSwitchToMock}
                  className="px-3.5 py-1.5 bg-white hover:bg-[#F8E9DF] text-[#C2652B] border border-[#C2652B]/40 rounded-full text-xs font-serif font-semibold transition-colors shadow-sm"
                >
                  Switch to Mock
                </button>
              )}
              {onRetrySection && (
                <button
                  type="button"
                  onClick={onRetrySection}
                  className="px-3.5 py-1.5 bg-[#B3261E] hover:bg-[#8F1D17] text-white rounded-full text-xs font-serif font-semibold shrink-0 transition-colors shadow-sm"
                >
                  Retry Section
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Grid: Sections Status List & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sections Status Column */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-[#7A8583] uppercase tracking-wider px-1">
            Section Progress ({completedSections}/{totalSections})
          </div>

          <div className="space-y-2">
            {sections.map((sec, idx) => {
              const isDone = !!drafts[sec.id];
              const isCurrent = currentDraftingIndex === idx && isDrafting;

              return (
                <div
                  key={sec.id}
                  className={`p-3.5 rounded-2xl border text-xs transition-all ${
                    isCurrent
                      ? 'bg-white border-2 border-[#0E5C55] shadow-sm'
                      : isDone
                      ? 'bg-white border-[#E8E3DA] text-[#3F4B49]'
                      : 'bg-[#FBF8F3] border-[#E8E3DA]/80 text-[#7A8583]/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        {isDone ? (
                          <CheckCircle className="w-4 h-4 text-[#0E5C55]" />
                        ) : isCurrent ? (
                          <Loader2 className="w-4 h-4 text-[#0E5C55] animate-spin" />
                        ) : (
                          <Clock className="w-4 h-4 text-[#7A8583]/50" />
                        )}
                      </div>
                      <div>
                        <p className={`font-serif font-semibold line-clamp-1 ${isCurrent ? 'text-[#0B3B38]' : isDone ? 'text-[#0B3B38]' : 'text-[#7A8583]'}`}>
                          {idx + 1}. {sec.h2}
                        </p>
                        <p className="text-[10px] text-[#7A8583] mt-0.5 font-sans">
                          {isDone
                            ? `Drafted (${(drafts[sec.id].match(/\b[\w'-]+\b/g) || []).length} words)`
                            : isCurrent
                            ? 'Generating content...'
                            : `Pending (~${sec.wordBudget}w)`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Markdown Preview Container */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-semibold text-[#7A8583] uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#0E5C55]" />
              <span>Live Article Preview</span>
            </span>
            <span className="text-[#7A8583] text-[11px]">Rendered in Markdown</span>
          </div>

          <div className="rounded-3xl bg-white border border-[#E8E3DA] p-6 md:p-8 min-h-[480px] shadow-sm overflow-y-auto max-h-[650px]">
            {fullMarkdown.trim() ? (
              <div
                className="markdown-preview max-w-[70ch] mx-auto text-sm text-[#3F4B49]"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-[#7A8583] space-y-3 text-center">
                <FileText className="w-10 h-10 text-[#E8E3DA] stroke-[1.5]" />
                <p className="text-xs">Click "Start Drafting" to generate section by section.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-[#E8E3DA]">
        <button
          type="button"
          onClick={onBack}
          disabled={isDrafting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-[#FBF8F3] text-[#3F4B49] border border-[#E8E3DA] text-xs font-serif font-semibold shadow-sm transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Outline</span>
        </button>

        {isFinished && (
          <button
            type="button"
            onClick={onProceedToScore}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0E5C55] hover:bg-[#0A4A44] text-white font-serif font-semibold text-xs shadow-sm transition-all hover:scale-[1.01]"
          >
            <span>Proceed to SEO Audit</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
