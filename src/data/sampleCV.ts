import { CVData } from '@/types/cv';

export const sampleCVEn: CVData = {
  language: 'en',
  personalInfo: {
    fullName: 'Alex Morgan',
    phone: '+1-555-019-2834',
    email: 'alex.morgan@example.com',
    location: 'San Francisco, CA',
    linkedin: 'https://linkedin.com/in/alex-morgan-sample',
    github: 'https://github.com/alex-morgan-sample',
    website: 'https://alexmorgan.example.com',
  },
  summary:
    'Experienced Senior Software Engineer specializing in distributed systems, cloud architecture, and modern web applications. Proven track record of leading cross-functional engineering teams, architecting scalable microservices, and reducing infrastructure costs while maintaining 99.99% availability. Passionate about engineering excellence, automated CI/CD pipelines, and technical mentorship.',
  experience: [
    {
      id: 'exp-1',
      jobTitle: 'Lead Software Engineer',
      company: 'Acme Cloud Technologies',
      dateRange: '03/2022 – Present',
      bullets: [
        'Spearheaded the migration from monolithic backend to event-driven microservices architecture using Go, Kafka, and Kubernetes, improving throughput by 45%.',
        'Architected real-time streaming data ingestion pipeline processing over 100M events per day with sub-second p99 latency.',
        'Mentored a distributed team of 8 software engineers, introducing structured code reviews, automated integration testing, and trunk-based development.',
        'Optimized multi-region AWS cloud footprint, decreasing annual infrastructure spending by $180,000 without sacrificing SLA targets.',
      ],
    },
    {
      id: 'exp-2',
      jobTitle: 'Senior Full-Stack Developer',
      company: 'Nexus Systems',
      dateRange: '06/2018 – 02/2022',
      bullets: [
        'Designed and delivered high-traffic customer-facing web applications using React, TypeScript, and Node.js serving over 500,000 active monthly users.',
        'Implemented comprehensive end-to-end security improvements including OAuth2/OIDC authentication, role-based access control (RBAC), and automated vulnerability scanning.',
        'Collaborated closely with product managers and UX designers to reduce checkout workflow drop-off by 22% through performance optimization and usability enhancements.',
        'Established continuous integration and deployment (CI/CD) pipelines with GitHub Actions, reducing deployment cycle times from hours to minutes.',
      ],
    },
    {
      id: 'exp-3',
      jobTitle: 'Software Engineer',
      company: 'Vanguard Data Labs',
      dateRange: '09/2015 – 05/2018',
      bullets: [
        'Developed RESTful and GraphQL APIs powering internal analytics dashboards, reducing query latency by 35% through Redis caching and query indexing.',
        'Partnered with DevOps engineers to containerize legacy services with Docker, standardizing development and staging environments.',
        'Authored comprehensive technical documentation, unit tests, and integration test suites, elevating test coverage from 55% to 88%.',
      ],
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      title: 'B.Sc. in Computer Science',
      institution: 'State University of Technology',
      dateRange: '2011 – 2015',
      skills: ['Distributed Systems, Algorithms, Data Structures, Software Engineering'],
    },
    {
      id: 'cert-2',
      title: 'AWS Certified Solutions Architect – Professional',
      institution: 'Amazon Web Services',
      dateRange: '2023',
      skills: ['Cloud Architecture, VPC, IAM, ECS, Serverless, Cost Optimization'],
    },
  ],
  achievements: [
    {
      id: 'ach-1',
      text: 'Core Contributor: Open-Source Cloud Orchestrator (10k+ GitHub stars)',
      link: 'https://example.com/project-report',
      linkText: 'View Repository',
    },
    {
      id: 'ach-2',
      text: 'Speaker: International Cloud & Distributed Systems Summit 2023',
      link: 'https://example.com/conference-talk',
      linkText: 'Watch Session',
    },
    {
      id: 'ach-3',
      text: 'Patent: Distributed Consensus Optimization for Geo-Replicated Stores',
      link: 'https://example.com/patent',
      linkText: 'View Publication',
    },
  ],
  languages: ['English (Native)', 'Spanish (Conversational)'],
  languagesDisplay: 'bullets',
  references: 'Available upon request.',
};

export const sampleCVHe: CVData = {
  language: 'he',
  personalInfo: {
    fullName: 'אלכס לוי',
    phone: '050-1234567',
    email: 'alex.levi@example.com',
    location: 'תל אביב, ישראל',
    linkedin: 'https://linkedin.com/in/alex-levi-sample',
    github: 'https://github.com/alex-levi-sample',
    website: 'https://alexlevi.example.com',
  },
  summary:
    'מהנדס תוכנה בכיר ומוביל טכנולוגי בעל ניסיון עשיר בארכיטקטורת ענן, מערכות מבוזרות ופיתוח Full-Stack. רקורד מוכח בהובלת צוותי פיתוח, תכנון מיקרו-שירותים עתירי ביצועים וייעול עלויות תשתית תוך עמידה ב-99.99% זמינות. מומחיות בהטמעת מתודולוגיות CI/CD, אבטחת מידע ופיתוח מונחה איכות.',
  experience: [
    {
      id: 'exp-he-1',
      jobTitle: 'מהנדס תוכנה מוביל (Lead Software Engineer)',
      company: 'אקמי טכנולוגיות ענן (Acme Cloud Technologies)',
      dateRange: '03/2022 – הווה',
      bullets: [
        'הובלת מעבר מארכיטקטורת מונולית למערכת מיקרו-שירותים מבוזרת מבוססת Go, Kafka ו-Kubernetes, שהביאה לעלייה של 45% בתפוקת המערכת.',
        'תכנון מערכת הזרמת נתונים בזמן אמת המעבדת למעלה מ-100 מיליון אירועים ביום עם זמן תגובה נמוך משנייה (p99).',
        'חניכה והובלה מקצועית של צוות של 8 מהנדסי תוכנה, הטמעת סקירות קוד מובנות ובדיקות אינטגרציה אוטומטיות.',
        'ייעול תשתית הענן ב-AWS שהביא לחיסכון שנתי של כ-180,000 דולר בהוצאות תפעול ללא פגיעה ביעדי SLA.',
      ],
    },
    {
      id: 'exp-he-2',
      jobTitle: 'מפתח Full-Stack בכיר (Senior Full-Stack Developer)',
      company: 'נקסוס מערכות (Nexus Systems)',
      dateRange: '06/2018 – 02/2022',
      bullets: [
        'פיתוח מערכות ווב מורכבות עתירות תעבורה בטכנולוגיות React, TypeScript ו-Node.js המשרתות מעל 500,000 משתמשים חודשיים.',
        'יישום שיפורי אבטחה מקיפים כולל אימות OAuth2/OIDC, בקרת גישה מבוססת תפקידים (RBAC) וסריקות אבטחה אוטומטיות.',
        'עבודה צמודה עם מנהלי מוצר ומעצבי חוויית משתמש (UX) לשיפור ביצועי האפליקציה והעלאת אחוזי ההמרה ב-22%.',
        'הקמת תהליכי הפצה ואינטגרציה רציפה (CI/CD) באמצעות GitHub Actions, שקיצרו את זמני הפריסה משעות לדקות ספורות.',
      ],
    },
    {
      id: 'exp-he-3',
      jobTitle: 'מהנדס תוכנה (Software Engineer)',
      company: 'מעבדות ונגארד (Vanguard Data Labs)',
      dateRange: '09/2015 – 05/2018',
      bullets: [
        'פיתוח ממשקי RESTful ו-GraphQL עבור לוחות בקרה ואנליטיקה פנים-ארגוניים, תוך שיפור ביצועי שאילתות ב-35% באמצעות Redis ואינדוקס נתונים.',
        'שיתוף פעולה עם צוותי DevOps לקונטיינריזציה של שירותים באמצעות Docker ואחדור סביבות פיתוח ובדיקות.',
        'כתיבת תיעוד טכני מקיף, בדיקות יחידה (Unit Tests) ובדיקות אינטגרציה שהעלו את כיסוי הבדיקות מ-55% ל-88%.',
      ],
    },
  ],
  certifications: [
    {
      id: 'cert-he-1',
      title: 'תואר ראשון במדעי המחשב (B.Sc. in Computer Science)',
      institution: 'אוניברסיטת תל אביב',
      dateRange: '2011 – 2015',
      skills: ['מערכות מבוזרות, אלגוריתמים, מבני נתונים, הנדסת תוכנה'],
    },
    {
      id: 'cert-he-2',
      title: 'AWS Certified Solutions Architect – Professional',
      institution: 'Amazon Web Services',
      dateRange: '2023',
      skills: ['ארכיטקטורת ענן, VPC, IAM, ECS, Serverless, אופטימיזציית עלויות'],
    },
  ],
  achievements: [
    {
      id: 'ach-he-1',
      text: 'תורם ליבה לפרויקט קוד פתוח מוביל (10k+ כוכבים ב-GitHub)',
      link: 'https://example.com/project-report',
      linkText: 'צפייה במאגר',
    },
    {
      id: 'ach-he-2',
      text: 'מרצה בכנס בינלאומי למערכות מבוזרות וטכנולוגיות ענן 2023',
      link: 'https://example.com/conference-talk',
      linkText: 'צפייה בהרצאה',
    },
    {
      id: 'ach-he-3',
      text: 'רישום פטנט: אלגוריתם אופטימיזציה לקונצנזוס מבוזר במסדי נתונים גלובליים',
      link: 'https://example.com/patent',
      linkText: 'צפייה בפרסום',
    },
  ],
  languages: ['עברית (שפת אם)', 'אנגלית (רמה מקצועית)'],
  languagesDisplay: 'bullets',
  references: 'המלצות יימסרו לפי דרישה.',
};
