'use client';

import React, { useRef, useState, useEffect } from 'react';
import { CVData, Language } from '@/types/cv';
import { translations } from '@/lib/i18n';
import { sampleCVEn, sampleCVHe } from '@/data/sampleCV';
import { parseMarkdownToCV } from '@/lib/exportMarkdown';
import {
  FileText,
  Download,
  RotateCcw,
  Sparkles,
  Save,
  Globe,
  Upload,
  Check,
  Clock,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  data: CVData;
  setData: (data: CVData) => void;
  lastSaved: Date | null;
  onManualSave: () => void;
  onClear: () => void;
  onOpenExport: () => void;
  onLanguageChange: (lang: Language) => void;
}

export function Navbar({
  data,
  setData,
  lastSaved,
  onManualSave,
  onClear,
  onOpenExport,
  onLanguageChange,
}: NavbarProps) {
  const t = translations[data.language];
  const isRtl = data.language === 'he';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sampleMenuRef = useRef<HTMLDivElement>(null);
  const [isSampleMenuOpen, setIsSampleMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sampleMenuRef.current && !sampleMenuRef.current.contains(event.target as Node)) {
        setIsSampleMenuOpen(false);
      }
    };
    if (isSampleMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSampleMenuOpen]);

  const handleLoadTemplate = (lang: Language) => {
    if (lang === 'he') {
      setData(sampleCVHe);
    } else {
      setData(sampleCVEn);
    }
    onLanguageChange(lang);
    setIsSampleMenuOpen(false);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = (event.target?.result as string) || '';
      if (!text.trim()) return;

      try {
        // 1. Try JSON import if file is .json or text starts with '{'
        if (fileName.endsWith('.json') || text.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(text);
            if (parsed && (parsed.personalInfo || parsed.summary || parsed.experience)) {
              if (!parsed.language) {
                parsed.language = data.language;
              }
              if (parsed.languages && Array.isArray(parsed.languages)) {
                parsed.languages = parsed.languages
                  .map((l: string) => l.trim())
                  .filter((l: string) => l);
              }
              setData(parsed);
              return;
            }
          } catch (jsonErr) {
            if (fileName.endsWith('.json')) {
              alert(t.ui.invalidJson);
              return;
            }
          }
        }

        // 2. Parse as Markdown (.md, .markdown, .txt, or fallback)
        const parsedCV = parseMarkdownToCV(text, data.language);
        if (
          parsedCV.personalInfo.fullName ||
          parsedCV.summary ||
          parsedCV.experience.length > 0 ||
          parsedCV.certifications.length > 0 ||
          parsedCV.achievements.length > 0
        ) {
          if (parsedCV.languages && Array.isArray(parsedCV.languages)) {
            parsedCV.languages = parsedCV.languages
              .map((l: string) => l.trim())
              .filter((l: string) => l);
          }
          setData(parsedCV);
        } else {
          alert(t.ui.invalidFormat);
        }
      } catch (err) {
        console.error('Import failed:', err);
        alert(t.ui.failedParseJson);
      }
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  const formatSavedTime = (date: Date | null) => {
    if (!date) return <span>{t.ui.autoSaveNotice}</span>;
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timeStr = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    return (
      <span className="inline-flex items-baseline gap-1.5 leading-none">
        <span>{t.ui.savedAt}</span>
        <span dir="ltr" className="tabular-nums font-medium text-slate-700">
          {timeStr}
        </span>
      </span>
    );
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shadow-sm shrink-0 z-20 no-print">
      {/* Brand & Language Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-lg tracking-tight">
          <FileText className="w-6 h-6" />
          <span className="hidden sm:inline text-slate-800">Markdown<span className="text-blue-600">2</span>CV</span>
        </div>

        {/* Language Dropdown / Toggle */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              data.language === 'en'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('he')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              data.language === 'he'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            HE
          </button>
        </div>
      </div>

      {/* Center: Auto-Save Status */}
      <div
        className="hidden lg:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-full"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        {formatSavedTime(lastSaved)}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Hidden file input for Markdown / JSON import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.md,.markdown,.txt"
          onChange={handleImportFile}
          className="hidden"
        />

        {/* Import MD / JSON */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title={t.ui.importJsonTitle}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition-colors shrink-0 whitespace-nowrap"
        >
          <Upload className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>{t.ui.importJson}</span>
        </button>

        {/* Load Sample Template Dropdown */}
        <div className="relative" ref={sampleMenuRef}>
          <button
            type="button"
            onClick={() => setIsSampleMenuOpen((prev) => !prev)}
            title={t.ui.loadTemplate}
            aria-expanded={isSampleMenuOpen}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition-colors shrink-0 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="hidden sm:inline">{t.ui.loadTemplate}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isSampleMenuOpen && (
            <div
              className={`absolute top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-50 ${
                isRtl ? 'left-0 text-right' : 'right-0 text-left'
              }`}
            >
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {t.ui.selectTemplate}
              </div>
              <button
                type="button"
                onClick={() => handleLoadTemplate('en')}
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <span className="font-medium">{t.ui.loadSampleEn}</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">EN</span>
              </button>
              <button
                type="button"
                onClick={() => handleLoadTemplate('he')}
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <span className="font-medium">{t.ui.loadSampleHe}</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">HE</span>
              </button>
            </div>
          )}
        </div>

        {/* Clear */}
        <button
          type="button"
          onClick={onClear}
          title={t.ui.clear}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 bg-white rounded-lg shadow-xs transition-colors shrink-0 whitespace-nowrap"
        >
          <RotateCcw className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">{t.ui.clear}</span>
        </button>

        {/* Save Now */}
        <button
          type="button"
          onClick={onManualSave}
          title={t.ui.saveNow}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition-colors shrink-0 whitespace-nowrap"
        >
          <Save className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="hidden sm:inline">{t.ui.saveNow}</span>
        </button>

        {/* Export Button */}
        <button
          type="button"
          onClick={onOpenExport}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors shrink-0 whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span>{t.ui.export}</span>
        </button>
      </div>
    </header>
  );
}
