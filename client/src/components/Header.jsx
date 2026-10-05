import React from 'react';
import { PenLine, RefreshCw, ShieldAlert } from 'lucide-react';

export default function Header({
  isMockMode,
  setIsMockMode,
  liveAvailable,
  model,
  onReset,
}) {
  return (
    <header className="border-b border-[#E8E3DA] bg-white sticky top-0 z-40 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Two-tone Serif Wordmark & Clean Line Icon */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E6F1EF] border border-[#0E5C55]/20 flex items-center justify-center shadow-sm">
            <PenLine className="w-5 h-5 text-[#0E5C55] stroke-[1.8]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-bold tracking-tight">
                <span className="font-serif text-[#0B3B38]">AI Blog </span>
                <span className="font-serif text-[#C2652B]">Generator</span>
              </span>
              {/* Obvious Mode Badge in new health-tech editorial palette */}
              {isMockMode ? (
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#F8E9DF] text-[#C2652B] border border-[#C2652B]/35 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C2652B]" />
                  <span>MOCK</span>
                </span>
              ) : (
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#E6F1EF] text-[#0E5C55] border border-[#0E5C55]/35 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0E5C55] animate-ping" />
                  <span>LIVE</span>
                </span>
              )}
            </div>
            <p className="text-xs text-[#7A8583] hidden sm:block">
              Structured, SEO-ranked publishing with section-by-section generation
            </p>
          </div>
        </div>

        {/* Controls: Pill Segmented Switch & New Post */}
        <div className="flex items-center gap-3">
          {/* Pill Segmented Switch: Mock | Live Gemini */}
          <div className="flex items-center gap-1 bg-white border border-[#E8E3DA] p-1 rounded-full shadow-sm">
            <button
              type="button"
              onClick={() => setIsMockMode(true)}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                isMockMode
                  ? 'bg-[#0E5C55] text-white shadow-sm'
                  : 'text-[#7A8583] hover:text-[#0B3B38]'
              }`}
            >
              Mock
            </button>

            <div className="relative group">
              <button
                type="button"
                disabled={!liveAvailable}
                onClick={() => liveAvailable && setIsMockMode(false)}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  !isMockMode
                    ? 'bg-[#0E5C55] text-white shadow-sm'
                    : liveAvailable
                    ? 'text-[#7A8583] hover:text-[#0B3B38]'
                    : 'text-[#7A8583]/40 cursor-not-allowed'
                }`}
              >
                <span>Live Gemini</span>
                {!liveAvailable && <ShieldAlert className="w-3.5 h-3.5 text-[#B7791F]" />}
              </button>

              {/* Tooltip if Live option is unavailable */}
              {!liveAvailable && (
                <div className="absolute right-0 top-full mt-2 hidden group-hover:flex w-60 p-2.5 rounded-xl bg-white border border-[#E8E3DA] text-[11px] text-[#B7791F] shadow-lg z-50 flex-col gap-0.5">
                  <p className="font-semibold text-[#0B3B38]">Live Mode Unavailable</p>
                  <p className="text-[#7A8583]">No API key configured on the server.</p>
                </div>
              )}
            </div>

            {/* Model Name Display */}
            {model && (
              <span className="text-[11px] font-mono text-[#7A8583] px-2.5 py-0.5 border-l border-[#E8E3DA] hidden md:inline">
                {model}
              </span>
            )}
          </div>

          {onReset && (
            <button
              onClick={onReset}
              className="text-xs text-[#3F4B49] hover:text-[#0B3B38] px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FBF8F3] transition-colors flex items-center gap-1.5 border border-[#E8E3DA] shadow-sm font-medium"
              title="Start a new article"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#0E5C55]" />
              <span className="hidden sm:inline">New Post</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
