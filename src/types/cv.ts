export type Language = 'en' | 'he';

export interface PersonalInfo {
  fullName: string;
  phone: string;
  email: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface ExperienceItem {
  id: string;
  jobTitle: string;
  company: string;
  dateRange: string;
  bullets: string[];
}

export interface CertificationItem {
  id: string;
  title: string;
  institution: string;
  dateRange: string;
  skills: string[];
}

export interface AchievementItem {
  id: string;
  text: string;
  link: string;
  linkText: string;
}

export type SectionKey =
  | 'summary'
  | 'experience'
  | 'certifications'
  | 'achievements'
  | 'languages'
  | 'references';

export type SectionTitles = Partial<Record<SectionKey, string>>;

export interface CVData {
  language: Language;
  personalInfo: PersonalInfo;
  sectionTitles?: SectionTitles;
  summary: string;
  experience: ExperienceItem[];
  certifications: CertificationItem[];
  achievements: AchievementItem[];
  languages: string[];
  languagesDisplay?: 'bullets' | 'inline';
  references: string;
}

export const DEFAULT_SECTION_TITLES: Record<Language, Record<SectionKey, string>> = {
  en: {
    summary: 'Summary',
    experience: 'Experience',
    certifications: 'Training and Certifications:',
    achievements: 'Notable Achievements:',
    languages: 'Languages:',
    references: 'References:',
  },
  he: {
    summary: 'תקציר',
    experience: 'ניסיון תעסוקתי',
    certifications: 'השכלה והסמכות:',
    achievements: 'הישגים בולטים:',
    languages: 'שפות:',
    references: 'המלצות:',
  },
};

export const createEmptyCV = (language: Language = 'en'): CVData => ({
  language,
  personalInfo: {
    fullName: '',
    phone: '',
    email: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
  },
  sectionTitles: { ...DEFAULT_SECTION_TITLES[language] },
  summary: '',
  experience: [],
  certifications: [],
  achievements: [],
  languages: [],
  languagesDisplay: 'bullets',
  references: language === 'he' ? 'המלצות יימסרו לפי דרישה.' : 'Available upon request.',
});
