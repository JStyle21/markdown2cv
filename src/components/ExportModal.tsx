'use client';

import React, { useState, useEffect } from 'react';
import { CVData } from '@/types/cv';
import { translations } from '@/lib/i18n';
import { exportToDocx } from '@/lib/exportDocx';
import { exportToMarkdown } from '@/lib/exportMarkdown';
import { exportToDoc } from '@/lib/exportDoc';
import { exportToPdf } from '@/lib/exportPdf';
import { saveAs } from 'file-saver';
import { X, Download, FileText, CheckSquare, Square, CheckCircle } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CVData;
}

export function ExportModal({ isOpen, onClose, data }: ExportModalProps) {
  const t = translations[data.language];
  const isRtl = data.language === 'he';

  const computeDefaultFilename = (name: string) => {
    const clean = (name.trim() || 'Resume')
      .replace(/[^\w\u0590-\u05FF\s-]/g, '')
      .trim()
      .replace(/\s+/g, '_');
    return `${clean || 'Resume'}_CV`;
  };

  const [filename, setFilename] = useState(() => computeDefaultFilename(data.personalInfo.fullName));

  useEffect(() => {
    if (isOpen) {
      setFilename(computeDefaultFilename(data.personalInfo.fullName));
      setIsExporting(false);
      setSuccessMessage('');
    }
  }, [isOpen, data.personalInfo.fullName]);
  const [selectedFormats, setSelectedFormats] = useState<{
    docx: boolean;
    pdf: boolean;
    markdown: boolean;
    json: boolean;
    doc: boolean;
  }>({
    docx: true,
    pdf: true,
    markdown: false,
    json: false,
    doc: false,
  });

  const [isExporting, setIsExporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const toggleFormat = (key: keyof typeof selectedFormats) => {
    setSelectedFormats((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedCount = Object.values(selectedFormats).filter(Boolean).length;

  const handleExport = async () => {
    if (selectedCount === 0) return;
    setIsExporting(true);
    setSuccessMessage('');

    const baseName = filename.trim() || 'CV';

    try {
      if (selectedFormats.docx) {
        await exportToDocx(data, `${baseName}.docx`);
      }
      if (selectedFormats.markdown) {
        exportToMarkdown(data, `${baseName}.md`);
      }
      if (selectedFormats.json) {
        const jsonBlob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json;charset=utf-8',
        });
        saveAs(jsonBlob, `${baseName}.json`);
      }
      if (selectedFormats.doc) {
        exportToDoc(data, `${baseName}.doc`);
      }
      if (selectedFormats.pdf) {
        await exportToPdf(data, `${baseName}.pdf`);
      }

      setSuccessMessage(t.ui.exportSuccess);
      setTimeout(() => {
        setIsExporting(false);
        setSuccessMessage('');
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Export error:', err);
      setIsExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200 no-print print:hidden"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-800">{t.ui.exportModalTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-sm text-slate-600">{t.ui.exportModalDesc}</p>

          {/* Filename input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t.ui.filename}
            </label>
            <div className="relative">
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                placeholder={t.placeholders.filename}
              />
            </div>
          </div>

          {/* Format Checkboxes */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t.ui.selectFormats}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* DOCX */}
              <button
                type="button"
                onClick={() => toggleFormat('docx')}
                className={`flex items-center gap-3 p-3 rounded-lg border text-start transition-all ${
                  selectedFormats.docx
                    ? 'border-blue-500 bg-blue-50/50 text-blue-900 ring-1 ring-blue-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                {selectedFormats.docx ? (
                  <CheckSquare className="w-5 h-5 text-blue-600 shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400 shrink-0" />
                )}
                <div>
                  <div className="font-semibold text-sm">{t.ui.formatDocx}</div>
                  <div className="text-xs text-slate-500">Word (OpenXML)</div>
                </div>
              </button>

              {/* PDF */}
              <button
                type="button"
                onClick={() => toggleFormat('pdf')}
                className={`flex items-center gap-3 p-3 rounded-lg border text-start transition-all ${
                  selectedFormats.pdf
                    ? 'border-blue-500 bg-blue-50/50 text-blue-900 ring-1 ring-blue-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                {selectedFormats.pdf ? (
                  <CheckSquare className="w-5 h-5 text-blue-600 shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400 shrink-0" />
                )}
                <div>
                  <div className="font-semibold text-sm">{t.ui.formatPdf}</div>
                  <div className="text-xs text-slate-500">Direct PDF file</div>
                </div>
              </button>

              {/* Markdown */}
              <button
                type="button"
                onClick={() => toggleFormat('markdown')}
                className={`flex items-center gap-3 p-3 rounded-lg border text-start transition-all ${
                  selectedFormats.markdown
                    ? 'border-blue-500 bg-blue-50/50 text-blue-900 ring-1 ring-blue-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                {selectedFormats.markdown ? (
                  <CheckSquare className="w-5 h-5 text-blue-600 shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400 shrink-0" />
                )}
                <div>
                  <div className="font-semibold text-sm">{t.ui.formatMarkdown}</div>
                  <div className="text-xs text-slate-500">Plain text / GitHub</div>
                </div>
              </button>

              {/* JSON */}
              <button
                type="button"
                onClick={() => toggleFormat('json')}
                className={`flex items-center gap-3 p-3 rounded-lg border text-start transition-all ${
                  selectedFormats.json
                    ? 'border-blue-500 bg-blue-50/50 text-blue-900 ring-1 ring-blue-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                {selectedFormats.json ? (
                  <CheckSquare className="w-5 h-5 text-blue-600 shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400 shrink-0" />
                )}
                <div>
                  <div className="font-semibold text-sm">{t.ui.formatJson}</div>
                  <div className="text-xs text-slate-500">Backup & Re-import</div>
                </div>
              </button>

              {/* DOC */}
              <button
                type="button"
                onClick={() => toggleFormat('doc')}
                className={`flex items-center gap-3 p-3 rounded-lg border text-start transition-all ${
                  selectedFormats.doc
                    ? 'border-blue-500 bg-blue-50/50 text-blue-900 ring-1 ring-blue-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                {selectedFormats.doc ? (
                  <CheckSquare className="w-5 h-5 text-blue-600 shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400 shrink-0" />
                )}
                <div>
                  <div className="font-semibold text-sm">{t.ui.formatDoc}</div>
                  <div className="text-xs text-slate-500">Word HTML MIME</div>
                </div>
              </button>
            </div>
          </div>

          {successMessage && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            {t.ui.cancel}
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={selectedCount === 0 || isExporting}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            {isExporting ? t.ui.downloading : `${t.ui.downloadSelected} (${selectedCount})`}
          </button>
        </div>
      </div>
    </div>
  );
}
