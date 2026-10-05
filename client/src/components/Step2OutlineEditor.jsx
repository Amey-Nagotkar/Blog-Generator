import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Layers,
} from 'lucide-react';

export default function Step2OutlineEditor({
  outline,
  setOutline,
  onProceed,
  onBack,
  onRegenerate,
  loading,
  error,
  onRetry,
  onSwitchToMock,
  isMockMode,
}) {
  const [newH2Title, setNewH2Title] = useState('');
  const [newH3Input, setNewH3Input] = useState({});

  const sections = outline?.sections || [];
  const totalBudget = sections.reduce((sum, s) => sum + (Number(s.wordBudget) || 0), 0);

  // Reorder H2 sections
  const moveSection = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setOutline({ ...outline, sections: updated });
  };

  // Delete H2 section
  const deleteSection = (index) => {
    const updated = sections.filter((_, i) => i !== index);
    setOutline({ ...outline, sections: updated });
  };

  // Add new H2 section
  const addSection = (e) => {
    e?.preventDefault();
    const title = newH2Title.trim();
    if (!title) return;
    const newId = `sec-${Date.now().toString().slice(-4)}`;
    const newSec = {
      id: newId,
      h2: title,
      wordBudget: 200,
      h3: [],
    };
    setOutline({ ...outline, sections: [...sections, newSec] });
    setNewH2Title('');
  };

  // Rename H2 section
  const updateSectionH2 = (index, value) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], h2: value };
    setOutline({ ...outline, sections: updated });
  };

  // Update Section Word Budget
  const updateSectionBudget = (index, value) => {
    const num = Math.max(50, Number(value) || 0);
    const updated = [...sections];
    updated[index] = { ...updated[index], wordBudget: num };
    setOutline({ ...outline, sections: updated });
  };

  // Add H3 subheading
  const addH3 = (sectionIndex) => {
    const section = sections[sectionIndex];
    const text = (newH3Input[section.id] || '').trim();
    if (!text) return;

    const currentH3 = Array.isArray(section.h3) ? section.h3 : [];
    const newSubId = `${section.id}-${Date.now().toString().slice(-3)}`;
    const updatedSubheadings = [...currentH3, { id: newSubId, text }];

    const updated = [...sections];
    updated[sectionIndex] = { ...section, h3: updatedSubheadings };
    setOutline({ ...outline, sections: updated });

    setNewH3Input((prev) => ({ ...prev, [section.id]: '' }));
  };

  // Rename H3 subheading
  const updateH3 = (sectionIndex, h3Index, value) => {
    const section = sections[sectionIndex];
    const currentH3 = [...(Array.isArray(section.h3) ? section.h3 : [])];
    currentH3[h3Index] = { ...currentH3[h3Index], text: value };

    const updated = [...sections];
    updated[sectionIndex] = { ...section, h3: currentH3 };
    setOutline({ ...outline, sections: updated });
  };

  // Reorder H3 subheadings
  const moveH3 = (sectionIndex, h3Index, direction) => {
    const section = sections[sectionIndex];
    const currentH3 = [...(Array.isArray(section.h3) ? section.h3 : [])];
    const targetIndex = h3Index + direction;
    if (targetIndex < 0 || targetIndex >= currentH3.length) return;

    const temp = currentH3[h3Index];
    currentH3[h3Index] = currentH3[targetIndex];
    currentH3[targetIndex] = temp;

    const updated = [...sections];
    updated[sectionIndex] = { ...section, h3: currentH3 };
    setOutline({ ...outline, sections: updated });
  };

  // Delete H3 subheading
  const deleteH3 = (sectionIndex, h3Index) => {
    const section = sections[sectionIndex];
    const currentH3 = (Array.isArray(section.h3) ? section.h3 : []).filter((_, i) => i !== h3Index);

    const updated = [...sections];
    updated[sectionIndex] = { ...section, h3: currentH3 };
    setOutline({ ...outline, sections: updated });
  };

  const hasSections = sections.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 pb-16 space-y-6">
      {/* Top Banner & Title Edit */}
      <div className="bg-white border border-[#E8E3DA] rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#0B3B38] tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#0E5C55]" />
              <span>2. Outline &amp; Structure Editor</span>
            </h2>
            <p className="text-xs text-[#7A8583] mt-0.5">
              Review headings and subheadings. Customize hierarchy and budget distribution.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRegenerate}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-white hover:bg-[#FBF8F3] text-[#3F4B49] border border-[#E8E3DA] hover:border-[#0E5C55]/30 transition-colors shadow-sm disabled:opacity-50"
              title="Regenerate outline"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#C2652B] ${loading ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>
          </div>
        </div>

        {/* Error notification banner with Retry & Switch to Mock */}
        {error && (
          <div className="p-4 rounded-2xl bg-[#B3261E]/8 border border-[#B3261E]/25 text-[#B3261E] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#B3261E] shrink-0" />
              <span>{error}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!isMockMode && onSwitchToMock && (
                <button
                  type="button"
                  onClick={onSwitchToMock}
                  className="px-3 py-1 bg-white hover:bg-[#F8E9DF] text-[#C2652B] border border-[#E8E3DA] rounded-full text-xs font-semibold shadow-sm"
                >
                  Switch to Mock
                </button>
              )}
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="px-3 py-1 bg-[#B3261E] hover:bg-[#921e17] text-white rounded-full text-xs font-semibold shadow-sm"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        )}

        {/* Editable Article Title */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="article-title-input" className="font-semibold text-[#0B3B38] uppercase tracking-wider">
              Article Title (H1 Tag)
            </label>
            <span
              className={`text-[11px] font-mono font-semibold ${
                (outline?.title || '').length <= 60 ? 'text-[#0E5C55]' : 'text-[#B7791F]'
              }`}
            >
              {(outline?.title || '').length} / 60 chars ({ (outline?.title || '').length <= 60 ? 'Optimal' : 'Review' })
            </span>
          </div>
          <input
            id="article-title-input"
            type="text"
            value={outline?.title || ''}
            onChange={(e) => setOutline({ ...outline, title: e.target.value })}
            placeholder="e.g. Mastering Next.js 14 App Router: A Complete Guide"
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E3DA] focus:border-[#C2652B] focus:ring-2 focus:ring-[#C2652B]/20 font-serif text-[#0B3B38] font-bold text-base transition-all outline-none"
          />
        </div>

        {/* Total Word Budget Summary */}
        <div className="flex items-center justify-between text-xs px-4 py-2.5 rounded-2xl bg-[#FBF8F3] border border-[#E8E3DA] text-[#7A8583]">
          <span>
            Total Planned Sections: <strong className="text-[#0B3B38] font-mono">{sections.length}</strong>
          </span>
          <span>
            Combined Word Budget: <strong className="text-[#0E5C55] font-mono">{totalBudget} words</strong>
          </span>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        {!hasSections ? (
          <div className="p-8 rounded-3xl bg-white border border-dashed border-[#B3261E]/40 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-[#B3261E] mx-auto" />
            <h3 className="font-serif text-base font-bold text-[#0B3B38]">All sections have been removed</h3>
            <p className="text-xs text-[#7A8583] max-w-md mx-auto">
              You must have at least one H2 section to proceed to drafting. Add a new section below or click Regenerate.
            </p>
          </div>
        ) : (
          sections.map((section, sIndex) => {
            const h3List = Array.isArray(section.h3) ? section.h3 : [];

            return (
              <div
                key={section.id || sIndex}
                className="bg-white border border-[#E8E3DA] rounded-3xl p-5 shadow-xs space-y-4 transition-all hover:border-[#0E5C55]/30"
              >
                {/* H2 Header & Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-1">
                    <span className="w-7 h-7 rounded-lg bg-[#E6F1EF] text-[#0E5C55] text-xs font-mono font-bold flex items-center justify-center shrink-0 border border-[#0E5C55]/20">
                      H2
                    </span>
                    <input
                      type="text"
                      value={section.h2}
                      onChange={(e) => updateSectionH2(sIndex, e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#E8E3DA] font-serif text-[#0B3B38] font-semibold text-sm focus:border-[#C2652B] focus:ring-2 focus:ring-[#C2652B]/20 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    {/* Word Budget */}
                    <div className="flex items-center gap-1.5 text-xs text-[#7A8583] bg-[#FBF8F3] px-3 py-1 rounded-full border border-[#E8E3DA]">
                      <span className="text-[10px] uppercase font-mono">Budget:</span>
                      <input
                        type="number"
                        min="50"
                        step="25"
                        value={section.wordBudget || 200}
                        onChange={(e) => updateSectionBudget(sIndex, e.target.value)}
                        className="w-14 px-1 py-0.5 rounded bg-white text-[#0E5C55] font-mono text-xs text-right border border-[#E8E3DA] outline-none"
                      />
                      <span>w</span>
                    </div>

                    {/* Move Up/Down/Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveSection(sIndex, -1)}
                        disabled={sIndex === 0}
                        className="p-1.5 text-[#7A8583] hover:text-[#0B3B38] rounded-full hover:bg-[#FBF8F3] disabled:opacity-20 transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(sIndex, 1)}
                        disabled={sIndex === sections.length - 1}
                        className="p-1.5 text-[#7A8583] hover:text-[#0B3B38] rounded-full hover:bg-[#FBF8F3] disabled:opacity-20 transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSection(sIndex)}
                        className="p-1.5 text-[#7A8583] hover:text-[#B3261E] rounded-full hover:bg-[#B3261E]/10 transition-colors"
                        title="Delete Section"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subheadings (H3) Container */}
                <div className="pl-4 sm:pl-8 space-y-2.5 border-l-2 border-[#E8E3DA]">
                  <div className="text-[11px] font-semibold text-[#7A8583] uppercase tracking-wider flex items-center justify-between">
                    <span>Subheadings (H3)</span>
                    <span className="text-[#7A8583]/80 font-normal">
                      {h3List.length === 0 ? 'No subheadings (Optional)' : `${h3List.length} subheadings`}
                    </span>
                  </div>

                  {/* List of H3s */}
                  {h3List.map((h3Item, h3Index) => {
                    const text = typeof h3Item === 'string' ? h3Item : h3Item.text || '';
                    return (
                      <div key={h3Item.id || h3Index} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-[#F8E9DF] text-[#C2652B] text-[10px] font-mono font-bold flex items-center justify-center shrink-0 border border-[#C2652B]/30">
                          H3
                        </span>
                        <input
                          type="text"
                          value={text}
                          onChange={(e) => updateH3(sIndex, h3Index, e.target.value)}
                          className="flex-1 px-3 py-1 rounded-lg bg-white border border-[#E8E3DA] text-xs text-[#3F4B49] focus:border-[#C2652B] focus:ring-1 focus:ring-[#C2652B]/20 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => moveH3(sIndex, h3Index, -1)}
                          disabled={h3Index === 0}
                          className="p-1 text-[#7A8583] hover:text-[#0B3B38] rounded disabled:opacity-20"
                          title="Move H3 Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveH3(sIndex, h3Index, 1)}
                          disabled={h3Index === h3List.length - 1}
                          className="p-1 text-[#7A8583] hover:text-[#0B3B38] rounded disabled:opacity-20"
                          title="Move H3 Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteH3(sIndex, h3Index)}
                          className="p-1 text-[#7A8583] hover:text-[#B3261E] rounded"
                          title="Delete H3"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}

                  {/* Add H3 form */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newH3Input[section.id] || ''}
                      onChange={(e) =>
                        setNewH3Input({ ...newH3Input, [section.id]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addH3(sIndex);
                        }
                      }}
                      placeholder="Add an H3 subheading and press Enter..."
                      className="flex-1 px-3.5 py-1.5 rounded-full bg-[#FBF8F3] border border-dashed border-[#E8E3DA] hover:border-[#0E5C55]/40 text-xs text-[#3F4B49] placeholder-[#7A8583]/50 focus:border-[#C2652B] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => addH3(sIndex)}
                      className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FBF8F3] text-[#0E5C55] text-xs font-semibold flex items-center gap-1 border border-[#E8E3DA] shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#0E5C55]" />
                      <span>Add H3</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Add New Section (H2) Box */}
        <form onSubmit={addSection} className="flex gap-2 p-3 rounded-2xl bg-white border border-dashed border-[#E8E3DA]">
          <input
            type="text"
            value={newH2Title}
            onChange={(e) => setNewH2Title(e.target.value)}
            placeholder="Add a new H2 section heading..."
            className="flex-1 px-4 py-2 rounded-full bg-[#FBF8F3] border border-[#E8E3DA] text-xs text-[#3F4B49] placeholder-[#7A8583]/50 focus:border-[#C2652B] outline-none"
          />
          <button
            type="submit"
            className="px-5 py-2 bg-[#E6F1EF] hover:bg-[#0E5C55] text-[#0E5C55] hover:text-white rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#0E5C55]/25 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add H2 Section</span>
          </button>
        </form>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-[#E8E3DA]">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-[#FBF8F3] text-[#3F4B49] border border-[#E8E3DA] text-xs font-semibold transition-colors shadow-xs disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4 text-[#7A8583]" />
          <span>Back to Topics</span>
        </button>

        <button
          type="button"
          onClick={onProceed}
          disabled={!hasSections || loading}
          className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full bg-[#0E5C55] hover:bg-[#0A4A44] text-white font-serif font-semibold text-xs shadow-sm transition-all hover:shadow active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Start Section Drafting</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
