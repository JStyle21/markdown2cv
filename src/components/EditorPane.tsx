'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CVData, ExperienceItem, CertificationItem, AchievementItem, SectionKey } from '@/types/cv';
import { translations } from '@/lib/i18n';
import { cvToMarkdown, parseMarkdownToCV } from '@/lib/exportMarkdown';
import { isValidEmail, isValidPhone, isValidUrl } from '@/lib/validation';
import {
  User,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  BookOpen,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileCode,
  LayoutList,
  Copy,
  Check,
  AlertCircle,
  Wand2,
  GripVertical,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface EditorPaneProps {
  data: CVData;
  onChange: (updated: CVData) => void;
}

export function EditorPane({ data, onChange }: EditorPaneProps) {
  const t = translations[data.language];
  const isRtl = data.language === 'he';

  const [activeTab, setActiveTab] = useState<'form' | 'markdown' | 'json'>('form');
  const [copied, setCopied] = useState(false);

  // Editable raw text states
  const [markdownInput, setMarkdownInput] = useState(() => cvToMarkdown(data));
  const [jsonInput, setJsonInput] = useState(() => JSON.stringify(data, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [markdownError, setMarkdownError] = useState<string | null>(null);

  // Keep raw inputs updated when data changes in form mode
  useEffect(() => {
    if (activeTab === 'form') {
      setMarkdownInput(cvToMarkdown(data));
      setJsonInput(JSON.stringify(data, null, 2));
      setJsonError(null);
      setMarkdownError(null);
    }
  }, [data, activeTab]);

  const handleTabSwitch = (newTab: 'form' | 'markdown' | 'json') => {
    if (newTab === 'markdown') {
      setMarkdownInput(cvToMarkdown(data));
      setMarkdownError(null);
    } else if (newTab === 'json') {
      setJsonInput(JSON.stringify(data, null, 2));
      setJsonError(null);
    }
    setActiveTab(newTab);
  };

  const handleMarkdownChange = (newVal: string) => {
    setMarkdownInput(newVal);
    try {
      const parsed = parseMarkdownToCV(newVal, data.language);
      onChange(parsed);
      setMarkdownError(null);
    } catch (err: any) {
      setMarkdownError(err?.message || 'Error parsing markdown');
    }
  };

  const handleJsonChange = (newVal: string) => {
    setJsonInput(newVal);
    try {
      const parsed = JSON.parse(newVal);
      if (parsed && typeof parsed === 'object') {
        onChange(parsed);
        setJsonError(null);
      }
    } catch (err: any) {
      setJsonError(err?.message || 'Invalid JSON syntax');
    }
  };

  const prettifyJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err?.message || 'Invalid JSON syntax');
    }
  };

  // Collapsible section states
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true,
    summary: true,
    experience: true,
    certifications: true,
    achievements: true,
    languages: true,
    references: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const getHeading = (key: SectionKey) => data.sectionTitles?.[key]?.trim() || t.headings[key];

  const updateSectionTitle = (sectionKey: SectionKey, title: string) => {
    onChange({
      ...data,
      sectionTitles: {
        ...(data.sectionTitles || {}),
        [sectionKey]: title,
      },
    });
  };

  const SectionTitleField = ({
    sectionKey,
    defaultHeading,
  }: {
    sectionKey: SectionKey;
    defaultHeading: string;
  }) => {
    const rawVal = data.sectionTitles?.[sectionKey];
    // Fall back to defaultHeading if empty string or undefined
    const currentVal = rawVal !== undefined && rawVal !== '' ? rawVal : defaultHeading;
    const isCustomized = currentVal !== defaultHeading && currentVal.trim() !== '';

    return (
      <div className="pb-2.5 mb-3 border-b border-slate-100">
        <div className="flex items-center justify-between gap-2 mb-1">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {t.ui.customSectionTitle}
          </label>
          {isCustomized && (
            <button
              type="button"
              onClick={() => updateSectionTitle(sectionKey, defaultHeading)}
              className="text-[11px] text-blue-600 hover:text-blue-800 transition-colors"
            >
              {isRtl ? 'שחזר ברירת מחדל' : 'Reset default'}
            </button>
          )}
        </div>
        <input
          type="text"
          value={currentVal}
          onChange={(e) => updateSectionTitle(sectionKey, e.target.value)}
          onBlur={() => {
            if (!data.sectionTitles?.[sectionKey]?.trim()) {
              updateSectionTitle(sectionKey, defaultHeading);
            }
          }}
          className="w-full px-2.5 py-1 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-medium"
        />
      </div>
    );
  };

  // Helper updates
  const updatePersonalInfo = (field: string, val: string) => {
    onChange({
      ...data,
      personalInfo: { ...data.personalInfo, [field]: val },
    });
  };

  const updateSummary = (val: string) => {
    onChange({ ...data, summary: val });
  };

  // Experience handlers
  const addExperience = () => {
    const newItem: ExperienceItem = {
      id: `exp-${Date.now()}`,
      jobTitle: '',
      company: '',
      dateRange: '',
      bullets: [''],
    };
    onChange({ ...data, experience: [newItem, ...data.experience] });
  };

  const updateExperience = (index: number, field: keyof ExperienceItem, value: any) => {
    const updated = [...data.experience];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, experience: updated });
  };

  const removeExperience = (index: number) => {
    const updated = data.experience.filter((_, i) => i !== index);
    onChange({ ...data, experience: updated });
  };

  const addBullet = (expIndex: number, afterIndex?: number) => {
    const exp = data.experience[expIndex];
    if (typeof afterIndex === 'number' && afterIndex >= 0 && afterIndex < exp.bullets.length) {
      const newBullets = [...exp.bullets];
      newBullets.splice(afterIndex + 1, 0, '');
      updateExperience(expIndex, 'bullets', newBullets);
    } else {
      updateExperience(expIndex, 'bullets', [...exp.bullets, '']);
    }
  };

  const updateBullet = (expIndex: number, bulletIndex: number, val: string) => {
    const exp = data.experience[expIndex];
    const newBullets = [...exp.bullets];
    newBullets[bulletIndex] = val;
    updateExperience(expIndex, 'bullets', newBullets);
  };

  const removeBullet = (expIndex: number, bulletIndex: number) => {
    const exp = data.experience[expIndex];
    const newBullets = exp.bullets.filter((_, i) => i !== bulletIndex);
    updateExperience(expIndex, 'bullets', newBullets);
  };

  // Certifications handlers
  const addCertification = () => {
    const newItem: CertificationItem = {
      id: `cert-${Date.now()}`,
      title: '',
      institution: '',
      dateRange: '',
      skills: [''],
    };
    onChange({ ...data, certifications: [...data.certifications, newItem] });
  };

  const updateCertification = (index: number, field: keyof CertificationItem, value: any) => {
    const updated = [...data.certifications];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, certifications: updated });
  };

  const removeCertification = (index: number) => {
    const updated = data.certifications.filter((_, i) => i !== index);
    onChange({ ...data, certifications: updated });
  };

  // Achievements handlers
  const addAchievement = () => {
    const newItem: AchievementItem = {
      id: `ach-${Date.now()}`,
      text: '',
      link: '',
      linkText: '',
    };
    onChange({ ...data, achievements: [...data.achievements, newItem] });
  };

  const updateAchievement = (index: number, field: keyof AchievementItem, value: string) => {
    const updated = [...data.achievements];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, achievements: updated });
  };

  const removeAchievement = (index: number) => {
    const updated = data.achievements.filter((_, i) => i !== index);
    onChange({ ...data, achievements: updated });
  };

  // Language handlers
  const [langIds, setLangIds] = useState<string[]>(() =>
    data.languages.map(() => `lang-${Math.random().toString(36).substring(2, 9)}`)
  );

  useEffect(() => {
    setLangIds((prev) => {
      if (prev.length === data.languages.length) return prev;
      return data.languages.map((_, i) => prev[i] || `lang-${Math.random().toString(36).substring(2, 9)}`);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.languages.length]);

  const [pendingFocusLangIdx, setPendingFocusLangIdx] = useState<number | null>(null);
  const [pendingFocusRefIdx, setPendingFocusRefIdx] = useState<number | null>(null);

  const addLanguage = (afterIdx?: number) => {
    const newId = `lang-${Math.random().toString(36).substring(2, 9)}`;
    if (typeof afterIdx === 'number' && afterIdx >= 0 && afterIdx < data.languages.length) {
      setLangIds((prev) => {
        const copy = [...prev];
        copy.splice(afterIdx + 1, 0, newId);
        return copy;
      });
      const copy = [...data.languages];
      copy.splice(afterIdx + 1, 0, '');
      setPendingFocusLangIdx(afterIdx + 1);
      onChange({ ...data, languages: copy });
    } else {
      setPendingFocusLangIdx(data.languages.length);
      setLangIds((prev) => [...prev, newId]);
      onChange({ ...data, languages: [...data.languages, ''] });
    }
  };

  const updateLanguage = (index: number, val: string) => {
    const updated = [...data.languages];
    updated[index] = val;
    onChange({ ...data, languages: updated });
  };

  const removeLanguage = (index: number) => {
    setLangIds((prev) => prev.filter((_, i) => i !== index));
    const updated = data.languages.filter((_, i) => i !== index);
    onChange({ ...data, languages: updated });
  };

  // References handlers
  const [referenceLines, setReferenceLines] = useState<string[]>(() => {
    if (!data.references || !data.references.trim()) return [];
    return data.references.split('\n');
  });

  const lastRefStringRef = useRef(data.references);

  useEffect(() => {
    if (data.references !== lastRefStringRef.current) {
      lastRefStringRef.current = data.references;
      setReferenceLines(data.references && data.references.trim() ? data.references.split('\n') : []);
    }
  }, [data.references]);

  const [refIds, setRefIds] = useState<string[]>(() => {
    const count = data.references && data.references.trim() ? data.references.split('\n').length : 0;
    return Array.from({ length: count }, () => `ref-${Math.random().toString(36).substring(2, 9)}`);
  });

  useEffect(() => {
    setRefIds((prev) => {
      if (prev.length === referenceLines.length) return prev;
      return referenceLines.map((_, i) => prev[i] || `ref-${Math.random().toString(36).substring(2, 9)}`);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referenceLines.length]);

  const addReference = (afterIdx?: number) => {
    const newId = `ref-${Math.random().toString(36).substring(2, 9)}`;
    if (typeof afterIdx === 'number' && afterIdx >= 0 && afterIdx < referenceLines.length) {
      const copyLines = [...referenceLines];
      copyLines.splice(afterIdx + 1, 0, '');
      setReferenceLines(copyLines);
      setRefIds((prev) => {
        const copy = [...prev];
        copy.splice(afterIdx + 1, 0, newId);
        return copy;
      });
      setPendingFocusRefIdx(afterIdx + 1);
      lastRefStringRef.current = copyLines.join('\n');
      onChange({ ...data, references: copyLines.join('\n') });
    } else {
      const updated = [...referenceLines, ''];
      setReferenceLines(updated);
      setRefIds((prev) => [...prev, newId]);
      setPendingFocusRefIdx(referenceLines.length);
      lastRefStringRef.current = updated.join('\n');
      onChange({ ...data, references: updated.join('\n') });
    }
  };

  const updateReference = (index: number, val: string) => {
    const updated = [...referenceLines];
    updated[index] = val;
    setReferenceLines(updated);
    lastRefStringRef.current = updated.join('\n');
    onChange({ ...data, references: updated.join('\n') });
  };

  const removeReference = (index: number) => {
    const updated = referenceLines.filter((_, i) => i !== index);
    setReferenceLines(updated);
    setRefIds((prev) => prev.filter((_, i) => i !== index));
    lastRefStringRef.current = updated.join('\n');
    onChange({ ...data, references: updated.join('\n') });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Drag-and-drop sensors with 5px distance constraint to avoid input interference
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEndExperience = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = data.experience.findIndex(
      (item, idx) => (item.id || `exp-${idx}`) === active.id
    );
    const newIndex = data.experience.findIndex(
      (item, idx) => (item.id || `exp-${idx}`) === over.id
    );

    if (oldIndex !== -1 && newIndex !== -1) {
      const updated = arrayMove(data.experience, oldIndex, newIndex);
      onChange({ ...data, experience: updated });
    }
  };

  const handleDragEndCertification = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = data.certifications.findIndex(
      (item, idx) => (item.id || `cert-${idx}`) === active.id
    );
    const newIndex = data.certifications.findIndex(
      (item, idx) => (item.id || `cert-${idx}`) === over.id
    );

    if (oldIndex !== -1 && newIndex !== -1) {
      const updated = arrayMove(data.certifications, oldIndex, newIndex);
      onChange({ ...data, certifications: updated });
    }
  };

  const handleDragEndAchievement = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = data.achievements.findIndex(
      (item, idx) => (item.id || `ach-${idx}`) === active.id
    );
    const newIndex = data.achievements.findIndex(
      (item, idx) => (item.id || `ach-${idx}`) === over.id
    );

    if (oldIndex !== -1 && newIndex !== -1) {
      const updated = arrayMove(data.achievements, oldIndex, newIndex);
      onChange({ ...data, achievements: updated });
    }
  };

  const handleDragEndLanguages = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = langIds.indexOf(active.id as string);
    const newIndex = langIds.indexOf(over.id as string);

    if (oldIndex !== -1 && newIndex !== -1) {
      setLangIds((ids) => arrayMove(ids, oldIndex, newIndex));
      onChange({ ...data, languages: arrayMove(data.languages, oldIndex, newIndex) });
    }
  };

  const handleDragEndReferences = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = refIds.indexOf(active.id as string);
    const newIndex = refIds.indexOf(over.id as string);

    if (oldIndex !== -1 && newIndex !== -1) {
      const updated = arrayMove(referenceLines, oldIndex, newIndex);
      setReferenceLines(updated);
      setRefIds((ids) => arrayMove(ids, oldIndex, newIndex));
      lastRefStringRef.current = updated.join('\n');
      onChange({ ...data, references: updated.join('\n') });
    }
  };

  const isPhoneValid = isValidPhone(data.personalInfo.phone);
  const isEmailValid = isValidEmail(data.personalInfo.email);
  const isLinkedinValid = isValidUrl(data.personalInfo.linkedin || '');
  const isGithubValid = isValidUrl(data.personalInfo.github || '');
  const isWebsiteValid = isValidUrl(data.personalInfo.website || '');
  const hasPersonalValidationErrors =
    !isPhoneValid || !isEmailValid || !isLinkedinValid || !isGithubValid || !isWebsiteValid;

  return (
    <div
      className="flex flex-col h-full bg-slate-50 border-r border-slate-200 overflow-hidden"
      id="editor-container"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Mode Tabs */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => handleTabSwitch('form')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'form'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span>{t.ui.formMode}</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('markdown')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'markdown'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{t.ui.markdownMode}</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('json')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'json'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>JSON</span>
          </button>
        </div>

        {activeTab !== 'form' && (
          <div className="flex items-center gap-2">
            {activeTab === 'json' && (
              <button
                type="button"
                onClick={prettifyJson}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                title="Prettify JSON formatting"
              >
                <Wand2 className="w-3.5 h-3.5 text-slate-500" />
                <span>{isRtl ? 'יישור קוד' : 'Format'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                copyToClipboard(
                  activeTab === 'markdown' ? markdownInput : jsonInput
                )
              }
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t.ui.copied : t.ui.copy}</span>
            </button>
          </div>
        )}
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
        {activeTab === 'markdown' ? (
          <div className="h-full flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1 shrink-0">
              <span>
                {isRtl
                  ? 'ערוך או הדבק קוד Markdown. השינויים מסתנכרנים אוטומטית לתצוגה ולטופס:'
                  : 'Edit or paste Markdown directly. Changes sync automatically to preview and form:'}
              </span>
              {markdownError && (
                <span className="text-amber-600 flex items-center gap-1 font-medium text-[11px]">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {markdownError}
                </span>
              )}
            </div>
            <textarea
              value={markdownInput}
              onChange={(e) => handleMarkdownChange(e.target.value)}
              placeholder="# Full Name&#10;&#10;Phone: ... | Email: ...&#10;&#10;## Summary&#10;..."
              dir="ltr"
              className="w-full flex-1 min-h-[500px] p-4 font-mono text-xs text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed shadow-xs"
            />
          </div>
        ) : activeTab === 'json' ? (
          <div className="h-full flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1 shrink-0">
              <span>
                {isRtl
                  ? 'ערוך או הדבק נתוני JSON. השינויים מסתנכרנים אוטומטית:'
                  : 'Edit or paste JSON CV data directly. Changes sync automatically:'}
              </span>
              <div className="flex items-center gap-2">
                {jsonError ? (
                  <span className="text-rose-600 flex items-center gap-1 font-medium text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {isRtl ? 'שגיאת תחביר ב-JSON' : 'Invalid JSON'}
                  </span>
                ) : (
                  <span className="text-emerald-600 flex items-center gap-1 text-[11px]">
                    <Check className="w-3 h-3" />
                    {isRtl ? 'JSON תקין' : 'Valid JSON'}
                  </span>
                )}
              </div>
            </div>
            <textarea
              value={jsonInput}
              onChange={(e) => handleJsonChange(e.target.value)}
              placeholder="{\n  &quot;personalInfo&quot;: {\n    &quot;fullName&quot;: &quot;...&quot;\n  }\n}"
              dir="ltr"
              className="w-full flex-1 min-h-[500px] p-4 font-mono text-xs text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed shadow-xs"
            />
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto pb-12">
            {/* 1. Personal Details */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('personal')}
                className="w-full px-4 py-3 flex items-center justify-between text-start bg-slate-50 hover:bg-slate-100/70 border-b border-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2 font-semibold text-sm text-slate-800">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>{t.ui.personalDetails}</span>
                  {hasPersonalValidationErrors && (
                    <span
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200"
                      title={isRtl ? 'קיימים שדות שאינם תקינים' : 'Contains invalid fields'}
                    >
                      <AlertCircle className="w-3 h-3 text-rose-500" />
                      <span>{isRtl ? 'שגיאת קלט' : 'Invalid'}</span>
                    </span>
                  )}
                </div>
                {expandedSections.personal ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {expandedSections.personal && (
                <div className="p-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      {t.ui.fullName} *
                    </label>
                    <input
                      type="text"
                      value={data.personalInfo.fullName}
                      onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                      placeholder={t.placeholders.fullName}
                      className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        {t.labels.phone}
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={data.personalInfo.phone}
                        onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                        placeholder={t.placeholders.phone}
                        className={`w-full px-3 py-1.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          !isPhoneValid
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
                            : 'border-slate-200 focus:ring-blue-500'
                        } ${isRtl ? 'text-right' : 'text-left'}`}
                      />
                      {!isPhoneValid && (
                        <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{t.validation.invalidPhone}</span>
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        {t.labels.email}
                      </label>
                      <input
                        type="email"
                        dir="ltr"
                        value={data.personalInfo.email}
                        onChange={(e) => updatePersonalInfo('email', e.target.value)}
                        placeholder={t.placeholders.email}
                        className={`w-full px-3 py-1.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          !isEmailValid
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
                            : 'border-slate-200 focus:ring-blue-500'
                        } ${isRtl ? 'text-right' : 'text-left'}`}
                      />
                      {!isEmailValid && (
                        <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{t.validation.invalidEmail}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        {t.labels.location}
                      </label>
                      <input
                        type="text"
                        value={data.personalInfo.location || ''}
                        onChange={(e) => updatePersonalInfo('location', e.target.value)}
                        placeholder={t.placeholders.location}
                        className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        {t.labels.linkedin}
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={data.personalInfo.linkedin || ''}
                        onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                        placeholder={t.placeholders.linkedin}
                        className={`w-full px-3 py-1.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          !isLinkedinValid
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
                            : 'border-slate-200 focus:ring-blue-500'
                        } ${isRtl ? 'text-right' : 'text-left'}`}
                      />
                      {!isLinkedinValid && (
                        <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{t.validation.invalidUrl}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        {t.labels.github}
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={data.personalInfo.github || ''}
                        onChange={(e) => updatePersonalInfo('github', e.target.value)}
                        placeholder={t.placeholders.github}
                        className={`w-full px-3 py-1.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          !isGithubValid
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
                            : 'border-slate-200 focus:ring-blue-500'
                        } ${isRtl ? 'text-right' : 'text-left'}`}
                      />
                      {!isGithubValid && (
                        <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{t.validation.invalidUrl}</span>
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        {t.labels.website}
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={data.personalInfo.website || ''}
                        onChange={(e) => updatePersonalInfo('website', e.target.value)}
                        placeholder={t.placeholders.website}
                        className={`w-full px-3 py-1.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          !isWebsiteValid
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
                            : 'border-slate-200 focus:ring-blue-500'
                        } ${isRtl ? 'text-right' : 'text-left'}`}
                      />
                      {!isWebsiteValid && (
                        <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{t.validation.invalidUrl}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Professional Summary */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('summary')}
                className="w-full px-4 py-3 flex items-center justify-between text-start bg-slate-50 hover:bg-slate-100/70 border-b border-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2 font-semibold text-sm text-slate-800">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>{getHeading('summary')}</span>
                </div>
                {expandedSections.summary ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {expandedSections.summary && (
                <div className="p-4 space-y-3">
                  <SectionTitleField sectionKey="summary" defaultHeading={t.headings.summary} />
                  <textarea
                    rows={4}
                    value={data.summary}
                    onChange={(e) => updateSummary(e.target.value)}
                    placeholder={t.placeholders.summary}
                    className="w-full p-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                  />
                </div>
              )}
            </div>

            {/* 3. Experience */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between bg-slate-50 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => toggleSection('experience')}
                  className="flex items-center gap-2 font-semibold text-sm text-slate-800"
                >
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span>{getHeading('experience')}</span>
                  <span className="text-xs text-slate-400 font-normal">
                    ({data.experience.length})
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={addExperience}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 rounded-md transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.ui.addExperience}</span>
                  </button>
                </div>
              </div>

              {expandedSections.experience && (
                <div className="p-4 space-y-4">
                  <SectionTitleField sectionKey="experience" defaultHeading={t.headings.experience} />
                  {data.experience.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                      {t.ui.noExperienceYet}
                    </div>
                  ) : (
                    <>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEndExperience}
                      >
                        <SortableContext
                          items={data.experience.map((exp, expIdx) => exp.id || `exp-${expIdx}`)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-4">
                            {data.experience.map((exp, expIdx) => (
                              <SortableExperienceCard
                                key={exp.id || expIdx}
                                exp={exp}
                                expIdx={expIdx}
                                updateExperience={updateExperience}
                                removeExperience={removeExperience}
                                addBullet={addBullet}
                                updateBullet={updateBullet}
                                removeBullet={removeBullet}
                                t={t}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={addExperience}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t.ui.addExperience}</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 4. Certifications & Education */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between bg-slate-50 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => toggleSection('certifications')}
                  className="flex items-center gap-2 font-semibold text-sm text-slate-800"
                >
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>{getHeading('certifications')}</span>
                  <span className="text-xs text-slate-400 font-normal">
                    ({data.certifications.length})
                  </span>
                </button>
                <button
                  type="button"
                  onClick={addCertification}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 rounded-md transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.ui.addCertification}</span>
                </button>
              </div>

              {expandedSections.certifications && (
                <div className="p-4 space-y-4">
                  <SectionTitleField sectionKey="certifications" defaultHeading={t.headings.certifications} />
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEndCertification}
                  >
                    <SortableContext
                      items={data.certifications.map((cert, certIdx) => cert.id || `cert-${certIdx}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-4">
                        {data.certifications.map((cert, certIdx) => (
                          <SortableCertificationCard
                            key={cert.id || certIdx}
                            cert={cert}
                            certIdx={certIdx}
                            updateCertification={updateCertification}
                            removeCertification={removeCertification}
                            t={t}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                  {data.certifications.length > 0 && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={addCertification}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t.ui.addCertification}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 5. Achievements */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between bg-slate-50 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => toggleSection('achievements')}
                  className="flex items-center gap-2 font-semibold text-sm text-slate-800"
                >
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>{getHeading('achievements')}</span>
                  <span className="text-xs text-slate-400 font-normal">
                    ({data.achievements.length})
                  </span>
                </button>
                <button
                  type="button"
                  onClick={addAchievement}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 rounded-md transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.ui.addAchievement}</span>
                </button>
              </div>

              {expandedSections.achievements && (
                <div className="p-4 space-y-3">
                  <SectionTitleField sectionKey="achievements" defaultHeading={t.headings.achievements} />
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEndAchievement}
                  >
                    <SortableContext
                      items={data.achievements.map((ach, achIdx) => ach.id || `ach-${achIdx}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {data.achievements.map((ach, achIdx) => (
                          <SortableAchievementCard
                            key={ach.id || achIdx}
                            ach={ach}
                            achIdx={achIdx}
                            updateAchievement={updateAchievement}
                            removeAchievement={removeAchievement}
                            isRtl={isRtl}
                            t={t}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                  {data.achievements.length > 0 && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={addAchievement}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t.ui.addAchievement}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 6. Languages */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between bg-slate-50 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => toggleSection('languages')}
                  className="flex items-center gap-2 font-semibold text-sm text-slate-800"
                >
                  <Languages className="w-4 h-4 text-blue-600" />
                  <span>{getHeading('languages')}</span>
                  <span className="text-xs text-slate-400 font-normal">
                    ({data.languages.length})
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => addLanguage()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 rounded-md transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.ui.addLanguage}</span>
                  </button>
                </div>
              </div>

              {expandedSections.languages && (
                <div className="p-4 space-y-3">
                  <SectionTitleField sectionKey="languages" defaultHeading={t.headings.languages} />

                  {data.languages.length === 0 ? (
                    <div className="text-center py-4 border border-dashed border-slate-200 rounded-lg">
                      <p className="text-xs text-slate-500 mb-2">
                        {isRtl ? 'טרם נוספו שפות.' : 'No languages added yet.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => addLanguage()}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t.ui.addLanguage}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-end">
                        <span className="text-[10px] text-slate-400 font-normal flex items-center gap-1 select-none">
                          <span>{t.ui.pressEnterToAdd}</span>
                          <kbd
                            dir="ltr"
                            className="px-1 py-0.5 text-[9px] font-mono bg-slate-100 border border-slate-200 rounded text-slate-500"
                          >
                            ↵ Enter
                          </kbd>
                        </span>
                      </div>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEndLanguages}
                      >
                        <SortableContext
                          items={langIds}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-2">
                            {data.languages.map((lang, lIdx) => (
                              <SortableLanguageItem
                                key={langIds[lIdx] || `lang-${lIdx}`}
                                id={langIds[lIdx] || `lang-${lIdx}`}
                                lang={lang}
                                lIdx={lIdx}
                                updateLanguage={updateLanguage}
                                removeLanguage={removeLanguage}
                                addLanguage={addLanguage}
                                placeholder={t.ui.languageItemPlaceholder}
                                removeTitle={t.ui.remove}
                                isFocused={pendingFocusLangIdx === lIdx}
                                onFocusHandled={() => setPendingFocusLangIdx(null)}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => addLanguage()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t.ui.addLanguage}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 7. References */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between bg-slate-50 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => toggleSection('references')}
                  className="flex items-center gap-2 font-semibold text-sm text-slate-800"
                >
                  <span className="w-4 h-4 text-blue-600 text-center font-serif italic font-bold">
                    R
                  </span>
                  <span>{getHeading('references')}</span>
                  <span className="text-xs text-slate-400 font-normal">
                    ({referenceLines.length})
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => addReference()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 rounded-md transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.ui.addReference}</span>
                  </button>
                </div>
              </div>

              {expandedSections.references && (
                <div className="p-4 space-y-3">
                  <SectionTitleField sectionKey="references" defaultHeading={t.headings.references} />

                  {referenceLines.length === 0 ? (
                    <div className="text-center py-4 border border-dashed border-slate-200 rounded-lg">
                      <p className="text-xs text-slate-500 mb-2">
                        {isRtl ? 'טרם נוספו המלצות.' : 'No references added yet.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => addReference()}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t.ui.addReference}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-end">
                        <span className="text-[10px] text-slate-400 font-normal flex items-center gap-1 select-none">
                          <span>{t.ui.pressEnterToAdd}</span>
                          <kbd
                            dir="ltr"
                            className="px-1 py-0.5 text-[9px] font-mono bg-slate-100 border border-slate-200 rounded text-slate-500"
                          >
                            ↵ Enter
                          </kbd>
                        </span>
                      </div>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEndReferences}
                      >
                        <SortableContext
                          items={refIds}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-2">
                            {referenceLines.map((refText, rIdx) => (
                              <SortableReferenceItem
                                key={refIds[rIdx] || `ref-${rIdx}`}
                                id={refIds[rIdx] || `ref-${rIdx}`}
                                refText={refText}
                                rIdx={rIdx}
                                updateReference={updateReference}
                                removeReference={removeReference}
                                addReference={addReference}
                                placeholder={t.placeholders.references}
                                removeTitle={t.ui.remove}
                                isFocused={pendingFocusRefIdx === rIdx}
                                onFocusHandled={() => setPendingFocusRefIdx(null)}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => addReference()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t.ui.addReference}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface SortableExperienceCardProps {
  exp: ExperienceItem;
  expIdx: number;
  updateExperience: (index: number, field: keyof ExperienceItem, value: any) => void;
  removeExperience: (index: number) => void;
  addBullet: (expIndex: number, afterIndex?: number) => void;
  updateBullet: (expIndex: number, bulletIndex: number, val: string) => void;
  removeBullet: (expIndex: number, bulletIndex: number) => void;
  t: (typeof translations)['en'];
}

function SortableExperienceCard({
  exp,
  expIdx,
  updateExperience,
  removeExperience,
  addBullet,
  updateBullet,
  removeBullet,
  t,
}: SortableExperienceCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exp.id || `exp-${expIdx}` });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 20 : 1,
  };

  const [pendingFocusIdx, setPendingFocusIdx] = useState<number | null>(null);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3.5 bg-slate-50/70 border border-slate-200 rounded-lg space-y-3 relative group transition-shadow ${
        isDragging ? 'shadow-lg border-blue-400 bg-blue-50/40 ring-2 ring-blue-400/20' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600 rounded touch-none hover:bg-slate-200/50 transition-colors"
            title="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            #{expIdx + 1}
          </span>
        </div>
        <button
          type="button"
          onClick={() => removeExperience(expIdx)}
          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
          title={t.ui.remove}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-0.5">
            {t.ui.jobTitle}
          </label>
          <input
            type="text"
            value={exp.jobTitle}
            onChange={(e) => updateExperience(expIdx, 'jobTitle', e.target.value)}
            placeholder={t.placeholders.jobTitle}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-0.5">
            {t.ui.company}
          </label>
          <input
            type="text"
            value={exp.company}
            onChange={(e) => updateExperience(expIdx, 'company', e.target.value)}
            placeholder={t.placeholders.company}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-0.5">
          {t.ui.dateRange}
        </label>
        <input
          type="text"
          value={exp.dateRange}
          onChange={(e) => updateExperience(expIdx, 'dateRange', e.target.value)}
          placeholder={t.placeholders.dateRange}
          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Bullets */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-slate-600">
            {t.ui.bulletPoints}
          </label>
          <span className="text-[10px] text-slate-400 font-normal flex items-center gap-1 select-none">
            <span>{t.ui.pressEnterToAdd}</span>
            <kbd
              dir="ltr"
              className="px-1 py-0.5 text-[9px] font-mono bg-slate-100 border border-slate-200 rounded text-slate-500"
            >
              ↵ Enter
            </kbd>
          </span>
        </div>
        {exp.bullets.map((bullet, bIdx) => (
          <div key={bIdx} className="flex items-center gap-1.5">
            <input
              ref={(el) => {
                if (el && pendingFocusIdx === bIdx) {
                  el.focus();
                  setPendingFocusIdx(null);
                }
              }}
              id={`exp-${expIdx}-bullet-${bIdx}`}
              type="text"
              value={bullet}
              onChange={(e) => updateBullet(expIdx, bIdx, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setPendingFocusIdx(bIdx + 1);
                  addBullet(expIdx, bIdx);
                }
              }}
              placeholder={t.placeholders.bulletPoint}
              className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => removeBullet(expIdx, bIdx)}
              className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            setPendingFocusIdx(exp.bullets.length);
            addBullet(expIdx);
          }}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 pt-0.5"
        >
          <Plus className="w-3 h-3" />
          <span>{t.ui.addBullet}</span>
        </button>
      </div>
    </div>
  );
}

interface SortableCertificationCardProps {
  cert: CertificationItem;
  certIdx: number;
  updateCertification: (index: number, field: keyof CertificationItem, value: any) => void;
  removeCertification: (index: number) => void;
  t: (typeof translations)['en'];
}

function SortableCertificationCard({
  cert,
  certIdx,
  updateCertification,
  removeCertification,
  t,
}: SortableCertificationCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cert.id || `cert-${certIdx}` });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 20 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3.5 bg-slate-50/70 border border-slate-200 rounded-lg space-y-2.5 relative transition-shadow ${
        isDragging ? 'shadow-lg border-blue-400 bg-blue-50/40 ring-2 ring-blue-400/20' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-1.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600 rounded touch-none hover:bg-slate-200/50 transition-colors"
            title="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            #{certIdx + 1}
          </span>
        </div>
        <button
          type="button"
          onClick={() => removeCertification(certIdx)}
          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          type="text"
          value={cert.title}
          onChange={(e) => updateCertification(certIdx, 'title', e.target.value)}
          placeholder={t.placeholders.certTitle}
          className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <input
          type="text"
          value={cert.institution}
          onChange={(e) => updateCertification(certIdx, 'institution', e.target.value)}
          placeholder={t.placeholders.institution}
          className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          type="text"
          value={cert.dateRange}
          onChange={(e) => updateCertification(certIdx, 'dateRange', e.target.value)}
          placeholder={t.placeholders.certDateRange}
          className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <input
          type="text"
          value={cert.skills.join(', ')}
          onChange={(e) =>
            updateCertification(
              certIdx,
              'skills',
              e.target.value.split(',').map((s) => s.trim())
            )
          }
          placeholder={t.placeholders.skills}
          className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

interface SortableAchievementCardProps {
  ach: AchievementItem;
  achIdx: number;
  updateAchievement: (index: number, field: keyof AchievementItem, value: string) => void;
  removeAchievement: (index: number) => void;
  isRtl: boolean;
  t: (typeof translations)['en'];
}

function SortableAchievementCard({
  ach,
  achIdx,
  updateAchievement,
  removeAchievement,
  isRtl,
  t,
}: SortableAchievementCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ach.id || `ach-${achIdx}` });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 20 : 1,
  };

  const isLinkValid = isValidUrl(ach.link);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 bg-slate-50/70 border border-slate-200 rounded-lg space-y-2 relative transition-shadow ${
        isDragging ? 'shadow-lg border-blue-400 bg-blue-50/40 ring-2 ring-blue-400/20' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600 rounded touch-none hover:bg-slate-200/50 transition-colors"
            title="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-400 uppercase">
            #{achIdx + 1}
          </span>
        </div>
        <button
          type="button"
          onClick={() => removeAchievement(achIdx)}
          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <input
        type="text"
        value={ach.text}
        onChange={(e) => updateAchievement(achIdx, 'text', e.target.value)}
        placeholder={t.placeholders.achievementText}
        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <input
            type="text"
            dir="ltr"
            value={ach.link}
            onChange={(e) => updateAchievement(achIdx, 'link', e.target.value)}
            placeholder={t.placeholders.linkUrl}
            className={`w-full px-2.5 py-1.5 text-xs bg-white border rounded-md focus:outline-none focus:ring-1 transition-all ${
              !isLinkValid
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
                : 'border-slate-200 focus:ring-blue-500'
            } ${isRtl ? 'text-right' : 'text-left'}`}
          />
          {!isLinkValid && (
            <p className="text-[10px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
              <AlertCircle className="w-2.5 h-2.5 shrink-0" />
              <span>{t.validation.invalidUrl}</span>
            </p>
          )}
        </div>
        <div>
          <input
            type="text"
            value={ach.linkText}
            onChange={(e) => updateAchievement(achIdx, 'linkText', e.target.value)}
            placeholder={t.placeholders.linkTitle}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

interface SortableLanguageItemProps {
  id: string;
  lang: string;
  lIdx: number;
  updateLanguage: (index: number, val: string) => void;
  removeLanguage: (index: number) => void;
  addLanguage: (afterIdx?: number) => void;
  placeholder: string;
  removeTitle: string;
  isFocused?: boolean;
  onFocusHandled?: () => void;
}

function SortableLanguageItem({
  id,
  lang,
  lIdx,
  updateLanguage,
  removeLanguage,
  addLanguage,
  placeholder,
  removeTitle,
  isFocused,
  onFocusHandled,
}: SortableLanguageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 20 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-1.5 group p-1 rounded-lg border transition-all ${
        isDragging
          ? 'shadow-md border-blue-400 bg-blue-50/40 ring-1 ring-blue-400/20'
          : 'border-transparent hover:border-slate-200'
      }`}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600 rounded touch-none hover:bg-slate-200/50 transition-colors shrink-0"
        title="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      <span className="text-slate-400 font-bold text-sm select-none shrink-0">
        •
      </span>
      <input
        ref={(el) => {
          if (el && isFocused) {
            el.focus();
            onFocusHandled?.();
          }
        }}
        type="text"
        value={lang}
        onChange={(e) => updateLanguage(lIdx, e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addLanguage(lIdx);
          }
        }}
        placeholder={placeholder}
        className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
      />
      <button
        type="button"
        onClick={() => removeLanguage(lIdx)}
        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors shrink-0"
        title={removeTitle}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

interface SortableReferenceItemProps {
  id: string;
  refText: string;
  rIdx: number;
  updateReference: (index: number, val: string) => void;
  removeReference: (index: number) => void;
  addReference: (afterIdx?: number) => void;
  placeholder: string;
  removeTitle: string;
  isFocused?: boolean;
  onFocusHandled?: () => void;
}

function SortableReferenceItem({
  id,
  refText,
  rIdx,
  updateReference,
  removeReference,
  addReference,
  placeholder,
  removeTitle,
  isFocused,
  onFocusHandled,
}: SortableReferenceItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 20 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-1.5 group p-1 rounded-lg border transition-all ${
        isDragging
          ? 'shadow-md border-blue-400 bg-blue-50/40 ring-1 ring-blue-400/20'
          : 'border-transparent hover:border-slate-200'
      }`}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600 rounded touch-none hover:bg-slate-200/50 transition-colors shrink-0"
        title="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      <span className="text-slate-400 font-bold text-sm select-none shrink-0">
        •
      </span>
      <input
        ref={(el) => {
          if (el && isFocused) {
            el.focus();
            onFocusHandled?.();
          }
        }}
        type="text"
        value={refText}
        onChange={(e) => updateReference(rIdx, e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addReference(rIdx);
          }
        }}
        placeholder={placeholder}
        className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 italic transition-shadow"
      />
      <button
        type="button"
        onClick={() => removeReference(rIdx)}
        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors shrink-0"
        title={removeTitle}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
