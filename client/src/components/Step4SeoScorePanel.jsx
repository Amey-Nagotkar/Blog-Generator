import React, { useState } from 'react';
import {
  Award,
  Download,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  BookOpen,
  ArrowLeft,
  Info,
  RefreshCw,
  FileDown,
  Eye,
  Code,
  Hash,
} from 'lucide-react';

export default function Step4SeoScorePanel({
  scoreReport,
  fullMarkdown,
  title,
  metaDescription,
  setMetaDescription,
  onReScore,
  onBack,
  scoringLoading,
}) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('score'); // 'score' | 'raw'

  const score = scoreReport?.overallScore ?? 0;
  const readability = scoreReport?.readability;
  const keywordDensity = scoreReport?.keywordDensity;
  const headingHierarchy = scoreReport?.headingHierarchy;
  const titleTag = scoreReport?.titleTag;
  const metaTag = scoreReport?.metaDescription;

  // Copy Markdown to Clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(fullMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export .md file with frontmatter
  const handleExportMd = () => {
    const frontmatter = `---
title: "${title || 'Untitled'}"
description: "${metaDescription || ''}"
date: "${new Date().toISOString().split('T')[0]}"
score: ${score}
---

${fullMarkdown}`;

    const blob = new Blob([frontmatter], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${(title || 'article').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export .txt file (plain content)
  const handleExportTxt = () => {
    const plain = fullMarkdown.replace(/^#+\s+/gm, '').replace(/(\*\*|__)(.*?)\1/g, '$2');
    const blob = new Blob([plain], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${(title || 'article').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Color helper for overall score
  const getScoreColor = (val) => {
    if (val >= 80) return {
      container: 'bg-[#E6F1EF] border-[#0E5C55]/30 text-[#0E5C55]',
      num: 'text-[#0E5C55]',
      icon: <Check className="w-3.5 h-3.5" />,
      label: 'Well Optimized',
    };
    if (val >= 60) return {
      container: 'bg-[#FDF6E2] border-[#B7791F]/40 text-[#B7791F]',
      num: 'text-[#B7791F]',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      label: 'Acceptable',
    };
    return {
      container: 'bg-[#FDF0EE] border-[#B3261E]/40 text-[#B3261E]',
      num: 'text-[#B3261E]',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      label: 'Needs Optimization',
    };
  };

  const scoreStyle = getScoreColor(score);

  return (
    <div className="max-w-5xl mx-auto px-4 pb-16 space-y-6">
      {/* Header & Export Controls */}
      <div className="bg-white border border-[#E8E3DA] rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-serif font-bold text-[#0B3B38] tracking-tight flex items-center gap-2">
                <Award className="w-5 h-5 text-[#0E5C55]" />
                <span>4. SEO Audit &amp; Publishing</span>
              </h2>
              <span className="text-[11px] font-sans font-medium px-2.5 py-0.5 rounded-full bg-[#E6F1EF] text-[#0E5C55] border border-[#0E5C55]/20">
                Audit Ready
              </span>
            </div>
            <p className="text-xs text-[#7A8583] mt-1">
              Verify ranking factors, readability grade, keyword densities, and export your article
            </p>
          </div>

          {/* Export Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-serif font-semibold bg-white hover:bg-[#FBF8F3] text-[#3F4B49] border border-[#E8E3DA] shadow-sm transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#0E5C55]" /> : <Copy className="w-3.5 h-3.5 text-[#7A8583]" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportMd}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-serif font-semibold bg-[#0E5C55] hover:bg-[#0A4A44] text-white shadow-sm transition-all hover:scale-[1.01]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .md</span>
            </button>

            <button
              type="button"
              onClick={handleExportTxt}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-serif font-semibold bg-white hover:bg-[#FBF8F3] text-[#3F4B49] border border-[#E8E3DA] shadow-sm transition-colors"
            >
              <FileDown className="w-3.5 h-3.5 text-[#7A8583]" />
              <span>Export .txt</span>
            </button>
          </div>
        </div>

        {/* Human review disclaimer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#E8E3DA] text-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8E9DF] border border-[#C2652B]/30 text-[#A85220] text-[11px] font-medium">
            <Info className="w-3.5 h-3.5 text-[#C2652B]" />
            <span>Draft, needs human review before publishing</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'score' ? 'raw' : 'score')}
              className="text-xs text-[#C2652B] hover:text-[#A85220] font-semibold flex items-center gap-1 transition-colors"
            >
              {viewMode === 'score' ? <Code className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{viewMode === 'score' ? 'View Raw Markdown' : 'View Audit Panel'}</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'raw' ? (
        /* Raw Markdown View */
        <div className="bg-white border border-[#E8E3DA] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-xs text-[#7A8583]">
            <span className="font-semibold uppercase tracking-wider">Generated Markdown Document</span>
            <span>{scoreReport?.wordCount || 0} total words</span>
          </div>
          <pre className="p-4 rounded-2xl bg-[#FBF8F3] font-mono text-xs text-[#3F4B49] overflow-x-auto whitespace-pre-wrap border border-[#E8E3DA] max-h-[500px]">
            {fullMarkdown}
          </pre>
        </div>
      ) : (
        /* Audit & Score Grid */
        <div className="space-y-6">
          {/* Top Score Banner & Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Overall Score Dial */}
            <div
              className={`p-6 rounded-3xl border flex flex-col items-center justify-center text-center space-y-2 ${scoreStyle.container}`}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A8583]">
                SEO Score
              </span>
              <div className={`text-5xl font-serif font-bold tracking-tight ${scoreStyle.num}`}>{score}</div>
              <span className="text-xs font-semibold flex items-center gap-1">
                {scoreStyle.icon}
                {scoreStyle.label}
              </span>
            </div>

            {/* Readability Card */}
            <div className="p-5 rounded-3xl bg-white border border-[#E8E3DA] shadow-sm flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A8583] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#0E5C55]" />
                  <span>Readability</span>
                </span>
                <span className="text-xs font-mono font-bold text-[#0B3B38]">
                  Grade {readability?.fleschKincaidGrade ?? 0}
                </span>
              </div>
              <div>
                <p className="text-xs text-[#3F4B49] font-medium">
                  {readability?.interpretation || 'Standard reading level'}
                </p>
                <p className="text-[11px] text-[#7A8583] mt-1">
                  Ease: {readability?.readingEase ?? 0}/100 (Flesch-Kincaid)
                </p>
              </div>
            </div>

            {/* Heading Hierarchy Card */}
            <div className="p-5 rounded-3xl bg-white border border-[#E8E3DA] shadow-sm flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A8583] flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-[#0E5C55]" />
                  <span>Headings</span>
                </span>
                {headingHierarchy?.valid ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#0E5C55] font-semibold">
                    <CheckCircle className="w-3.5 h-3.5" /> Valid
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#B7791F] font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" /> Issues
                  </span>
                )}
              </div>
              <div className="text-xs text-[#7A8583] space-y-0.5">
                <p>
                  H1: <strong className="text-[#0B3B38] font-mono">{headingHierarchy?.h1Count ?? 0}</strong> (Target: 1)
                </p>
                <p>
                  H2: <strong className="text-[#0B3B38] font-mono">{headingHierarchy?.h2Count ?? 0}</strong> | H3:{' '}
                  <strong className="text-[#0B3B38] font-mono">{headingHierarchy?.h3Count ?? 0}</strong>
                </p>
              </div>
            </div>

            {/* Word Count Metric */}
            <div className="p-5 rounded-3xl bg-white border border-[#E8E3DA] shadow-sm flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A8583]">
                  Article Length
                </span>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0B3B38] font-mono">
                  {scoreReport?.wordCount || 0}
                </div>
                <p className="text-[11px] text-[#7A8583] mt-0.5">Total words across all sections</p>
              </div>
            </div>
          </div>

          {/* Title Tag & Meta Description Checkers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title Tag */}
            <div className="p-5 rounded-3xl bg-white border border-[#E8E3DA] shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#0B3B38]">
                  Title Tag (H1)
                </label>
                <span
                  className={`text-[11px] font-mono font-semibold flex items-center gap-1 ${
                    titleTag?.ideal ? 'text-[#0E5C55]' : 'text-[#B7791F]'
                  }`}
                >
                  {titleTag?.ideal ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  <span>{titleTag?.length ?? 0} / 60 chars</span>
                </span>
              </div>
              <p className="text-xs text-[#3F4B49] font-medium bg-[#FBF8F3] p-3 rounded-xl border border-[#E8E3DA]">
                {title || 'No title set'}
              </p>
              <p className="text-[11px] text-[#7A8583]">{titleTag?.message}</p>
            </div>

            {/* Meta Description with in-place editor */}
            <div className="p-5 rounded-3xl bg-white border border-[#E8E3DA] shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#0B3B38]">
                  Meta Description
                </label>
                <span
                  className={`text-[11px] font-mono font-semibold flex items-center gap-1 ${
                    metaTag?.ideal ? 'text-[#0E5C55]' : 'text-[#B7791F]'
                  }`}
                >
                  {metaTag?.ideal ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  <span>{(metaDescription || '').length} / 140–160 chars</span>
                </span>
              </div>
              <div className="flex gap-2">
                <textarea
                  rows={2}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Enter a compelling meta description (140-160 characters)..."
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#E8E3DA] text-xs text-[#3F4B49] placeholder-[#7A8583]/50 focus:border-[#C2652B] focus:ring-2 focus:ring-[#C2652B]/20 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={onReScore}
                  disabled={scoringLoading}
                  className="px-3 bg-[#FBF8F3] hover:bg-[#E6F1EF] text-[#0E5C55] rounded-xl text-xs flex items-center justify-center border border-[#E8E3DA] transition-colors"
                  title="Recalculate SEO score"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#C2652B] ${scoringLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <p className="text-[11px] text-[#7A8583]">{metaTag?.message}</p>
            </div>
          </div>

          {/* Keyword Density Breakdown Table */}
          <div className="bg-white border border-[#E8E3DA] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-serif font-bold text-[#0B3B38] tracking-tight">
                  Target Keyword Density Analysis
                </h3>
                <p className="text-xs text-[#7A8583] mt-0.5">
                  Multi-word safe term frequency. Ideal is 0.5%–2.0%; warning triggered above 3.0%.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E8E3DA] text-[#7A8583] uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Keyword / Phrase</th>
                    <th className="py-2.5 px-3">Occurrences</th>
                    <th className="py-2.5 px-3">Density</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E3DA] font-mono">
                  {(!keywordDensity?.keywords || keywordDensity.keywords.length === 0) ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-[#7A8583] font-sans">
                        No target keywords analyzed.
                      </td>
                    </tr>
                  ) : (
                    keywordDensity.keywords.map((kw, i) => {
                      // Status colors (always paired with an icon and a text label, never colour alone):
                      // Ideal = teal with a check
                      // Slightly elevated = amber #B7791F with a "!" icon
                      // Keyword-stuffing warning / error = red #B3261E with an alert icon
                      let badge = {
                        className: 'bg-[#E6F1EF] text-[#0E5C55] border-[#0E5C55]/30',
                        icon: <Check className="w-3 h-3 text-[#0E5C55]" />,
                        label: 'Ideal (0.5%–2%)',
                      };

                      if (kw.status === 'warning') {
                        badge = {
                          className: 'bg-[#FDF0EE] text-[#B3261E] border-[#B3261E]/40',
                          icon: <AlertCircle className="w-3 h-3 text-[#B3261E]" />,
                          label: 'Warning: Stuffing (> 3%)',
                        };
                      } else if (kw.status === 'high' || kw.status === 'low') {
                        badge = {
                          className: 'bg-[#FDF6E2] text-[#B7791F] border-[#B7791F]/40',
                          icon: <AlertTriangle className="w-3 h-3 text-[#B7791F]" />,
                          label: kw.status === 'high' ? 'Slightly elevated' : 'Under-represented',
                        };
                      } else if (kw.status === 'missing') {
                        badge = {
                          className: 'bg-[#FBF8F3] text-[#7A8583] border-[#E8E3DA]',
                          icon: <AlertCircle className="w-3 h-3 text-[#7A8583]" />,
                          label: 'Not found in text',
                        };
                      }

                      return (
                        <tr key={i} className="hover:bg-[#FBF8F3] transition-colors">
                          <td className="py-2.5 px-3 text-[#0B3B38] font-sans font-medium">
                            {kw.keyword}
                          </td>
                          <td className="py-2.5 px-3 text-[#3F4B49]">{kw.count}</td>
                          <td className="py-2.5 px-3 font-semibold text-[#0B3B38]">{kw.densityPercent}%</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-medium border ${badge.className}`}
                            >
                              {badge.icon}
                              <span>{badge.label}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Heading Structure Warnings if any */}
          {headingHierarchy?.issues && headingHierarchy.issues.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#FDF6E2] border border-[#B7791F]/40 text-xs text-[#B7791F] space-y-1">
              <span className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#B7791F]" />
                Heading Hierarchy Notice:
              </span>
              <ul className="list-disc list-inside space-y-0.5 pl-2 text-[#3F4B49]">
                {headingHierarchy.issues.map((iss, i) => (
                  <li key={i}>{iss}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-[#E8E3DA]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-[#FBF8F3] text-[#3F4B49] border border-[#E8E3DA] text-xs font-serif font-semibold shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Drafting</span>
        </button>

        <button
          type="button"
          onClick={handleExportMd}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0E5C55] hover:bg-[#0A4A44] text-white font-serif font-semibold text-xs shadow-sm transition-all hover:scale-[1.01]"
        >
          <Download className="w-4 h-4" />
          <span>Download .md Article</span>
        </button>
      </div>
    </div>
  );
}
