'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CVData, Language, createEmptyCV, DEFAULT_SECTION_TITLES, SectionKey } from '@/types/cv';
import { sampleCVEn } from '@/data/sampleCV';
import { isReferenceString } from '@/lib/exportMarkdown';
import { translations } from '@/lib/i18n';
import { Navbar } from '@/components/Navbar';
import { EditorPane } from '@/components/EditorPane';
import { PreviewPane } from '@/components/PreviewPane';
import { ExportModal } from '@/components/ExportModal';

const LOCAL_STORAGE_KEY = 'markdown2cv_data';
const AUTO_SAVE_INTERVAL_MS = 60 * 1000; // 1 minute

export default function Home() {
  const [data, setData] = useState<CVData>(() => sampleCVEn);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  // Ref to hold current data for auto-save interval
  const dataRef = useRef<CVData>(data);
  dataRef.current = data;

  // Restore on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.personalInfo) {
          const lang: Language = parsed.language || 'en';
          const defaultTitles = DEFAULT_SECTION_TITLES[lang] || DEFAULT_SECTION_TITLES.en;
          const mergedTitles: Record<string, string> = { ...defaultTitles, ...(parsed.sectionTitles || {}) };
          (Object.keys(defaultTitles) as SectionKey[]).forEach((key) => {
            if (!mergedTitles[key] || !mergedTitles[key].trim() || mergedTitles[key] === 'תמצית') {
              mergedTitles[key] = defaultTitles[key];
            }
          });
          parsed.sectionTitles = mergedTitles;
          if (parsed.languages && Array.isArray(parsed.languages)) {
            parsed.languages = parsed.languages
              .map((l: string) => l.trim())
              .filter((l: string) => l && !isReferenceString(l));
          }
          setData(parsed);
          setLastSaved(new Date());
        }
      }
    } catch (e) {
      console.warn('Failed to load CV data from localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Periodic 1-minute auto-save
  useEffect(() => {
    const timer = setInterval(() => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataRef.current));
          setLastSaved(new Date());
          console.log('[Auto-Save] Saved CV to localStorage at', new Date().toLocaleTimeString());
        } catch (err) {
          console.error('[Auto-Save] Failed:', err);
        }
      }
    }, AUTO_SAVE_INTERVAL_MS);

  return () => clearInterval(timer);
  }, []);

  const handleManualSave = () => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      setLastSaved(new Date());
    } catch (err) {
      console.error('Manual save failed:', err);
    }
  };

  const handleClear = () => {
    const t = translations[data.language];
    if (window.confirm(t.ui.clearConfirm)) {
      const empty = createEmptyCV(data.language);
      setData(empty);
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        setLastSaved(null);
      } catch (err) {
        console.error('Clear failed:', err);
      }
    }
  };

  const handleLanguageChange = (newLang: Language) => {
    setData((prev) => {
      const oldT = translations[prev.language];
      const newT = translations[newLang];
      const updatedTitles = { ...(prev.sectionTitles || {}) };
      (Object.keys(oldT.headings) as (keyof typeof oldT.headings)[]).forEach((key) => {
        if (!updatedTitles[key] || updatedTitles[key] === oldT.headings[key] || updatedTitles[key] === 'תמצית') {
          updatedTitles[key] = newT.headings[key];
        }
      });
      return {
        ...prev,
        language: newLang,
        sectionTitles: updatedTitles,
        references:
          prev.references === 'Available upon request.' && newLang === 'he'
            ? 'המלצות יימסרו לפי דרישה.'
            : prev.references === 'המלצות יימסרו לפי דרישה.' && newLang === 'en'
            ? 'Available upon request.'
            : prev.references,
      };
    });
  };



  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-100 print:h-auto print:w-auto print:overflow-visible print:bg-white print:block">
      {/* Navbar */}
      <Navbar
        data={data}
        setData={setData}
        lastSaved={lastSaved}
        onManualSave={handleManualSave}
        onClear={handleClear}
        onOpenExport={() => setIsExportModalOpen(true)}
        onLanguageChange={handleLanguageChange}
      />

      {/* Mobile Tab Switcher */}
      <div className="md:hidden flex border-b border-slate-200 bg-white no-print">
        <button
          type="button"
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 ${
            mobileTab === 'editor'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500'
          }`}
        >
          Editor
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 ${
            mobileTab === 'preview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500'
          }`}
        >
          Live Preview
        </button>
      </div>

      {/* Main Split-Screen Workspace */}
      <main className="flex-1 flex overflow-hidden print:block print:h-auto print:w-auto print:overflow-visible">
        {/* Left: Editor Pane (hidden on mobile if preview tab active) */}
        <div
          className={`w-full md:w-1/2 h-full no-print ${
            mobileTab === 'preview' ? 'hidden md:block' : 'block'
          }`}
        >
          <EditorPane data={data} onChange={setData} />
        </div>

        {/* Right: Live Preview Pane (hidden on mobile if editor tab active) */}
        <div
          className={`w-full md:w-1/2 h-full print:w-full print:h-auto print:block print:overflow-visible ${
            mobileTab === 'editor' ? 'hidden md:block' : 'block'
          }`}
        >
          <PreviewPane data={data} />
        </div>
      </main>

      {/* Export Modal */}
      {isExportModalOpen && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          data={data}
        />
      )}
    </div>
  );
}
