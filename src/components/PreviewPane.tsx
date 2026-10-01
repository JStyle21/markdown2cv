'use client';

import React, { useState } from 'react';
import { CVData, SectionKey } from '@/types/cv';
import { translations } from '@/lib/i18n';
import { triggerPrint } from '@/lib/exportPdf';
import { cleanReferencesText, isReferenceString } from '@/lib/exportMarkdown';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Printer,
  FileCheck,
} from 'lucide-react';

interface PreviewPaneProps {
  data: CVData;
}

export function PreviewPane({ data }: PreviewPaneProps) {
  const t = translations[data.language];
  const isRtl = data.language === 'he';
  const getHeading = (key: SectionKey) => data.sectionTitles?.[key]?.trim() || t.headings[key];

  const [zoom, setZoom] = useState<number>(100);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 60));
  const handleResetZoom = () => setZoom(100);

  const isEmpty =
    !data.personalInfo.fullName &&
    !data.personalInfo.phone &&
    !data.personalInfo.email &&
    !data.summary &&
    data.experience.length === 0 &&
    data.certifications.length === 0 &&
    data.achievements.length === 0 &&
    data.languages.length === 0;

  return (
    <div
      className="flex flex-col h-full bg-slate-200/80 overflow-hidden"
      id="preview-container"
    >
      {/* Top Toolbar */}
      <div
        id="preview-toolbar"
        className="flex items-center justify-between px-4 py-2 bg-white/90 backdrop-blur-xs border-b border-slate-200 shrink-0 no-print print:hidden"
      >
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {t.ui.preview}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 text-slate-600 hover:text-slate-900 rounded"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="px-2 py-0.5 text-[11px] font-mono font-medium text-slate-700 hover:text-slate-900"
              title="Reset Zoom"
            >
              {zoom}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 text-slate-600 hover:text-slate-900 rounded"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Print */}
          <button
            type="button"
            onClick={triggerPrint}
            title={t.ui.printTitle}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="hidden sm:inline">{t.ui.print}</span>
          </button>
        </div>
      </div>

      {/* Sheet Preview Scroll Area */}
      <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center items-start">
        {isEmpty ? (
          <div className="my-auto text-center p-8 bg-white/60 border border-dashed border-slate-300 rounded-2xl max-w-md">
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {t.ui.emptyPreviewNotice}
            </p>
          </div>
        ) : (
          <div
            id="preview-sheet-wrapper"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
            className="shadow-xl border border-slate-200/80 bg-white print:shadow-none print:border-none print:transform-none print:m-0 print:p-0"
          >
            {/* The Document Sheet */}
            <article
              id="cv-print-area"
              dir={isRtl ? 'rtl' : 'ltr'}
              className="bg-white text-black mx-auto select-text font-calibri"
              style={{
                width: '8.5in',
                minHeight: '11.0in',
                padding: '0.5in 1.0in 0.5in 1.0in',
                boxSizing: 'border-box',
                lineHeight: 1.25,
                color: '#000000',
              }}
            >
              {/* Name */}
              {data.personalInfo.fullName && (
                <h1
                  style={{
                    fontSize: '14pt',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginBottom: '4pt',
                  }}
                >
                  {data.personalInfo.fullName}
                </h1>
              )}

              {/* Contact Line (Centered) */}
              {(data.personalInfo.phone ||
                data.personalInfo.email ||
                data.personalInfo.location ||
                data.personalInfo.linkedin ||
                data.personalInfo.github ||
                data.personalInfo.website) && (
                <div
                  style={{
                    fontSize: '10pt',
                    textAlign: 'center',
                    marginBottom: '6pt',
                  }}
                  className="flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-2.5 gap-y-0.5"
                >
                  {data.personalInfo.phone && (
                    <span className="inline-flex items-center gap-1">
                      <span>{t.labels.phone}</span>
                      <a
                        href={`tel:${data.personalInfo.phone}`}
                        dir="ltr"
                        style={{
                          color: '#0000FF',
                          textDecoration: 'underline',
                          unicodeBidi: 'isolate',
                          direction: 'ltr',
                        }}
                      >
                        {data.personalInfo.phone.startsWith('+')
                          ? `\u200E${data.personalInfo.phone}`
                          : data.personalInfo.phone}
                      </a>
                    </span>
                  )}

                  {data.personalInfo.email && (
                    <span className="inline-flex items-center gap-1">
                      <span>{t.labels.email}</span>
                      <a
                        href={`mailto:${data.personalInfo.email}`}
                        dir="ltr"
                        style={{
                          color: '#0000FF',
                          textDecoration: 'underline',
                          unicodeBidi: 'isolate',
                          direction: 'ltr',
                        }}
                      >
                        {data.personalInfo.email}
                      </a>
                    </span>
                  )}

                  {data.personalInfo.location && (
                    <span className="inline-flex items-center gap-1">
                      <span>{t.labels.location}</span>
                      <span>{data.personalInfo.location}</span>
                    </span>
                  )}

                  {data.personalInfo.linkedin && (
                    <span className="inline-flex items-center">
                      <a
                        href={data.personalInfo.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#0000FF', textDecoration: 'underline' }}
                      >
                        LinkedIn
                      </a>
                    </span>
                  )}

                  {data.personalInfo.github && (
                    <span className="inline-flex items-center">
                      <a
                        href={data.personalInfo.github}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#0000FF', textDecoration: 'underline' }}
                      >
                        GitHub
                      </a>
                    </span>
                  )}

                  {data.personalInfo.website && (
                    <span className="inline-flex items-center">
                      <a
                        href={data.personalInfo.website}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#0000FF', textDecoration: 'underline' }}
                      >
                        {t.labels.website.replace(':', '').trim() || 'Website'}
                      </a>
                    </span>
                  )}
                </div>
              )}

              {/* Divider below Contact */}
              {(data.personalInfo.phone ||
                data.personalInfo.email ||
                data.personalInfo.location ||
                data.personalInfo.linkedin ||
                data.personalInfo.github ||
                data.personalInfo.website) && (
                <div
                  style={{
                    borderBottom: '1px solid #A9A9A9',
                    marginTop: '4pt',
                    marginBottom: '8pt',
                  }}
                />
              )}

              {/* Summary */}
              {data.summary.trim() && (
                <section style={{ marginBottom: '6pt' }}>
                  <h2
                    style={{
                      fontSize: '12pt',
                      fontWeight: 'bold',
                      color: '#1F4E79',
                      marginTop: '6pt',
                      marginBottom: '3pt',
                      textAlign: isRtl ? 'right' : 'left',
                    }}
                  >
                    {getHeading('summary')}
                  </h2>
                  <p
                    style={{
                      fontSize: '10pt',
                      margin: 0,
                      textAlign: isRtl ? 'right' : 'left',
                    }}
                  >
                    {data.summary}
                  </p>
                  <div
                    style={{
                      borderBottom: '1px solid #A9A9A9',
                      marginTop: '6pt',
                      marginBottom: '6pt',
                    }}
                  />
                </section>
              )}

              {/* Experience */}
              {data.experience.length > 0 && (
                <section style={{ marginBottom: '6pt' }}>
                  <h2
                    style={{
                      fontSize: '12pt',
                      fontWeight: 'bold',
                      color: '#1F4E79',
                      marginTop: '8pt',
                      marginBottom: '4pt',
                      textAlign: isRtl ? 'right' : 'left',
                    }}
                  >
                    {getHeading('experience')}
                  </h2>
                  {data.experience.map((exp, idx) => (
                    <div
                      key={exp.id || idx}
                      style={{
                        marginBottom: '4pt',
                      }}
                    >
                      {exp.jobTitle && (
                        <div
                          style={{
                            fontSize: '11pt',
                            fontWeight: 'bold',
                            color: '#000000',
                            marginTop: '4pt',
                            marginBottom: '1pt',
                            textAlign: isRtl ? 'right' : 'left',
                          }}
                        >
                          {exp.jobTitle}
                        </div>
                      )}
                      {(exp.company || exp.dateRange) && (
                        <div
                          style={{
                            fontSize: '10pt',
                            fontStyle: 'italic',
                            color: '#000000',
                            marginBottom: '3pt',
                            textAlign: isRtl ? 'right' : 'left',
                          }}
                        >
                          {[exp.company, exp.dateRange].filter(Boolean).join(' | ')}
                        </div>
                      )}
                      {exp.bullets.filter((b) => b.trim()).length > 0 && (
                        <ul
                          style={{
                            fontSize: '10pt',
                            margin: 0,
                            padding: 0,
                            listStyle: 'none',
                            textAlign: isRtl ? 'right' : 'left',
                          }}
                        >
                          {exp.bullets
                            .filter((b) => b.trim())
                            .map((bullet, bIdx) => (
                              <li
                                key={bIdx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  marginBottom: '0pt',
                                  lineHeight: 1.25,
                                }}
                              >
                                <span
                                  style={{
                                    display: 'inline-block',
                                    width: '16px',
                                    minWidth: '16px',
                                    textAlign: isRtl ? 'right' : 'left',
                                    fontSize: '10pt',
                                    lineHeight: 1.28,
                                    userSelect: 'none',
                                    flexShrink: 0,
                                  }}
                                >
                                  •
                                </span>
                                <span style={{ flex: 1 }}>{bullet}</span>
                              </li>
                            ))}
                        </ul>
                      )}
                      <div
                        style={{
                          borderBottom: '1px solid #A9A9A9',
                          marginTop: '6pt',
                          marginBottom: '6pt',
                        }}
                      />
                    </div>
                  ))}
                </section>
              )}

              {/* Certifications & Education */}
              {data.certifications.length > 0 && (
                <section style={{ marginBottom: '6pt' }}>
                  <h2
                    style={{
                      fontSize: '12pt',
                      fontWeight: 'bold',
                      color: '#1F4E79',
                      marginTop: '8pt',
                      marginBottom: '4pt',
                      textAlign: isRtl ? 'right' : 'left',
                    }}
                  >
                    {getHeading('certifications')}
                  </h2>
                  {data.certifications.map((cert, idx) => (
                    <div
                      key={cert.id || idx}
                      style={{
                        marginBottom: '4pt',
                      }}
                    >
                      {cert.title && (
                        <div
                          style={{
                            fontSize: '11pt',
                            fontWeight: 'bold',
                            color: '#000000',
                            marginTop: '4pt',
                            marginBottom: '1pt',
                            textAlign: isRtl ? 'right' : 'left',
                          }}
                        >
                          {cert.title}
                        </div>
                      )}
                      {(cert.institution || cert.dateRange) && (
                        <div
                          style={{
                            fontSize: '10pt',
                            fontStyle: 'italic',
                            color: '#000000',
                            marginBottom: '3pt',
                            textAlign: isRtl ? 'right' : 'left',
                          }}
                        >
                          {[cert.institution, cert.dateRange]
                            .filter(Boolean)
                            .join(' | ')}
                        </div>
                      )}
                      {cert.skills.filter((s) => s.trim()).length > 0 && (
                        <ul
                          style={{
                            fontSize: '10pt',
                            margin: 0,
                            padding: 0,
                            listStyle: 'none',
                            textAlign: isRtl ? 'right' : 'left',
                          }}
                        >
                          {cert.skills
                            .filter((s) => s.trim())
                            .map((skill, sIdx) => (
                              <li
                                key={sIdx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  marginBottom: '0pt',
                                  lineHeight: 1.25,
                                }}
                              >
                                <span
                                  style={{
                                    display: 'inline-block',
                                    width: '16px',
                                    minWidth: '16px',
                                    textAlign: isRtl ? 'right' : 'left',
                                    fontSize: '10pt',
                                    lineHeight: 1.28,
                                    userSelect: 'none',
                                    flexShrink: 0,
                                  }}
                                >
                                  •
                                </span>
                                <span style={{ flex: 1 }}>{skill}</span>
                              </li>
                            ))}
                        </ul>
                      )}
                      <div
                        style={{
                          borderBottom: '1px solid #A9A9A9',
                          marginTop: '6pt',
                          marginBottom: '6pt',
                        }}
                      />
                    </div>
                  ))}
                </section>
              )}

              {/* Notable Achievements */}
              {data.achievements.length > 0 && (
                <section style={{ marginBottom: '6pt' }}>
                  <h2
                    style={{
                      fontSize: '12pt',
                      fontWeight: 'bold',
                      color: '#1F4E79',
                      marginTop: '6pt',
                      marginBottom: '3pt',
                      textAlign: isRtl ? 'right' : 'left',
                    }}
                  >
                    {getHeading('achievements')}
                  </h2>
                  <ul
                    style={{
                      fontSize: '10pt',
                      margin: 0,
                      padding: 0,
                      listStyle: 'none',
                      textAlign: isRtl ? 'right' : 'left',
                    }}
                  >
                    {data.achievements.map((ach, idx) => (
                      <li
                        key={ach.id || idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          marginBottom: '0pt',
                          lineHeight: 1.25,
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-block',
                            width: '16px',
                            minWidth: '16px',
                            textAlign: isRtl ? 'right' : 'left',
                            fontSize: '10pt',
                            lineHeight: 1.25,
                            userSelect: 'none',
                            flexShrink: 0,
                          }}
                        >
                          •
                        </span>
                        <span style={{ flex: 1 }}>
                          <span>{ach.text} </span>
                          {ach.link && (
                            <a
                              href={ach.link}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                color: '#0000FF',
                                textDecoration: 'underline',
                              }}
                            >
                              {ach.linkText || 'Link'}
                            </a>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div
                    style={{
                      borderBottom: '1px solid #A9A9A9',
                      marginTop: '6pt',
                      marginBottom: '6pt',
                    }}
                  />
                </section>
              )}

              {/* Languages */}
              {data.languages.filter((l) => l.trim() && !isReferenceString(l)).length > 0 && (
                <section style={{ marginBottom: '6pt' }}>
                  <h2
                    style={{
                      fontSize: '12pt',
                      fontWeight: 'bold',
                      color: '#1F4E79',
                      marginTop: '6pt',
                      marginBottom: '3pt',
                      textAlign: isRtl ? 'right' : 'left',
                    }}
                  >
                    {getHeading('languages')}
                  </h2>
                  <ul
                    style={{
                      fontSize: '10pt',
                      margin: 0,
                      padding: 0,
                      listStyle: 'none',
                      textAlign: isRtl ? 'right' : 'left',
                    }}
                  >
                    {data.languages
                      .filter((l) => l.trim() && !isReferenceString(l))
                      .map((lang, idx) => (
                        <li
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            marginBottom: '0pt',
                            lineHeight: 1.25,
                          }}
                        >
                          <span
                            style={{
                              display: 'inline-block',
                              width: '16px',
                              minWidth: '16px',
                              textAlign: isRtl ? 'right' : 'left',
                              fontSize: '10pt',
                              lineHeight: 1.28,
                              userSelect: 'none',
                              flexShrink: 0,
                            }}
                          >
                            •
                          </span>
                          <span style={{ flex: 1 }}>{lang}</span>
                        </li>
                      ))}
                  </ul>
                  <div
                    style={{
                      borderBottom: '1px solid #A9A9A9',
                      marginTop: '6pt',
                      marginBottom: '6pt',
                    }}
                  />
                </section>
              )}

              {/* References */}
              {data.references && data.references.trim() && (
                <section
                  style={{
                    marginTop: '8pt',
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid',
                  }}
                >
                  <p
                    style={{
                      fontSize: '10pt',
                      fontStyle: 'italic',
                      margin: 0,
                      textAlign: isRtl ? 'right' : 'left',
                      lineHeight: 1.35,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {getHeading('references')}
                    <br />
                    {cleanReferencesText(data.references) || data.references.trim()}
                  </p>
                </section>
              )}
            </article>
          </div>
        )}
      </div>
    </div>
  );
}
