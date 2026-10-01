import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ExternalHyperlink,
  AlignmentType,
  BorderStyle,
  LevelFormat,
  convertInchesToTwip,
} from 'docx';
import { saveAs } from 'file-saver';
import { CVData, SectionKey } from '@/types/cv';
import { translations } from '@/lib/i18n';
import { cleanReferencesText, isReferenceString } from '@/lib/exportMarkdown';

const FONT_NAME = 'Calibri';
const COLOR_HEADINGS = '1F4E79';
const COLOR_TEXT = '000000';
const COLOR_HYPERLINK = '0000FF';
const COLOR_BORDER = 'A9A9A9';

export function buildDocxDocument(data: CVData): Document {
  const isRtl = data.language === 'he';
  const t = translations[data.language];
  const alignDefault = isRtl ? AlignmentType.RIGHT : AlignmentType.LEFT;
  const getHeading = (key: SectionKey) => data.sectionTitles?.[key]?.trim() || t.headings[key];

  // Divider paragraph matching cv.ipynb add_hr
  const createDivider = () =>
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      border: {
        bottom: {
          color: COLOR_BORDER,
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      children: [],
    });

  // Heading paragraph matching cv.ipynb add_heading: 12pt bold, before: 6pt (120 twips), after: 3pt (60 twips)
  const createHeading = (text: string) =>
    new Paragraph({
      alignment: alignDefault,
      bidirectional: isRtl,
      spacing: { before: 120, after: 60 },
      children: [
        new TextRun({
          text,
          bold: true,
          font: FONT_NAME,
          size: 24, // 12pt
          color: COLOR_HEADINGS,
        }),
      ],
    });

  const children: Paragraph[] = [];

  // 1. Header (Name & Contact) matching cv.ipynb: Title 14pt bold, after: 3pt (60 twips)
  if (data.personalInfo.fullName) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        bidirectional: isRtl,
        spacing: { before: 0, after: 60 },
        children: [
          new TextRun({
            text: data.personalInfo.fullName,
            bold: true,
            font: FONT_NAME,
            size: 28, // 14pt
            color: COLOR_TEXT,
          }),
        ],
      })
    );
  }

  // Centered Contact line: 10pt (20 half-points)
  const contactRuns: (TextRun | ExternalHyperlink)[] = [];
  if (data.personalInfo.phone) {
    const formattedPhone =
      isRtl && data.personalInfo.phone.trim().startsWith('+')
        ? `\u200E${data.personalInfo.phone.trim()}`
        : data.personalInfo.phone;
    contactRuns.push(
      new TextRun({
        text: `${t.labels.phone} `,
        font: FONT_NAME,
        size: 20,
        color: COLOR_TEXT,
      })
    );
    contactRuns.push(
      new ExternalHyperlink({
        children: [
          new TextRun({
            text: formattedPhone,
            style: 'Hyperlink',
            font: FONT_NAME,
            size: 20,
            color: COLOR_HYPERLINK,
            underline: {},
          }),
        ],
        link: `tel:${data.personalInfo.phone}`,
      })
    );
  }

  if (data.personalInfo.email) {
    if (contactRuns.length > 0) {
      contactRuns.push(new TextRun({ text: '\t', font: FONT_NAME, size: 20, color: COLOR_TEXT }));
    }
    contactRuns.push(
      new TextRun({
        text: `${t.labels.email} `,
        font: FONT_NAME,
        size: 20,
        color: COLOR_TEXT,
      })
    );
    contactRuns.push(
      new ExternalHyperlink({
        children: [
          new TextRun({
            text: data.personalInfo.email,
            style: 'Hyperlink',
            font: FONT_NAME,
            size: 20,
            color: COLOR_HYPERLINK,
            underline: {},
          }),
        ],
        link: `mailto:${data.personalInfo.email}`,
      })
    );
  }

  if (data.personalInfo.location) {
    if (contactRuns.length > 0) {
      contactRuns.push(new TextRun({ text: '\t', font: FONT_NAME, size: 20, color: COLOR_TEXT }));
    }
    contactRuns.push(
      new TextRun({
        text: `${t.labels.location} ${data.personalInfo.location}`,
        font: FONT_NAME,
        size: 20,
        color: COLOR_TEXT,
      })
    );
  }

  if (data.personalInfo.linkedin) {
    if (contactRuns.length > 0) {
      contactRuns.push(new TextRun({ text: '\t', font: FONT_NAME, size: 20, color: COLOR_TEXT }));
    }
    contactRuns.push(
      new ExternalHyperlink({
        children: [
          new TextRun({
            text: 'LinkedIn',
            style: 'Hyperlink',
            font: FONT_NAME,
            size: 20,
            color: COLOR_HYPERLINK,
            underline: {},
          }),
        ],
        link: data.personalInfo.linkedin,
      })
    );
  }

  if (data.personalInfo.github) {
    if (contactRuns.length > 0) {
      contactRuns.push(new TextRun({ text: '\t', font: FONT_NAME, size: 20, color: COLOR_TEXT }));
    }
    contactRuns.push(
      new ExternalHyperlink({
        children: [
          new TextRun({
            text: 'GitHub',
            style: 'Hyperlink',
            font: FONT_NAME,
            size: 20,
            color: COLOR_HYPERLINK,
            underline: {},
          }),
        ],
        link: data.personalInfo.github,
      })
    );
  }

  if (data.personalInfo.website) {
    if (contactRuns.length > 0) {
      contactRuns.push(new TextRun({ text: '\t', font: FONT_NAME, size: 20, color: COLOR_TEXT }));
    }
    contactRuns.push(
      new ExternalHyperlink({
        children: [
          new TextRun({
            text: t.labels.website.replace(':', '').trim() || 'Website',
            style: 'Hyperlink',
            font: FONT_NAME,
            size: 20,
            color: COLOR_HYPERLINK,
            underline: {},
          }),
        ],
        link: data.personalInfo.website,
      })
    );
  }

  if (contactRuns.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        bidirectional: isRtl,
        spacing: { before: 0, after: 0 },
        children: contactRuns,
      })
    );
    children.push(createDivider());
  }

  // 2. Summary matching cv.ipynb: Heading, text 10pt, divider
  if (data.summary.trim()) {
    children.push(createHeading(getHeading('summary')));
    children.push(
      new Paragraph({
        alignment: alignDefault,
        bidirectional: isRtl,
        spacing: { before: 0, after: 0 },
        children: [
          new TextRun({
            text: data.summary,
            font: FONT_NAME,
            size: 20,
            color: COLOR_TEXT,
          }),
        ],
      })
    );
    children.push(createDivider());
  }

  // 3. Experience matching cv.ipynb: Job title 11pt bold (before 6pt, after 0), Company/date 10pt italic (before 0, after 3pt), Bullets 10pt (before 0, after 0)
  if (data.experience.length > 0) {
    children.push(createHeading(getHeading('experience')));
    data.experience.forEach((item) => {
      if (item.jobTitle) {
        children.push(
          new Paragraph({
            alignment: alignDefault,
            bidirectional: isRtl,
            spacing: { before: 120, after: 0 },
            children: [
              new TextRun({
                text: item.jobTitle,
                bold: true,
                font: FONT_NAME,
                size: 22, // 11pt
                color: COLOR_TEXT,
              }),
            ],
          })
        );
      }

      if (item.company || item.dateRange) {
        const compDate = [item.company, item.dateRange].filter(Boolean).join(' | ');
        children.push(
          new Paragraph({
            alignment: alignDefault,
            bidirectional: isRtl,
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({
                text: compDate,
                italics: true,
                font: FONT_NAME,
                size: 20, // 10pt
                color: COLOR_TEXT,
              }),
            ],
          })
        );
      }

      item.bullets.forEach((bullet) => {
        if (bullet.trim()) {
          children.push(
            new Paragraph({
              numbering: { reference: 'cv-bullet', level: 0 },
              alignment: alignDefault,
              bidirectional: isRtl,
              spacing: { before: 0, after: 0 },
              children: [
                new TextRun({
                  text: bullet.trim(),
                  font: FONT_NAME,
                  size: 20, // 10pt
                  color: COLOR_TEXT,
                }),
              ],
            })
          );
        }
      });

      children.push(createDivider());
    });
  }

  // 4. Certifications / Education
  if (data.certifications.length > 0) {
    children.push(createHeading(getHeading('certifications')));
    data.certifications.forEach((cert) => {
      if (cert.title) {
        children.push(
          new Paragraph({
            alignment: alignDefault,
            bidirectional: isRtl,
            spacing: { before: 120, after: 0 },
            children: [
              new TextRun({
                text: cert.title,
                bold: true,
                font: FONT_NAME,
                size: 22,
                color: COLOR_TEXT,
              }),
            ],
          })
        );
      }

      if (cert.institution || cert.dateRange) {
        const instDate = [cert.institution, cert.dateRange].filter(Boolean).join(' | ');
        children.push(
          new Paragraph({
            alignment: alignDefault,
            bidirectional: isRtl,
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({
                text: instDate,
                italics: true,
                font: FONT_NAME,
                size: 20,
                color: COLOR_TEXT,
              }),
            ],
          })
        );
      }

      cert.skills.forEach((skill) => {
        if (skill.trim()) {
          children.push(
            new Paragraph({
              numbering: { reference: 'cv-bullet', level: 0 },
              alignment: alignDefault,
              bidirectional: isRtl,
              spacing: { before: 0, after: 0 },
              children: [
                new TextRun({
                  text: skill.trim(),
                  font: FONT_NAME,
                  size: 20,
                  color: COLOR_TEXT,
                }),
              ],
            })
          );
        }
      });

      children.push(createDivider());
    });
  }

  // 5. Notable Achievements
  if (data.achievements.length > 0) {
    children.push(createHeading(getHeading('achievements')));
    data.achievements.forEach((ach) => {
      const achRuns: (TextRun | ExternalHyperlink)[] = [
        new TextRun({
          text: ach.text ? `${ach.text} ` : '',
          font: FONT_NAME,
          size: 20,
          color: COLOR_TEXT,
        }),
      ];

      if (ach.link) {
        achRuns.push(
          new ExternalHyperlink({
            children: [
              new TextRun({
                text: ach.linkText || 'Link',
                style: 'Hyperlink',
                font: FONT_NAME,
                size: 20,
                color: COLOR_HYPERLINK,
                underline: {},
              }),
            ],
            link: ach.link,
          })
        );
      }

      children.push(
        new Paragraph({
          numbering: { reference: 'cv-bullet', level: 0 },
          alignment: alignDefault,
          bidirectional: isRtl,
          spacing: { before: 0, after: 0 },
          children: achRuns,
        })
      );
    });
    children.push(createDivider());
  }

  // 6. Languages (strictly excluding reference strings)
  const cleanLangs = data.languages.filter(
    (l) => l.trim() && !isReferenceString(l)
  );
  if (cleanLangs.length > 0) {
    children.push(createHeading(getHeading('languages')));
    cleanLangs.forEach((lang) => {
      children.push(
        new Paragraph({
          numbering: { reference: 'cv-bullet', level: 0 },
          alignment: alignDefault,
          bidirectional: isRtl,
          spacing: { before: 0, after: 0 },
          children: [
            new TextRun({
              text: lang.trim(),
              font: FONT_NAME,
              size: 20,
              color: COLOR_TEXT,
            }),
          ],
        })
      );
    });
    children.push(createDivider());
  }

  // 7. References matching cv.ipynb: single paragraph with italics
  if (data.references && data.references.trim()) {
    const cleanRef = cleanReferencesText(data.references) || data.references.trim();
    const refLines = cleanRef.split('\n').map((l) => l.trim()).filter(Boolean);
    children.push(
      new Paragraph({
        alignment: alignDefault,
        bidirectional: isRtl,
        spacing: { before: 0, after: 0 },
        children: [
          new TextRun({
            text: getHeading('references'),
            italics: true,
            font: FONT_NAME,
            size: 20,
            color: COLOR_TEXT,
          }),
          ...refLines.map(
            (line) =>
              new TextRun({
                text: line,
                break: 1,
                italics: true,
                font: FONT_NAME,
                size: 20,
                color: COLOR_TEXT,
              })
          ),
        ],
      })
    );
  }

  return new Document({
    numbering: {
      config: [
        {
          reference: 'cv-bullet',
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: '\uF0B7',
              alignment: alignDefault,
              style: {
                paragraph: {
                  indent: { left: 360, hanging: 360 },
                },
                run: {
                  font: 'Symbol',
                },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: convertInchesToTwip(8.5),
              height: convertInchesToTwip(11.0),
            },
            margin: {
              top: convertInchesToTwip(0.5),
              bottom: convertInchesToTwip(0.5),
              left: convertInchesToTwip(1.0),
              right: convertInchesToTwip(1.0),
            },
          },
        },
        children,
      },
    ],
  });
}

export async function generateDocxBlob(data: CVData): Promise<Blob> {
  const doc = buildDocxDocument(data);
  return await Packer.toBlob(doc);
}

export async function generateDocxBuffer(data: CVData): Promise<Buffer> {
  const doc = buildDocxDocument(data);
  return await Packer.toBuffer(doc);
}

export async function exportToDocx(data: CVData, filename: string): Promise<void> {
  const blob = await generateDocxBlob(data);
  const outName = filename.endsWith('.docx') ? filename : `${filename}.docx`;
  saveAs(blob, outName);
}
