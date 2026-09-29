import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { PoseTemplate } from '../types';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
}

export interface ExtractionProgress {
  current: number;
  total: number;
  status: string;
}

/**
 * Extracts each page from a PDF file as an individual high-resolution pose image,
 * keeping the original image unchanged, without combining them, and returning them
 * as Standing 01 through Standing 25 templates.
 */
export async function extractStandingPosesFromPDF(
  file: File | ArrayBuffer,
  onProgress?: (progress: ExtractionProgress) => void
): Promise<PoseTemplate[]> {
  const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file;
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist/cmaps/',
    cMapPacked: true,
  });

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const poses: PoseTemplate[] = [];

  const totalToExtract = Math.max(numPages, 1);

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    onProgress?.({
      current: pageNum,
      total: totalToExtract,
      status: `Extracting Standing pose ${String(pageNum).padStart(2, '0')} of ${totalToExtract}...`,
    });

    const page = await pdf.getPage(pageNum);
    // Render at 2x scale for sharp overlay lines on retina screens
    const viewport = page.getViewport({ scale: 2.0 });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) continue;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport,
      canvas,
    }).promise;

    const dataUrl = canvas.toDataURL('image/png', 0.95);

    const indexNumber = String(pageNum).padStart(2, '0');
    const poseId = `standing-${indexNumber}`;
    const poseName = `Standing ${indexNumber}`;

    poses.push({
      id: poseId,
      name: poseName,
      category: 'Standing',
      description: `Original standing pose template ${indexNumber} extracted from PDF guide.`,
      tip: 'Align your posture with the transparent overlay guide and hold still.',
      recommendedAngle: 'Full Body • 1.0x',
      viewBox: `0 0 ${canvas.width} ${canvas.height}`,
      svgPath: `<image href="${dataUrl}" x="0" y="0" width="${canvas.width}" height="${canvas.height}" preserveAspectRatio="xMidYMid meet" opacity="0.95" />`,
    });
  }

  return poses;
}
