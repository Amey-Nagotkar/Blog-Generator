import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header.jsx';
import Stepper from './components/Stepper.jsx';
import Step1TopicForm from './components/Step1TopicForm.jsx';
import Step2OutlineEditor from './components/Step2OutlineEditor.jsx';
import Step3DraftGeneration from './components/Step3DraftGeneration.jsx';
import Step4SeoScorePanel from './components/Step4SeoScorePanel.jsx';
import {
  fetchHealth,
  fetchOutline,
  fetchDraftSection,
  fetchScore,
  getStoredMockMode,
  setStoredMockMode,
} from './api/client.js';

export default function App() {
  // Navigation & Server State
  const [currentStep, setCurrentStep] = useState(1);
  const [maxVisitedStep, setMaxVisitedStep] = useState(1);
  const [isMockMode, setIsMockModeState] = useState(() => {
    const stored = getStoredMockMode();
    return stored !== null ? stored : true;
  });
  const [liveAvailable, setLiveAvailable] = useState(false);
  const [model, setModel] = useState('');

  // Step 1: Form State (Preset to 700 words)
  const [formData, setFormData] = useState({
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
  });

  // Step 2: Outline State
  const [outline, setOutline] = useState(null);

  // Step 3: Drafting State
  const [drafts, setDrafts] = useState({});
  const [currentDraftingIndex, setCurrentDraftingIndex] = useState(0);
  const [isDrafting, setIsDrafting] = useState(false);
  const pauseDraftingRef = useRef(false);

  // Step 4: SEO State
  const [metaDescription, setMetaDescription] = useState('');
  const [scoreReport, setScoreReport] = useState(null);
  const [scoringLoading, setScoringLoading] = useState(false);

  // Global Loading & Error State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSetMockMode = (val) => {
    setIsMockModeState(val);
    setStoredMockMode(val);
    setError(null);
  };

  // Sync health on mount
  useEffect(() => {
    fetchHealth()
      .then((data) => {
        setLiveAvailable(Boolean(data.liveAvailable));
        if (data.model) setModel(data.model);

        // If no user preference in localStorage, initialize with server default
        const stored = getStoredMockMode();
        if (stored === null) {
          const defaultMode = data.defaultMockMode !== undefined ? data.defaultMockMode : true;
          setIsMockModeState(defaultMode);
          setStoredMockMode(defaultMode);
        } else if (!data.liveAvailable && !stored) {
          // If live is not available but stored was false, enforce mock mode
          setIsMockModeState(true);
          setStoredMockMode(true);
        }
      })
      .catch((err) => {
        console.warn('Could not connect to backend health check:', err.message);
      });
  }, []);

  const goToStep = (step) => {
    setCurrentStep(step);
    if (step > maxVisitedStep) {
      setMaxVisitedStep(step);
    }
  };

  // Reset to Step 1
  const handleReset = () => {
    if (window.confirm('Start a new blog post? Current progress will be cleared.')) {
      setCurrentStep(1);
      setMaxVisitedStep(1);
      setOutline(null);
      setDrafts({});
      setCurrentDraftingIndex(0);
      setIsDrafting(false);
      setScoreReport(null);
      setError(null);
    }
  };

  // -------------------------------------------------------------
  // Step 1 -> 2: Generate Outline
  // -------------------------------------------------------------
  const handleGenerateOutline = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOutline({
        topic: formData.topic,
        primaryKeyword: formData.primaryKeyword,
        secondaryKeywords: formData.secondaryKeywords,
        tone: formData.tone,
        wordCount: formData.wordCount,
        readingLevel: formData.readingLevel,
        mockMode: isMockMode,
      });

      setOutline(data);
      if (!metaDescription) {
        setMetaDescription(
          `Comprehensive practical guide to ${formData.topic}. Discover key insights, best practices, and expert recommendations for ${
            formData.primaryKeyword || 'your strategy'
          }.`
        );
      }
      goToStep(2);
    } catch (err) {
      const isLiveFailure = !isMockMode;
      const msg = isLiveFailure
        ? `Live Gemini call failed (${err.message}). You can retry or switch to Mock mode.`
        : (err.message || 'Failed to generate outline.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Step 2 -> 3: Proceed to Section Drafting
  // -------------------------------------------------------------
  const handleProceedToDrafting = () => {
    if (!outline || !outline.sections || outline.sections.length === 0) {
      setError('You must have at least one section in the outline.');
      return;
    }
    setError(null);
    goToStep(3);
  };

  // -------------------------------------------------------------
  // Step 3: Sequential Section-by-Section Drafting Engine
  // -------------------------------------------------------------
  const runDraftingLoop = useCallback(async () => {
    if (!outline || !outline.sections || outline.sections.length === 0) return;

    setIsDrafting(true);
    pauseDraftingRef.current = false;
    setError(null);

    const sections = outline.sections;
    let localDrafts = { ...drafts };

    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];

      // If user paused
      if (pauseDraftingRef.current) {
        setIsDrafting(false);
        return;
      }

      // If already drafted, skip
      if (localDrafts[sec.id]) {
        continue;
      }

      setCurrentDraftingIndex(i);

      // Build earlier summary from previous drafted sections
      const earlierSummary = Object.values(localDrafts)
        .map((text) => {
          const plain = text.replace(/#+/g, '').trim();
          return plain.slice(0, 180);
        })
        .join('; ');

      try {
        const res = await fetchDraftSection({
          outline,
          sectionId: sec.id,
          settings: {
            primaryKeyword: formData.primaryKeyword,
            secondaryKeywords: formData.secondaryKeywords,
            tone: formData.tone,
            readingLevel: formData.readingLevel,
          },
          earlierSummary,
          mockMode: isMockMode,
        });

        localDrafts = {
          ...localDrafts,
          [sec.id]: res.content || '',
        };
        setDrafts(localDrafts);
      } catch (err) {
        const isLiveFailure = !isMockMode;
        const msg = isLiveFailure
          ? `Live drafting failed on section "${sec.h2}" (${err.message}). You can retry or switch to Mock mode.`
          : `Failed drafting section "${sec.h2}": ${err.message}`;
        setError(msg);
        setIsDrafting(false);
        return;
      }
    }

    setIsDrafting(false);
  }, [outline, drafts, formData, isMockMode]);

  const handlePauseDrafting = () => {
    pauseDraftingRef.current = true;
    setIsDrafting(false);
  };

  const handleRetrySection = () => {
    setError(null);
    runDraftingLoop();
  };

  // -------------------------------------------------------------
  // Step 3 -> 4: Compile Article & Compute SEO Score
  // -------------------------------------------------------------
  const handleProceedToScore = async () => {
    if (!outline) return;

    let fullMd = `# ${outline.title || formData.topic}\n\n`;
    for (const sec of outline.sections || []) {
      if (drafts[sec.id]) {
        fullMd += `${drafts[sec.id]}\n\n`;
      }
    }

    setScoringLoading(true);
    setError(null);

    try {
      const report = await fetchScore({
        content: fullMd,
        title: outline.title || formData.topic,
        metaDescription: metaDescription || '',
        primaryKeyword: formData.primaryKeyword,
        secondaryKeywords: formData.secondaryKeywords,
        mockMode: isMockMode,
      });

      setScoreReport(report);
      goToStep(4);
    } catch (err) {
      setError(`Failed to compute SEO score: ${err.message}`);
    } finally {
      setScoringLoading(false);
    }
  };

  const handleReScore = async () => {
    if (!outline) return;
    let fullMd = `# ${outline.title || formData.topic}\n\n`;
    for (const sec of outline.sections || []) {
      if (drafts[sec.id]) {
        fullMd += `${drafts[sec.id]}\n\n`;
      }
    }

    setScoringLoading(true);
    try {
      const report = await fetchScore({
        content: fullMd,
        title: outline.title || formData.topic,
        metaDescription,
        primaryKeyword: formData.primaryKeyword,
        secondaryKeywords: formData.secondaryKeywords,
        mockMode: isMockMode,
      });
      setScoreReport(report);
    } catch (err) {
      console.error('Re-scoring error:', err);
    } finally {
      setScoringLoading(false);
    }
  };

  const getFullMarkdown = () => {
    let md = '';
    if (outline?.title) {
      md += `# ${outline.title}\n\n`;
    }
    for (const sec of outline?.sections || []) {
      if (drafts[sec.id]) {
        md += `${drafts[sec.id]}\n\n`;
      }
    }
    return md;
  };

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-[#3F4B49] flex flex-col font-sans selection:bg-[#0E5C55] selection:text-white">
      {/* Top Header with Segmented Switch */}
      <Header
        isMockMode={isMockMode}
        setIsMockMode={handleSetMockMode}
        liveAvailable={liveAvailable}
        model={model}
        onReset={handleReset}
      />

      {/* Stepper Navigation */}
      <Stepper
        currentStep={currentStep}
        onSelectStep={goToStep}
        maxVisitedStep={maxVisitedStep}
      />

      {/* Main Step Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-2">
        {currentStep === 1 && (
          <Step1TopicForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleGenerateOutline}
            loading={loading}
            error={error}
            onRetry={handleGenerateOutline}
            onSwitchToMock={() => handleSetMockMode(true)}
            isMockMode={isMockMode}
          />
        )}

        {currentStep === 2 && (
          <Step2OutlineEditor
            outline={outline}
            setOutline={setOutline}
            onProceed={handleProceedToDrafting}
            onBack={() => goToStep(1)}
            onRegenerate={handleGenerateOutline}
            loading={loading}
            error={error}
            onRetry={handleGenerateOutline}
            onSwitchToMock={() => handleSetMockMode(true)}
            isMockMode={isMockMode}
          />
        )}

        {currentStep === 3 && (
          <Step3DraftGeneration
            outline={outline}
            drafts={drafts}
            currentDraftingIndex={currentDraftingIndex}
            isDrafting={isDrafting}
            error={error}
            onStartDrafting={runDraftingLoop}
            onPauseDrafting={handlePauseDrafting}
            onRetrySection={handleRetrySection}
            onSwitchToMock={() => handleSetMockMode(true)}
            isMockMode={isMockMode}
            onProceedToScore={handleProceedToScore}
            onBack={() => goToStep(2)}
          />
        )}

        {currentStep === 4 && (
          <Step4SeoScorePanel
            scoreReport={scoreReport}
            fullMarkdown={getFullMarkdown()}
            title={outline?.title || formData.topic}
            metaDescription={metaDescription}
            setMetaDescription={setMetaDescription}
            onReScore={handleReScore}
            onBack={() => goToStep(3)}
            scoringLoading={scoringLoading}
          />
        )}
      </main>
    </div>
  );
}
