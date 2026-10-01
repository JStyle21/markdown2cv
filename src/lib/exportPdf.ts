import { CVData } from '@/types/cv';
import { translations } from '@/lib/i18n';
import type { jsPDF } from 'jspdf';

interface LoadedFontSet {
  regular: string;
  bold: string;
  italic: string;
}

const fontCache: Record<string, LoadedFontSet> = {};

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i += 8192) {
    const chunk = bytes.subarray(i, Math.min(i + 8192, len));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

async function loadFontFamily(prefix: 'Carlito' | 'LiberationSans'): Promise<LoadedFontSet> {
  if (fontCache[prefix]) {
    return fontCache[prefix];
  }

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const [resReg, resBold, resItal] = await Promise.all([
    fetch(`${basePath}/fonts/${prefix}-Regular.ttf`),
    fetch(`${basePath}/fonts/${prefix}-Bold.ttf`),
    fetch(`${basePath}/fonts/${prefix}-Italic.ttf`),
  ]);

  if (!resReg.ok || !resBold.ok || !resItal.ok) {
    throw new Error(`Failed to load ${prefix} fonts for PDF generation`);
  }

  const [bufReg, bufBold, bufItal] = await Promise.all([
    resReg.arrayBuffer(),
    resBold.arrayBuffer(),
    resItal.arrayBuffer(),
  ]);

  const set: LoadedFontSet = {
    regular: arrayBufferToBase64(bufReg),
    bold: arrayBufferToBase64(bufBold),
    italic: arrayBufferToBase64(bufItal),
  };
  fontCache[prefix] = set;
  return set;
}

function mirrorBracket(ch: string): string {
  switch (ch) {
    case '(': return ')';
    case ')': return '(';
    case '[': return ']';
    case ']': return '[';
    case '{': return '}';
    case '}': return '{';
    case '<': return '>';
    case '>': return '<';
    default: return ch;
  }
}

function renderBidiLine(doc: jsPDF, line: string, rightX: number, y: number): void {
  const words = line.split(' ');
  const spaceWidth = doc.getTextWidth(' ');
  let curX = rightX;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (!word) continue;

    const segs: { text: string; isHeb: boolean }[] = [];
    let cur = '';
    let isHeb: boolean | null = null;
    for (const ch of word) {
      const h = /[\u0590-\u05FF]/.test(ch);
      if (isHeb === null) {
        isHeb = h;
        cur = ch;
      } else if (isHeb === h) {
        cur += ch;
      } else {
        segs.push({ text: cur, isHeb });
        isHeb = h;
        cur = ch;
      }
    }
    if (cur && isHeb !== null) {
      segs.push({ text: cur, isHeb });
    }

    for (const seg of segs) {
      const drawnText = seg.isHeb
        ? seg.text.split('').reverse().join('')
        : seg.text.split('').map(mirrorBracket).join('');
      const w = doc.getTextWidth(drawnText);
      doc.text(drawnText, curX - w, y);
      curX -= w;
    }

    if (i < words.length - 1) {
      curX -= spaceWidth;
    }
  }
}

function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (doc.getTextWidth(test) <= maxWidth) {
      cur = test;
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function isReferenceString(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes('reference') ||
    lower.includes('available upon request') ||
    lower.includes('המלצות') ||
    lower.includes('יימסרו לפי דרישה')
  );
}

export async function exportToPdf(
  dataOrElementId: CVData | string,
  filename: string = 'CV.pdf'
): Promise<void> {
  const outName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  let data: CVData;
  if (typeof dataOrElementId === 'object' && dataOrElementId !== null) {
    data = dataOrElementId;
  } else {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('markdown2cv_data') : null;
      if (saved) {
        data = JSON.parse(saved);
      } else {
        throw new Error('No CV data found');
      }
    } catch {
      throw new Error('Unable to retrieve CV data for vector PDF export');
    }
  }

  const { jsPDF } = await import('jspdf');

  const isRtl = data.language === 'he';
  const prefix = isRtl ? 'LiberationSans' : 'Carlito';
  const fontName = prefix;
  const fonts = await loadFontFamily(prefix);

  const doc = new jsPDF({
    unit: 'pt',
    format: 'letter',
    orientation: 'portrait',
  });

  doc.addFileToVFS(`${prefix}-Regular.ttf`, fonts.regular);
  doc.addFileToVFS(`${prefix}-Bold.ttf`, fonts.bold);
  doc.addFileToVFS(`${prefix}-Italic.ttf`, fonts.italic);

  doc.addFont(`${prefix}-Regular.ttf`, fontName, 'normal');
  doc.addFont(`${prefix}-Bold.ttf`, fontName, 'bold');
  doc.addFont(`${prefix}-Italic.ttf`, fontName, 'italic');
  doc.setFont(fontName, 'normal');

  const t = translations[data.language || 'en'];
  const pageWidth = doc.internal.pageSize.getWidth(); // 612 pt
  const pageHeight = doc.internal.pageSize.getHeight(); // 792 pt
  const marginLeft = 72; // 1.0 inch margins
  const marginRight = 72; // 1.0 inch margins
  const marginTop = 36; // 0.5 inch margins
  const marginBottom = 36; // 0.5 inch margins
  const contentWidth = pageWidth - marginLeft - marginRight; // 468 pt

  let y = marginTop;

  function checkPageBreak(neededHeight: number): void {
    if (y + neededHeight > pageHeight - marginBottom) {
      doc.addPage();
      y = marginTop;
    }
  }

  function renderLine(line: string, xPos: number, yPos: number): void {
    if (isRtl) {
      renderBidiLine(doc, line, xPos, yPos);
    } else {
      doc.text(line, xPos, yPos);
    }
  }

  function addDivider(): void {
    checkPageBreak(16);
    y += 4;
    doc.setDrawColor(169, 169, 169); // #A9A9A9
    doc.setLineWidth(0.75);
    doc.line(marginLeft, y, pageWidth - marginRight, y);
    y += 10;
  }

  function addSectionHeading(title: string): void {
    checkPageBreak(30);
    y += 6;
    doc.setFont(fontName, 'bold');
    doc.setFontSize(12);
    doc.setTextColor(31, 78, 121); // #1F4E79
    const xPos = isRtl ? pageWidth - marginRight : marginLeft;
    renderLine(title, xPos, y);
    y += 14;
  }

  function addBullet(bulletText: string): void {
    doc.setFont(fontName, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    const bulletIndent = 16;
    const bulletWidth = contentWidth - bulletIndent;

    const lines = wrapText(doc, bulletText, bulletWidth);
    for (let i = 0; i < lines.length; i++) {
      checkPageBreak(13);
      const l = lines[i];

      if (isRtl) {
        const textRightX = pageWidth - marginRight - bulletIndent;
        renderBidiLine(doc, l, textRightX, y);
        if (i === 0) {
          doc.text('•', pageWidth - marginRight, y, { align: 'right' });
        }
      } else {
        doc.text(l, marginLeft + bulletIndent, y);
        if (i === 0) {
          doc.text('•', marginLeft + 3, y);
        }
      }
      y += 12.5;
    }
  }

  // 1. Full Name
  if (data.personalInfo.fullName) {
    doc.setFont(fontName, 'bold');
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    if (isRtl) {
      const nameW = doc.getTextWidth(data.personalInfo.fullName);
      const rightX = (pageWidth + nameW) / 2;
      renderBidiLine(doc, data.personalInfo.fullName, rightX, y);
    } else {
      doc.text(data.personalInfo.fullName, pageWidth / 2, y, { align: 'center' });
    }
    y += 16;
  }

  // 2. Contact Line
  interface ContactRun {
    text: string;
    isLink: boolean;
    url?: string;
    color: [number, number, number];
  }

  const contactRuns: ContactRun[] = [];

  if (data.personalInfo.phone) {
    contactRuns.push({
      text: `${t.labels.phone} `,
      isLink: false,
      color: [0, 0, 0],
    });
    contactRuns.push({
      text: data.personalInfo.phone,
      isLink: true,
      url: `tel:${data.personalInfo.phone}`,
      color: [0, 0, 255],
    });
  }

  if (data.personalInfo.email) {
    if (contactRuns.length > 0) {
      contactRuns.push({ text: '  ', isLink: false, color: [0, 0, 0] });
    }
    contactRuns.push({
      text: `${t.labels.email} `,
      isLink: false,
      color: [0, 0, 0],
    });
    contactRuns.push({
      text: data.personalInfo.email,
      isLink: true,
      url: `mailto:${data.personalInfo.email}`,
      color: [0, 0, 255],
    });
  }

  if (data.personalInfo.location) {
    if (contactRuns.length > 0) {
      contactRuns.push({ text: '  ', isLink: false, color: [0, 0, 0] });
    }
    contactRuns.push({
      text: `${t.labels.location} ${data.personalInfo.location}`,
      isLink: false,
      color: [0, 0, 0],
    });
  }

  if (data.personalInfo.linkedin) {
    if (contactRuns.length > 0) {
      contactRuns.push({ text: '  ', isLink: false, color: [0, 0, 0] });
    }
    contactRuns.push({
      text: 'LinkedIn',
      isLink: true,
      url: data.personalInfo.linkedin,
      color: [0, 0, 255],
    });
  }

  if (data.personalInfo.github) {
    if (contactRuns.length > 0) {
      contactRuns.push({ text: '  ', isLink: false, color: [0, 0, 0] });
    }
    contactRuns.push({
      text: 'GitHub',
      isLink: true,
      url: data.personalInfo.github,
      color: [0, 0, 255],
    });
  }

  if (data.personalInfo.website) {
    if (contactRuns.length > 0) {
      contactRuns.push({ text: '  ', isLink: false, color: [0, 0, 0] });
    }
    contactRuns.push({
      text: t.labels.website.replace(':', '').trim() || 'Website',
      isLink: true,
      url: data.personalInfo.website,
      color: [0, 0, 255],
    });
  }

  if (contactRuns.length > 0) {
    doc.setFont(fontName, 'normal');
    doc.setFontSize(10);
    const totalW = contactRuns.reduce((sum, r) => sum + doc.getTextWidth(r.text), 0);
    let curX = Math.max(marginLeft, (pageWidth - totalW) / 2);

    for (const r of contactRuns) {
      doc.setTextColor(...r.color);
      const w = doc.getTextWidth(r.text);
      if (isRtl) {
        renderBidiLine(doc, r.text, curX + w, y);
      } else {
        doc.text(r.text, curX, y);
      }
      if (r.isLink && r.url) {
        doc.setDrawColor(0, 0, 255);
        doc.setLineWidth(0.5);
        doc.line(curX, y + 1.5, curX + w, y + 1.5);
        doc.link(curX, y - 9, w, 11, { url: r.url });
      }
      curX += w;
    }
    y += 12;
    addDivider();
  }

  // 3. Summary
  if (data.summary && data.summary.trim()) {
    addSectionHeading(data.sectionTitles?.summary || t.headings.summary);
    doc.setFont(fontName, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    const lines = wrapText(doc, data.summary.trim(), contentWidth);
    for (const l of lines) {
      checkPageBreak(13);
      const xPos = isRtl ? pageWidth - marginRight : marginLeft;
      renderLine(l, xPos, y);
      y += 12.5;
    }
    addDivider();
  }

  // 4. Experience
  if (data.experience && data.experience.length > 0) {
    addSectionHeading(data.sectionTitles?.experience || t.headings.experience);
    for (const item of data.experience) {
      checkPageBreak(40);

      // Line 1: Job Title (11pt bold)
      if (item.jobTitle) {
        doc.setFont(fontName, 'bold');
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        const xPos = isRtl ? pageWidth - marginRight : marginLeft;
        renderLine(item.jobTitle, xPos, y);
        y += 13.5;
      }

      // Line 2: Company | DateRange (10pt italic)
      const compDate = [item.company, item.dateRange].filter(Boolean).join(' | ');
      if (compDate) {
        checkPageBreak(14);
        doc.setFont(fontName, 'italic');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        const xPos = isRtl ? pageWidth - marginRight : marginLeft;
        renderLine(compDate, xPos, y);
        y += 14;
      }

      // Bullets (10pt regular)
      if (item.bullets) {
        for (const b of item.bullets) {
          if (b.trim()) {
            addBullet(b.trim());
          }
        }
      }

      // Divider after each job
      addDivider();
    }
  }

  // 5. Training and Certifications
  if (data.certifications && data.certifications.length > 0) {
    addSectionHeading(data.sectionTitles?.certifications || t.headings.certifications);
    for (const item of data.certifications) {
      checkPageBreak(40);

      // Line 1: Title (11pt bold)
      if (item.title) {
        doc.setFont(fontName, 'bold');
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        const xPos = isRtl ? pageWidth - marginRight : marginLeft;
        renderLine(item.title, xPos, y);
        y += 13.5;
      }

      // Line 2: Institution | DateRange (10pt italic)
      const instDate = [item.institution, item.dateRange].filter(Boolean).join(' | ');
      if (instDate) {
        checkPageBreak(14);
        doc.setFont(fontName, 'italic');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        const xPos = isRtl ? pageWidth - marginRight : marginLeft;
        renderLine(instDate, xPos, y);
        y += 14;
      }

      // Skills / bullets
      if (item.skills) {
        for (const s of item.skills) {
          if (s.trim()) {
            addBullet(s.trim());
          }
        }
      }

      // Divider after each certification
      addDivider();
    }
  }

  // 6. Notable Achievements
  if (data.achievements && data.achievements.length > 0) {
    addSectionHeading(data.sectionTitles?.achievements || t.headings.achievements);
    for (const item of data.achievements) {
      doc.setFont(fontName, 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      const bulletIndent = 16;
      const bulletWidth = contentWidth - bulletIndent;
      const mainText = item.text.trim();
      const linkText = (item.linkText || '').trim();
      const url = item.link?.trim();

      if (!url || !linkText) {
        addBullet(mainText);
        continue;
      }

      const fullText = `${mainText}  ${linkText}`;
      const fullWidth = doc.getTextWidth(fullText);

      if (fullWidth <= bulletWidth) {
        checkPageBreak(13);
        if (isRtl) {
          const textRightX = pageWidth - marginRight - bulletIndent;
          doc.text('•', pageWidth - marginRight, y, { align: 'right' });
          renderBidiLine(doc, mainText, textRightX, y);

          const mainW = doc.getTextWidth(mainText);
          const linkRightX = textRightX - mainW - 6;
          const linkW = doc.getTextWidth(linkText);

          doc.setTextColor(0, 0, 255);
          renderBidiLine(doc, linkText, linkRightX, y);
          doc.setDrawColor(0, 0, 255);
          doc.setLineWidth(0.5);
          doc.line(linkRightX - linkW, y + 1.5, linkRightX, y + 1.5);
          doc.link(linkRightX - linkW, y - 9, linkW, 11, { url });
          doc.setTextColor(0, 0, 0);
        } else {
          doc.text('•', marginLeft + 3, y);
          const textX = marginLeft + bulletIndent;
          doc.text(mainText, textX, y);

          const mainW = doc.getTextWidth(mainText);
          const linkX = textX + mainW + doc.getTextWidth('  ');
          const linkW = doc.getTextWidth(linkText);

          doc.setTextColor(0, 0, 255);
          doc.text(linkText, linkX, y);
          doc.setDrawColor(0, 0, 255);
          doc.setLineWidth(0.5);
          doc.line(linkX, y + 1.5, linkX + linkW, y + 1.5);
          doc.link(linkX, y - 9, linkW, 11, { url });
          doc.setTextColor(0, 0, 0);
        }
        y += 12.5;
      } else {
        const lines = wrapText(doc, mainText, bulletWidth);
        for (let i = 0; i < lines.length; i++) {
          checkPageBreak(13);
          const l = lines[i];
          if (isRtl) {
            const textRightX = pageWidth - marginRight - bulletIndent;
            renderBidiLine(doc, l, textRightX, y);
            if (i === 0) doc.text('•', pageWidth - marginRight, y, { align: 'right' });
          } else {
            doc.text(l, marginLeft + bulletIndent, y);
            if (i === 0) doc.text('•', marginLeft + 3, y);
          }
          y += 12.5;
        }

        checkPageBreak(13);
        const linkW = doc.getTextWidth(linkText);
        doc.setTextColor(0, 0, 255);
        if (isRtl) {
          const linkRightX = pageWidth - marginRight - bulletIndent;
          renderBidiLine(doc, linkText, linkRightX, y);
          doc.setDrawColor(0, 0, 255);
          doc.setLineWidth(0.5);
          doc.line(linkRightX - linkW, y + 1.5, linkRightX, y + 1.5);
          doc.link(linkRightX - linkW, y - 9, linkW, 11, { url });
        } else {
          const linkX = marginLeft + bulletIndent;
          doc.text(linkText, linkX, y);
          doc.setDrawColor(0, 0, 255);
          doc.setLineWidth(0.5);
          doc.line(linkX, y + 1.5, linkX + linkW, y + 1.5);
          doc.link(linkX, y - 9, linkW, 11, { url });
        }
        doc.setTextColor(0, 0, 0);
        y += 12.5;
      }
    }
    addDivider();
  }

  // 7. Languages
  const cleanLangs = (data.languages || []).filter((l) => l.trim() && !isReferenceString(l));
  if (cleanLangs.length > 0) {
    addSectionHeading(data.sectionTitles?.languages || t.headings.languages);
    if (data.languagesDisplay === 'inline') {
      doc.setFont(fontName, 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const line = cleanLangs.join('  •  ');
      const lines = wrapText(doc, line, contentWidth);
      for (const l of lines) {
        checkPageBreak(13);
        const xPos = isRtl ? pageWidth - marginRight : marginLeft;
        renderLine(l, xPos, y);
        y += 12.5;
      }
    } else {
      for (const lang of cleanLangs) {
        addBullet(lang);
      }
    }
    addDivider();
  }

  // 8. References
  if (data.references && data.references.trim()) {
    checkPageBreak(30);
    doc.setFont(fontName, 'italic');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    const xPos = isRtl ? pageWidth - marginRight : marginLeft;
    const refHeading = data.sectionTitles?.references || t.headings.references || 'References:';
    renderLine(refHeading, xPos, y);
    y += 12.5;

    const lines = wrapText(doc, data.references.trim(), contentWidth);
    for (const l of lines) {
      checkPageBreak(13);
      renderLine(l, xPos, y);
      y += 12.5;
    }
  }

  doc.save(outName);
}

export function triggerPrint(): void {
  window.print();
}
