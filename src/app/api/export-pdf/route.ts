import { NextRequest, NextResponse } from 'next/server';
import { generateDocxBuffer } from '@/lib/exportDocx';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { CVData } from '@/types/cv';

const execFileAsync = promisify(execFile);

export async function POST(req: NextRequest) {
  let tmpDir = '';
  try {
    const body = await req.json();
    const cvData: CVData = body.data;
    const requestedName = (body.filename || 'CV.pdf').trim();
    const pdfFilename = requestedName.endsWith('.pdf') ? requestedName : `${requestedName}.pdf`;

    if (!cvData) {
      return NextResponse.json({ error: 'Missing cvData' }, { status: 400 });
    }

    const docxBuffer = await generateDocxBuffer(cvData);
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cv-pdf-'));
    const docxPath = path.join(tmpDir, 'document.docx');
    await fs.writeFile(docxPath, docxBuffer);

    // Isolated LibreOffice user profile to eliminate lock conflicts and parallel execution issues
    const profileDir = path.join(tmpDir, 'profile');
    await fs.mkdir(profileDir, { recursive: true });

    // Execute LibreOffice headless conversion to PDF (vector text)
    await execFileAsync(
      'libreoffice',
      [
        `-env:UserInstallation=file://${profileDir}`,
        '--headless',
        '--convert-to',
        'pdf',
        '--outdir',
        tmpDir,
        docxPath,
      ],
      { timeout: 30000 }
    );

    const generatedPdfPath = path.join(tmpDir, 'document.pdf');
    const pdfBuffer = await fs.readFile(generatedPdfPath);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(pdfFilename)}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Server PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF via LibreOffice', details: String(error) },
      { status: 500 }
    );
  } finally {
    if (tmpDir) {
      try {
        await fs.rm(tmpDir, { recursive: true, force: true });
      } catch (cleanupErr) {
        console.warn('Failed to clean up temporary directory:', cleanupErr);
      }
    }
  }
}
