import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Markdown2CV | Professional CV Builder & Exporter',
  description:
    'Split-screen live CV builder with bilingual English/Hebrew support, auto-save, and multi-format export to DOCX, PDF, Markdown, and DOC.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-screen w-screen overflow-hidden antialiased bg-slate-100 text-slate-900 print:h-auto print:w-auto print:overflow-visible print:bg-white">
        {children}
      </body>
    </html>
  );
}
