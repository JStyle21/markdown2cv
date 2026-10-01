import { saveAs } from 'file-saver';
import { CVData, SectionKey } from '@/types/cv';
import { translations } from '@/lib/i18n';
import { cleanReferencesText, isReferenceString } from '@/lib/exportMarkdown';

export function exportToDoc(data: CVData, filename: string): void {
  const isRtl = data.language === 'he';
  const t = translations[data.language];
  const dir = isRtl ? 'rtl' : 'ltr';
  const textAlign = isRtl ? 'right' : 'left';
  const getHeading = (key: SectionKey) => data.sectionTitles?.[key]?.trim() || t.headings[key];

  const contactParts: string[] = [];
  if (data.personalInfo.phone) {
    const formattedPhone =
      isRtl && data.personalInfo.phone.trim().startsWith('+')
        ? `\u200E${data.personalInfo.phone.trim()}`
        : data.personalInfo.phone;
    contactParts.push(
      `${t.labels.phone} <a href="tel:${data.personalInfo.phone}" dir="ltr" style="unicode-bidi: isolate;">${formattedPhone}</a>`
    );
  }
  if (data.personalInfo.email) {
    contactParts.push(
      `${t.labels.email} <a href="mailto:${data.personalInfo.email}" dir="ltr" style="unicode-bidi: isolate;">${data.personalInfo.email}</a>`
    );
  }
  if (data.personalInfo.location) {
    contactParts.push(`${t.labels.location} ${data.personalInfo.location}`);
  }
  if (data.personalInfo.linkedin) {
    contactParts.push(`<a href="${data.personalInfo.linkedin}">LinkedIn</a>`);
  }
  if (data.personalInfo.github) {
    contactParts.push(`<a href="${data.personalInfo.github}">GitHub</a>`);
  }
  if (data.personalInfo.website) {
    contactParts.push(`<a href="${data.personalInfo.website}">${t.labels.website.replace(':', '').trim() || 'Website'}</a>`);
  }

  const cleanLangs = data.languages.map((l) => l.trim()).filter((l) => l && !isReferenceString(l));

  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${data.personalInfo.fullName || 'CV'}</title>
  <style>
    @page Section1 {
      size: 8.5in 11.0in;
      margin: 0.5in 1.0in 0.5in 1.0in;
      mso-header-margin: 0.5in;
      mso-footer-margin: 0.5in;
      mso-paper-source: 0;
    }
    div.Section1 { page: Section1; }
    body {
      font-family: 'Calibri', 'Carlito', sans-serif;
      font-size: 10pt;
      color: #000000;
      direction: ${dir};
      text-align: ${textAlign};
      line-height: 1.3;
    }
    h1 {
      font-size: 14pt;
      font-weight: bold;
      text-align: center;
      margin: 0 0 3pt 0;
    }
    .contact {
      text-align: center;
      font-size: 10pt;
      margin-bottom: 0;
    }
    .heading {
      font-size: 12pt;
      font-weight: bold;
      color: #1F4E79;
      margin-top: 6pt;
      margin-bottom: 3pt;
    }
    .subheading {
      font-size: 11pt;
      font-weight: bold;
      color: #000000;
      margin-top: 6pt;
      margin-bottom: 0;
    }
    .meta {
      font-size: 10pt;
      font-style: italic;
      color: #000000;
      margin-top: 0;
      margin-bottom: 3pt;
    }
    hr {
      border: 0;
      border-bottom: 1px solid #A9A9A9;
      margin: 3pt 0 3pt 0;
    }
    ul {
      margin-top: 0;
      margin-bottom: 0;
      padding-${isRtl ? 'right' : 'left'}: 20px;
    }
    li {
      margin-bottom: 0;
      line-height: 1.3;
    }
    a {
      color: #0000FF;
      text-decoration: underline;
    }
    .references {
      font-style: italic;
      font-size: 10pt;
      margin-top: 6pt;
    }
  </style>
</head>
<body>
<div class="Section1">
  ${
    data.personalInfo.fullName
      ? `<h1>${data.personalInfo.fullName}</h1>`
      : ''
  }

  ${
    contactParts.length > 0
      ? `<div class="contact">
          ${contactParts.join(' &nbsp;&nbsp;&nbsp; ')}
        </div>
        <hr/>`
      : ''
  }

  ${
    data.summary.trim()
      ? `<div class="heading">${getHeading('summary')}</div>
         <p style="margin: 0;">${data.summary}</p>
         <hr/>`
      : ''
  }

  ${
    data.experience.length > 0
      ? `<div class="heading">${getHeading('experience')}</div>
         ${data.experience
           .map(
             (exp) => `
           ${exp.jobTitle ? `<div class="subheading">${exp.jobTitle}</div>` : ''}
           ${exp.company || exp.dateRange ? `<div class="meta">${[exp.company, exp.dateRange].filter(Boolean).join(' | ')}</div>` : ''}
           ${
             exp.bullets.filter((b) => b.trim()).length > 0
               ? `<ul>
                   ${exp.bullets
                     .filter((b) => b.trim())
                     .map((b) => `<li>${b}</li>`)
                     .join('')}
                 </ul>`
               : ''
           }
           <hr/>`
           )
           .join('')}`
      : ''
  }

  ${
    data.certifications.length > 0
      ? `<div class="heading">${getHeading('certifications')}</div>
         ${data.certifications
           .map(
             (cert) => `
           ${cert.title ? `<div class="subheading">${cert.title}</div>` : ''}
           ${cert.institution || cert.dateRange ? `<div class="meta">${[cert.institution, cert.dateRange].filter(Boolean).join(' | ')}</div>` : ''}
           ${
             cert.skills.filter((s) => s.trim()).length > 0
               ? `<ul>
                   ${cert.skills
                     .filter((s) => s.trim())
                     .map((s) => `<li>${s}</li>`)
                     .join('')}
                 </ul>`
               : ''
           }
           <hr/>`
           )
           .join('')}`
      : ''
  }

  ${
    data.achievements.length > 0
      ? `<div class="heading">${getHeading('achievements')}</div>
         <ul>
           ${data.achievements
             .map(
               (ach) =>
                 `<li>${ach.text} ${
                   ach.link
                     ? `<a href="${ach.link}">${ach.linkText || 'Link'}</a>`
                     : ''
                 }</li>`
             )
             .join('')}
         </ul>
         <hr/>`
      : ''
  }

  ${
    cleanLangs.length > 0
      ? `<div class="heading">${getHeading('languages')}</div>
         <ul>
           ${cleanLangs.map((l) => `<li>${l}</li>`).join('')}
         </ul>
         <hr/>`
      : ''
  }

  ${
    data.references && data.references.trim()
      ? `<div class="references">${getHeading('references')}<br/>${(cleanReferencesText(data.references) || data.references.trim()).replace(/\n/g, '<br/>')}</div>`
      : ''
  }
</div>
</body>
</html>
`;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const outName = filename.endsWith('.doc') ? filename : `${filename}.doc`;
  saveAs(blob, outName);
}
