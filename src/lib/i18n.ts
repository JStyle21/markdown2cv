import { Language } from '@/types/cv';

export interface Translations {
  headings: {
    summary: string;
    experience: string;
    certifications: string;
    achievements: string;
    languages: string;
    references: string;
  };
  labels: {
    phone: string;
    email: string;
    location: string;
    linkedin: string;
    github: string;
    website: string;
    present: string;
    availableUponRequest: string;
  };
  placeholders: {
    fullName: string;
    phone: string;
    email: string;
    location: string;
    linkedin: string;
    github: string;
    website: string;
    summary: string;
    jobTitle: string;
    company: string;
    dateRange: string;
    bulletPoint: string;
    certTitle: string;
    institution: string;
    certDateRange: string;
    skills: string;
    achievementText: string;
    linkUrl: string;
    linkTitle: string;
    languages: string;
    references: string;
    filename: string;
  };
  ui: {
    title: string;
    subtitle: string;
    formMode: string;
    markdownMode: string;
    personalDetails: string;
    fullName: string;
    addExperience: string;
    addCertification: string;
    addAchievement: string;
    addLanguage: string;
    addReference: string;
    jobTitle: string;
    company: string;
    dateRange: string;
    bulletPoint: string;
    addBullet: string;
    institution: string;
    skills: string;
    achievementText: string;
    linkUrl: string;
    linkTitle: string;
    export: string;
    exportModalTitle: string;
    exportModalDesc: string;
    selectFormats: string;
    formatDocx: string;
    formatPdf: string;
    formatMarkdown: string;
    formatJson: string;
    formatDoc: string;
    filename: string;
    downloadSelected: string;
    downloading: string;
    clear: string;
    clearConfirm: string;
    loadTemplate: string;
    importJson: string;
    importJsonTitle: string;
    invalidJson: string;
    failedParseJson: string;
    invalidFormat: string;
    print: string;
    printTitle: string;
    copy: string;
    copied: string;
    cancel: string;
    bulletPoints: string;
    noExperienceYet: string;
    exportSuccess: string;
    saveNow: string;
    savedJustNow: string;
    savedAt: string;
    autoSavedAt: string;
    saving: string;
    unsavedChanges: string;
    autoSaveNotice: string;
    preview: string;
    emptyPreviewNotice: string;
    remove: string;
    customSectionTitle: string;
    sectionTitlePlaceholder: string;
    languageItemPlaceholder: string;
    selectTemplate: string;
    loadSampleEn: string;
    loadSampleHe: string;
    pressEnterToAdd: string;
  };
  validation: {
    invalidEmail: string;
    invalidPhone: string;
    invalidUrl: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    headings: {
      summary: 'Summary',
      experience: 'Experience',
      certifications: 'Training and Certifications:',
      achievements: 'Notable Achievements:',
      languages: 'Languages:',
      references: 'References:',
    },
    labels: {
      phone: 'Phone:',
      email: 'Email:',
      location: 'Location:',
      linkedin: 'LinkedIn:',
      github: 'GitHub:',
      website: 'Website:',
      present: 'Present',
      availableUponRequest: 'Available upon request.',
    },
    placeholders: {
      fullName: 'First Last',
      phone: '+1-555-019-2834',
      email: 'your.email@example.com',
      location: 'City, Country',
      linkedin: 'https://linkedin.com/in/username',
      github: 'https://github.com/username',
      website: 'https://example.com',
      summary: 'Brief 3-4 sentence overview of your career, core specializations, and key achievements...',
      jobTitle: 'Senior Software Engineer',
      company: 'Acme Cloud Technologies',
      dateRange: '03/2022 – Present',
      bulletPoint: 'Responsibility or achievement bullet...',
      certTitle: 'B.Sc. in Computer Science',
      institution: 'State University of Technology',
      certDateRange: '2015 – 2019',
      skills: 'Distributed Systems, Cloud Architecture, Algorithms',
      achievementText: 'Contributor to open source project (5k+ stars)',
      linkUrl: 'https://example.com',
      linkTitle: 'View Link',
      languages: 'English (Native), Spanish (Conversational)',
      references: 'Available upon request.',
      filename: 'My_Resume_CV',
    },
    ui: {
      title: 'Markdown2CV',
      subtitle: 'Build & Preview your professional CV in real-time, export to multiple formats',
      formMode: 'Form Editor',
      markdownMode: 'Raw Markdown',
      personalDetails: 'Personal Information',
      fullName: 'Full Name',
      addExperience: 'Add Experience',
      addCertification: 'Add Education / Certification',
      addAchievement: 'Add Achievement',
      addLanguage: 'Add Language',
      addReference: 'Add Reference',
      jobTitle: 'Job Title',
      company: 'Company / Organization',
      dateRange: 'Dates (e.g. 04/2023 – Present)',
      bulletPoint: 'Responsibility or achievement bullet...',
      addBullet: 'Add Bullet',
      institution: 'Institution / College',
      skills: 'Skills / Focus areas (comma separated)',
      achievementText: 'Achievement / Award description',
      linkUrl: 'https://example.com',
      linkTitle: 'Link Label (e.g. Read Report)',
      export: 'Export CV',
      exportModalTitle: 'Export Document',
      exportModalDesc: 'Select the file formats you want to generate and download:',
      selectFormats: 'Select Formats',
      formatDocx: 'Word Document (.docx)',
      formatPdf: 'Printable Document (.pdf)',
      formatMarkdown: 'Markdown (.md)',
      formatJson: 'JSON Data (.json)',
      formatDoc: 'Legacy Word (.doc)',
      filename: 'File Name',
      downloadSelected: 'Download Selected',
      downloading: 'Generating Files...',
      clear: 'Clear Form',
      clearConfirm: 'Are you sure you want to clear all data? This cannot be undone.',
      loadTemplate: 'Load Sample Template',
      importJson: 'Import (MD / JSON)',
      importJsonTitle: 'Import CV from Markdown (.md) or JSON (.json)',
      invalidJson: 'Invalid CV JSON file structure.',
      failedParseJson: 'Failed to parse file.',
      invalidFormat: 'Unsupported or invalid file format. Please upload a Markdown (.md) or JSON (.json) file.',
      print: 'Print',
      printTitle: 'Direct Browser Print / Save as PDF',
      copy: 'Copy',
      copied: 'Copied',
      cancel: 'Cancel',
      bulletPoints: 'Bullet Points',
      noExperienceYet: 'No experience entries yet. Click "Add Experience" to add your first job.',
      exportSuccess: 'Export initiated successfully!',
      saveNow: 'Save Now',
      savedJustNow: 'Saved just now',
      savedAt: 'Saved at',
      autoSavedAt: 'Saved at',
      saving: 'Saving...',
      unsavedChanges: 'Unsaved edits',
      autoSaveNotice: 'Auto-saves every 1 minute to local storage',
      preview: 'Live Preview',
      emptyPreviewNotice: 'Start filling out the form on the left to see your CV rendered here in real-time.',
      remove: 'Remove',
      customSectionTitle: 'Section Heading',
      sectionTitlePlaceholder: 'Default: ',
      languageItemPlaceholder: 'e.g. English (Native)',
      selectTemplate: 'Choose Sample Template',
      loadSampleEn: 'English Template (Software Engineer)',
      loadSampleHe: 'Hebrew Template (Software Engineer)',
      pressEnterToAdd: 'Press Enter to add another',
    },
    validation: {
      invalidEmail: 'Please enter a valid email address',
      invalidPhone: 'Please enter a valid phone number (7–15 digits)',
      invalidUrl: 'Please enter a valid URL (e.g. https://... or domain.com)',
    },
  },
  he: {
    headings: {
      summary: 'תקציר',
      experience: 'ניסיון תעסוקתי',
      certifications: 'השכלה והסמכות:',
      achievements: 'הישגים בולטים:',
      languages: 'שפות:',
      references: 'המלצות:',
    },
    labels: {
      phone: 'טלפון:',
      email: 'אימייל:',
      location: 'מיקום:',
      linkedin: 'לינקדאין:',
      github: 'גיטהאב:',
      website: 'אתר:',
      present: 'הווה',
      availableUponRequest: 'המלצות יימסרו לפי דרישה.',
    },
    placeholders: {
      fullName: 'ישראל ישראלי',
      phone: '050-1234567',
      email: 'israel.israeli@example.com',
      location: 'תל אביב, ישראל',
      linkedin: 'https://linkedin.com/in/username',
      github: 'https://github.com/username',
      website: 'https://example.com',
      summary: 'תקציר מקצועי על הרקע שלך, מומחיות מרכזית והישגים בולטים...',
      jobTitle: 'מהנדס/ת תוכנה בכיר/ה',
      company: 'אקמי טכנולוגיות בע״מ',
      dateRange: '03/2022 – הווה',
      bulletPoint: 'פירוט אחריות, משימות או הישגים...',
      certTitle: 'תואר ראשון במדעי המחשב (.B.Sc)',
      institution: 'האוניברסיטה הפתוחה / מכללה אקדמית',
      certDateRange: '2015 – 2019',
      skills: 'מבני נתונים, אלגוריתמים, ארכיטקטורת ענן',
      achievementText: 'תרומה לפרויקט קוד פתוח מוביל (5,000+ כוכבים ב-GitHub)',
      linkUrl: 'https://example.com',
      linkTitle: 'קישור לפרויקט',
      languages: 'עברית (שפת אם), אנגלית (ברמה גבוהה)',
      references: 'המלצות יימסרו לפי דרישה.',
      filename: 'קורות_חיים_ישראל_ישראלי',
    },
    ui: {
      title: 'Markdown2CV',
      subtitle: 'יצירה ותצוגה מקדימה של קורות חיים בזמן אמת, וייצוא למגוון פורמטים',
      formMode: 'עורך שדות',
      markdownMode: 'Markdown',
      personalDetails: 'פרטים אישיים',
      fullName: 'שם מלא',
      addExperience: 'הוספת ניסיון תעסוקתי',
      addCertification: 'הוספת השכלה / תעודה',
      addAchievement: 'הוספת הישג בולט',
      addLanguage: 'הוספת שפה',
      addReference: 'הוספת המלצה',
      jobTitle: 'תפקיד',
      company: 'חברה / ארגון',
      dateRange: 'תקופה (למשל: 04/2023 – הווה)',
      bulletPoint: 'פירוט אחריות או הישג...',
      addBullet: 'הוספת נקודה',
      institution: 'מוסד לימודים / מכללה',
      skills: 'מיומנויות ונושאים עיקריים',
      achievementText: 'תיאור הישג / פרסום',
      linkUrl: 'https://example.com',
      linkTitle: 'טקסט לקישור (למשל: צפייה בדוח)',
      export: 'ייצוא קו״ח',
      exportModalTitle: 'ייצוא מסמך',
      exportModalDesc: 'בחר/י את הפורמטים הרצויים להורדה:',
      selectFormats: 'בחירת פורמטים',
      formatDocx: 'מסמך Word (.docx)',
      formatPdf: 'מסמך להדפסה (.pdf)',
      formatMarkdown: 'Markdown (.md)',
      formatJson: 'נתוני JSON (.json)',
      formatDoc: 'מסמך Word ישן (.doc)',
      filename: 'שם הקובץ',
      downloadSelected: 'הורדת הקבצים שנבחרו',
      downloading: 'מייצר קבצים...',
      clear: 'איפוס טופס',
      clearConfirm: 'האם את/ה בטוח/ה שברצונך לנקות את כל הנתונים? פעולה זו אינה ניתנת לביטול.',
      loadTemplate: 'טעינת דוגמה',
      importJson: 'ייבוא (MD / JSON)',
      importJsonTitle: 'ייבוא קורות חיים מקובץ Markdown (.md) או JSON (.json)',
      invalidJson: 'מבנה קובץ ה-JSON אינו תקין.',
      failedParseJson: 'שגיאה בקריאת הקובץ.',
      invalidFormat: 'פורמט קובץ לא נתמך או לא תקין. יש להעלות קובץ Markdown (.md) או JSON (.json).',
      print: 'הדפסה',
      printTitle: 'הדפסה ישירה / שמירה כ-PDF',
      copy: 'העתק',
      copied: 'הועתק',
      cancel: 'ביטול',
      bulletPoints: 'נקודות פירוט',
      noExperienceYet: 'טרם נוסף ניסיון תעסוקתי. לחץ/י על "הוספת ניסיון תעסוקתי" כדי להוסיף.',
      exportSuccess: 'הייצוא הושלם בהצלחה!',
      saveNow: 'שמור כעת',
      savedJustNow: 'נשמר זה עתה',
      savedAt: 'נשמר ב-',
      autoSavedAt: 'נשמר ב-',
      saving: 'שומר...',
      unsavedChanges: 'שינויים לא שמורים',
      autoSaveNotice: 'שמירה אוטומטית כל דקה בדפדפן',
      preview: 'תצוגה מקדימה',
      emptyPreviewNotice: 'התחל/י למלא את הטופס בצד כדי לראות את קורות החיים בזמן אמת.',
      remove: 'הסרה',
      customSectionTitle: 'כותרת',
      sectionTitlePlaceholder: 'ברירת מחדל: ',
      languageItemPlaceholder: 'למשל: עברית (שפת אם)',
      selectTemplate: 'בחירת תבנית דוגמה',
      loadSampleEn: 'תבנית באנגלית (מהנדס/ת תוכנה)',
      loadSampleHe: 'תבנית בעברית (מהנדס/ת תוכנה)',
      pressEnterToAdd: 'הקש/י על Enter להוספת שורה',
    },
    validation: {
      invalidEmail: 'יש להזין כתובת אימייל תקינה',
      invalidPhone: 'יש להזין מספר טלפון תקין (7–15 ספרות)',
      invalidUrl: 'יש להזין כתובת אינטרנט תקינה (למשל https://... או domain.com)',
    },
  },
};
