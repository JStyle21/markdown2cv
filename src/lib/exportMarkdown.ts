import { saveAs } from 'file-saver';
import {
  CVData,
  Language,
  createEmptyCV,
  ExperienceItem,
  CertificationItem,
  AchievementItem,
  SectionKey,
} from '@/types/cv';
import { translations } from '@/lib/i18n';

export function cleanReferencesText(text: string): string {
  if (!text) return '';
  return text
    .replace(/^[*_#\s]*(?:references?|המלצות)[\s:*_#-]*/gi, '')
    .replace(/^[*_]+|[*_]+$/g, '')
    .trim();
}

export function isReferenceString(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase().trim();
  return (
    lower.includes('reference') ||
    lower.includes('המלצות') ||
    lower.includes('available upon request') ||
    lower.includes('לפי דרישה')
  );
}

export function cvToMarkdown(data: CVData): string {
  const t = translations[data.language];
  const lines: string[] = [];
  const getHeading = (key: SectionKey) => data.sectionTitles?.[key]?.trim() || t.headings[key];

  // Header
  if (data.personalInfo.fullName) {
    lines.push(`# ${data.personalInfo.fullName}`);
    lines.push('');
  }

  const contactParts: string[] = [];
  if (data.personalInfo.phone) {
    const formattedPhone =
      data.language === 'he' && data.personalInfo.phone.trim().startsWith('+')
        ? `\u200E${data.personalInfo.phone.trim()}`
        : data.personalInfo.phone;
    contactParts.push(`${t.labels.phone} [${formattedPhone}](tel:${data.personalInfo.phone})`);
  }
  if (data.personalInfo.email) {
    contactParts.push(`${t.labels.email} [${data.personalInfo.email}](mailto:${data.personalInfo.email})`);
  }
  if (data.personalInfo.location) {
    contactParts.push(`${t.labels.location} ${data.personalInfo.location}`);
  }
  if (data.personalInfo.linkedin) {
    contactParts.push(`[LinkedIn](${data.personalInfo.linkedin})`);
  }
  if (data.personalInfo.github) {
    contactParts.push(`[GitHub](${data.personalInfo.github})`);
  }
  if (data.personalInfo.website) {
    contactParts.push(`[Website](${data.personalInfo.website})`);
  }

  if (contactParts.length > 0) {
    lines.push(contactParts.join('  |  '));
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Summary
  if (data.summary.trim()) {
    lines.push(`## ${getHeading('summary')}`);
    lines.push('');
    lines.push(data.summary.trim());
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Experience
  if (data.experience.length > 0) {
    lines.push(`## ${getHeading('experience')}`);
    lines.push('');
    data.experience.forEach((exp) => {
      if (exp.jobTitle) {
        lines.push(`### ${exp.jobTitle}`);
      }
      if (exp.company || exp.dateRange) {
        lines.push(`*${[exp.company, exp.dateRange].filter(Boolean).join(' | ')}*`);
        lines.push('');
      }
      exp.bullets.forEach((bullet) => {
        if (bullet.trim()) {
          lines.push(`- ${bullet.trim()}`);
        }
      });
      lines.push('');
      lines.push('---');
      lines.push('');
    });
  }

  // Certifications
  if (data.certifications.length > 0) {
    lines.push(`## ${getHeading('certifications')}`);
    lines.push('');
    data.certifications.forEach((cert) => {
      if (cert.title) {
        lines.push(`### ${cert.title}`);
      }
      if (cert.institution || cert.dateRange) {
        lines.push(`*${[cert.institution, cert.dateRange].filter(Boolean).join(' | ')}*`);
        lines.push('');
      }
      cert.skills.forEach((skill) => {
        if (skill.trim()) {
          lines.push(`- ${skill.trim()}`);
        }
      });
      lines.push('');
      lines.push('---');
      lines.push('');
    });
  }

  // Achievements
  if (data.achievements.length > 0) {
    lines.push(`## ${getHeading('achievements')}`);
    lines.push('');
    data.achievements.forEach((ach) => {
      const linkPart = ach.link ? ` [${ach.linkText || 'Link'}](${ach.link})` : '';
      lines.push(`- ${ach.text}${linkPart}`);
    });
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Languages
  if (data.languages.length > 0) {
    lines.push(`## ${getHeading('languages')}`);
    lines.push('');
    data.languages.forEach((lang) => {
      if (lang.trim()) {
        lines.push(`- ${lang.trim()}`);
      }
    });
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // References
  if (data.references && data.references.trim()) {
    const cleanRef = cleanReferencesText(data.references) || data.references.trim();
    lines.push(`## ${getHeading('references')}`);
    lines.push('');
    lines.push(cleanRef);
    lines.push('');
  }

  return lines.join('\n');
}

export function parseMarkdownToCV(markdown: string, fallbackLang: Language = 'en'): CVData {
  const result: CVData = createEmptyCV(fallbackLang);
  result.sectionTitles = {};

  // Detect language if Hebrew section names exist
  if (/##\s*(תקציר|תמצית|ניסיון|השכלה|הישגים|שפות|המלצות)/.test(markdown)) {
    result.language = 'he';
  } else {
    result.language = fallbackLang;
  }

  const lines = markdown.split(/\r?\n/);
  let currentSection = 'header';
  const summaryLines: string[] = [];
  const referencesLines: string[] = [];

  let currentExp: ExperienceItem | null = null;
  let currentCert: CertificationItem | null = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) continue;

    // Check for Section Headings
    if (line.startsWith('# ')) {
      result.personalInfo.fullName = line.replace(/^#\s+/, '').trim();
      continue;
    }

    if (line.startsWith('## ')) {
      // Flush previous item
      if (currentExp) {
        result.experience.push(currentExp);
        currentExp = null;
      }
      if (currentCert) {
        result.certifications.push(currentCert);
        currentCert = null;
      }

      const rawHeading = line.replace(/^##\s+/, '').trim();
      const heading = rawHeading.toLowerCase();

      if (
        heading.includes('summary') ||
        heading.includes('תקציר') ||
        heading.includes('תמצית') ||
        heading.includes('פרופיל') ||
        heading.includes('אודות') ||
        heading.includes('profile')
      ) {
        currentSection = 'summary';
        result.sectionTitles.summary = rawHeading;
      } else if (
        heading.includes('experience') ||
        heading.includes('ניסיון') ||
        heading.includes('work') ||
        heading.includes('employment') ||
        heading.includes('תעסוקה')
      ) {
        currentSection = 'experience';
        result.sectionTitles.experience = rawHeading;
      } else if (
        heading.includes('training') ||
        heading.includes('cert') ||
        heading.includes('education') ||
        heading.includes('השכלה') ||
        heading.includes('תעודות') ||
        heading.includes('הכשרות') ||
        heading.includes('הסמכות') ||
        heading.includes('קורסים')
      ) {
        currentSection = 'certifications';
        result.sectionTitles.certifications = rawHeading;
      } else if (
        heading.includes('achievement') ||
        heading.includes('הישגים') ||
        heading.includes('פרסים') ||
        heading.includes('awards') ||
        heading.includes('honors')
      ) {
        currentSection = 'achievements';
        result.sectionTitles.achievements = rawHeading;
      } else if (heading.includes('language') || heading.includes('שפות')) {
        currentSection = 'languages';
        result.sectionTitles.languages = rawHeading;
      } else if (heading.includes('reference') || heading.includes('המלצות')) {
        currentSection = 'references';
        result.sectionTitles.references = rawHeading;
      } else {
        currentSection = 'unknown';
      }
      continue;
    }

    // Ignore horizontal rules
    if (line === '---' || line === '***' || line === '___') {
      if (currentExp) {
        result.experience.push(currentExp);
        currentExp = null;
      }
      if (currentCert) {
        result.certifications.push(currentCert);
        currentCert = null;
      }
      continue;
    }

    // Parsing sections
    if (currentSection === 'header') {
      // Look for contact lines with links or labels
      const telMatch = line.match(/\[([^\]]+)\]\(tel:([^)]+)\)/i) || line.match(/tel:([^\s)]+)/i);
      if (telMatch) {
        result.personalInfo.phone = (telMatch[1] || telMatch[2]).trim();
      } else {
        const phoneLabelMatch = line.match(/(?:Phone|טלפון):\s*([+\d\s()-]+)/i);
        if (phoneLabelMatch) {
          result.personalInfo.phone = phoneLabelMatch[1].trim();
        }
      }

      const mailMatch = line.match(/\[([^\]]+)\]\(mailto:([^)]+)\)/i) || line.match(/mailto:([^\s)]+)/i);
      if (mailMatch) {
        result.personalInfo.email = (mailMatch[1] || mailMatch[2]).trim();
      } else {
        const emailLabelMatch = line.match(/(?:Email|אימייל):\s*([^\s|]+@[^\s|]+)/i);
        if (emailLabelMatch) {
          result.personalInfo.email = emailLabelMatch[1].trim();
        }
      }

      const locMatch = line.match(/(?:Location|מיקום):\s*([^|]+)/i);
      if (locMatch) {
        result.personalInfo.location = locMatch[1].trim();
      }

      const linkedinMatch = line.match(/\[(?:LinkedIn|לינקדאין)\]\(([^)]+)\)/i);
      if (linkedinMatch) {
        result.personalInfo.linkedin = linkedinMatch[1].trim();
      }

      const githubMatch = line.match(/\[(?:GitHub|גיטהאב)\]\(([^)]+)\)/i);
      if (githubMatch) {
        result.personalInfo.github = githubMatch[1].trim();
      }

      const websiteMatch = line.match(/\[(?:Website|אתר)\]\(([^)]+)\)/i);
      if (websiteMatch) {
        result.personalInfo.website = websiteMatch[1].trim();
      }
    } else if (currentSection === 'summary') {
      summaryLines.push(line);
    } else if (currentSection === 'experience') {
      if (line.startsWith('### ')) {
        if (currentExp) {
          result.experience.push(currentExp);
        }
        currentExp = {
          id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          jobTitle: line.replace(/^###\s+/, '').trim(),
          company: '',
          dateRange: '',
          bullets: [],
        };
      } else if (line.startsWith('*') && line.endsWith('*') && currentExp) {
        const content = line.slice(1, -1).trim();
        const parts = content.split('|').map((s) => s.trim());
        currentExp.company = parts[0] || '';
        currentExp.dateRange = parts[1] || '';
      } else if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
        const bulletText = line.replace(/^[-*•]\s+/, '').trim();
        if (currentExp) {
          currentExp.bullets.push(bulletText);
        }
      }
    } else if (currentSection === 'certifications') {
      if (line.startsWith('### ')) {
        if (currentCert) {
          result.certifications.push(currentCert);
        }
        currentCert = {
          id: `cert-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          title: line.replace(/^###\s+/, '').trim(),
          institution: '',
          dateRange: '',
          skills: [],
        };
      } else if (line.startsWith('*') && line.endsWith('*') && currentCert) {
        const content = line.slice(1, -1).trim();
        const parts = content.split('|').map((s) => s.trim());
        currentCert.institution = parts[0] || '';
        currentCert.dateRange = parts[1] || '';
      } else if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
        const skillText = line.replace(/^[-*•]\s+/, '').trim();
        if (currentCert) {
          currentCert.skills.push(skillText);
        }
      }
    } else if (currentSection === 'achievements') {
      if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
        const content = line.replace(/^[-*•]\s+/, '').trim();
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/;
        const match = content.match(linkRegex);

        let text = content;
        let link = '';
        let linkText = '';

        if (match) {
          linkText = match[1];
          link = match[2];
          text = content.replace(match[0], '').trim();
        }

        result.achievements.push({
          id: `ach-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          text,
          link,
          linkText,
        });
      }
    } else if (currentSection === 'languages') {
      if (isReferenceString(line)) {
        currentSection = 'references';
        const cleanRef = cleanReferencesText(line);
        if (cleanRef && !isReferenceString(cleanRef)) referencesLines.push(cleanRef);
      } else if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
        const langText = line.replace(/^[-*•]\s+/, '').trim();
        if (langText && !isReferenceString(langText)) {
          result.languages.push(langText);
          result.languagesDisplay = 'bullets';
        } else if (isReferenceString(langText)) {
          currentSection = 'references';
          const cleanRef = cleanReferencesText(langText);
          if (cleanRef && !isReferenceString(cleanRef)) referencesLines.push(cleanRef);
        }
      } else {
        const commaLangs = line
          .split(',')
          .map((s) => s.trim())
          .filter((l) => l && !isReferenceString(l));
        if (commaLangs.length > 0) {
          result.languages.push(...commaLangs);
          result.languagesDisplay = 'bullets';
        }
      }
    } else if (currentSection === 'references' || isReferenceString(line)) {
      const cleanRef = line.replace(/^[*_#]+\s*/, '').replace(/[*_#]+$/, '').trim();
      if (cleanRef) {
        const cleaned = cleanReferencesText(cleanRef);
        if (cleaned) {
          referencesLines.push(cleaned);
        } else if (cleanRef && !cleanRef.toLowerCase().includes('reference') && !cleanRef.includes('המלצות')) {
          referencesLines.push(cleanRef);
        }
      }
    }
  }

  // Flush remaining
  if (currentExp) result.experience.push(currentExp);
  if (currentCert) result.certifications.push(currentCert);
  if (summaryLines.length > 0) result.summary = summaryLines.join('\n\n');
  if (referencesLines.length > 0) result.references = referencesLines.join(' ');

  return result;
}

export function exportToMarkdown(data: CVData, filename: string): void {
  const content = cvToMarkdown(data);
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const outName = filename.endsWith('.md') ? filename : `${filename}.md`;
  saveAs(blob, outName);
}
