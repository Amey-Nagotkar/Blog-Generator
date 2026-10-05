import React from 'react';
import { Check, FileText, ListTree, PenTool, Award } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Topic & Keywords', icon: FileText, desc: 'Inputs & Settings' },
  { id: 2, label: 'Outline Editor', icon: ListTree, desc: 'Structure & Word Budget' },
  { id: 3, label: 'Section Drafting', icon: PenTool, desc: 'Live Generation' },
  { id: 4, label: 'SEO & Export', icon: Award, desc: 'Auditing & Publishing' },
];

export default function Stepper({ currentStep, onSelectStep, maxVisitedStep }) {
  return (
    <div className="w-full py-6">
      <div className="max-w-4xl mx-auto px-4">
        <nav aria-label="Progress">
          <ol className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;
              const isClickable = step.id <= maxVisitedStep;

              return (
                <li key={step.id}>
                  <button
                    type="button"
                    disabled={!isClickable}
                    onClick={() => isClickable && onSelectStep(step.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
                      isCurrent
                        ? 'bg-white border-[#0E5C55] shadow-sm ring-1 ring-[#0E5C55]/20'
                        : isCompleted
                        ? 'bg-white border-[#E8E3DA] hover:border-[#0E5C55]/40 text-[#3F4B49]'
                        : 'bg-white/60 border-[#E8E3DA]/60 text-[#7A8583]/50 cursor-not-allowed'
                    }`}
                  >
                    {/* Badge: terracotta on active, teal check on completed, muted on upcoming */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-[#C2652B] text-white shadow-sm'
                          : isCompleted
                          ? 'bg-[#E6F1EF] text-[#0E5C55] border border-[#0E5C55]/25'
                          : 'bg-[#FBF8F3] text-[#7A8583] border border-[#E8E3DA]'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 text-[#0E5C55] stroke-[2.5]" />
                      ) : isCurrent ? (
                        <span className="font-mono">{step.id}</span>
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#7A8583]">
                          Step {step.id}
                        </span>
                      </div>
                      <div
                        className={`text-xs font-semibold truncate ${
                          isCurrent ? 'font-serif text-[#0B3B38] font-bold text-[13px]' : isCompleted ? 'text-[#3F4B49]' : 'text-[#7A8583]'
                        }`}
                      >
                        {step.label}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
