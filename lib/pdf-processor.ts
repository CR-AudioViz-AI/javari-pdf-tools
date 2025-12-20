// =============================================================================
// CR PDF TOOLS - PDF PROCESSING LIBRARY
// =============================================================================
// Browser-based PDF processing using pdf-lib and PDF.js
// Works on Vercel without a backend server
// Saturday, December 20, 2025
// =============================================================================

import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';

// =============================================================================
// MERGE PDFs
// =============================================================================
export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();
  
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach(page => mergedPdf.addPage(page));
  }
  
  return mergedPdf.save();
}

// =============================================================================
// SPLIT PDF
// =============================================================================
export async function splitPDF(file: File, ranges: string): Promise<Uint8Array[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const totalPages = pdf.getPageCount();
  
  // Parse ranges like "1-3,5,7-9"
  const pageGroups = parseRanges(ranges, totalPages);
  const results: Uint8Array[] = [];
  
  for (const pages of pageGroups) {
    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdf, pages.map(p => p - 1));
    copiedPages.forEach(page => newPdf.addPage(page));
    results.push(await newPdf.save());
  }
  
  return results;
}

// =============================================================================
// EXTRACT PAGES
// =============================================================================
export async function extractPages(file: File, pageNumbers: number[]): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  
  const newPdf = await PDFDocument.create();
  const indices = pageNumbers.map(p => p - 1).filter(i => i >= 0 && i < pdf.getPageCount());
  const copiedPages = await newPdf.copyPages(pdf, indices);
  copiedPages.forEach(page => newPdf.addPage(page));
  
  return newPdf.save();
}

// =============================================================================
// REMOVE PAGES
// =============================================================================
export async function removePages(file: File, pageNumbers: number[]): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const totalPages = pdf.getPageCount();
  
  const pagesToRemove = new Set(pageNumbers.map(p => p - 1));
  const pagesToKeep = Array.from({ length: totalPages }, (_, i) => i)
    .filter(i => !pagesToRemove.has(i));
  
  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(pdf, pagesToKeep);
  copiedPages.forEach(page => newPdf.addPage(page));
  
  return newPdf.save();
}

// =============================================================================
// ROTATE PAGES
// =============================================================================
export async function rotatePages(
  file: File, 
  rotation: 90 | 180 | 270, 
  pageNumbers?: number[]
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  
  const pagesToRotate = pageNumbers 
    ? pageNumbers.map(p => p - 1) 
    : pdf.getPageIndices();
  
  for (const pageIndex of pagesToRotate) {
    if (pageIndex >= 0 && pageIndex < pdf.getPageCount()) {
      const page = pdf.getPage(pageIndex);
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees(currentRotation + rotation));
    }
  }
  
  return pdf.save();
}

// =============================================================================
// ADD WATERMARK
// =============================================================================
export async function addWatermark(
  file: File,
  text: string,
  options: {
    fontSize?: number;
    opacity?: number;
    rotation?: number;
    color?: { r: number; g: number; b: number };
  } = {}
): Promise<Uint8Array> {
  const {
    fontSize = 50,
    opacity = 0.3,
    rotation = -45,
    color = { r: 0.5, g: 0.5, b: 0.5 }
  } = options;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  
  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: height / 2,
      size: fontSize,
      font,
      color: rgb(color.r, color.g, color.b),
      opacity,
      rotate: degrees(rotation),
    });
  }
  
  return pdf.save();
}

// =============================================================================
// ADD PAGE NUMBERS
// =============================================================================
export async function addPageNumbers(
  file: File,
  options: {
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    format?: string; // e.g., "Page {n} of {total}"
    fontSize?: number;
    startNumber?: number;
  } = {}
): Promise<Uint8Array> {
  const {
    position = 'bottom-center',
    format = 'Page {n} of {total}',
    fontSize = 12,
    startNumber = 1
  } = options;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();
  const totalPages = pages.length;
  
  pages.forEach((page, index) => {
    const { width, height } = page.getSize();
    const pageNum = startNumber + index;
    const text = format
      .replace('{n}', String(pageNum))
      .replace('{total}', String(totalPages));
    
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    
    let x: number, y: number;
    const margin = 30;
    
    switch (position) {
      case 'top-left':
        x = margin; y = height - margin;
        break;
      case 'top-center':
        x = (width - textWidth) / 2; y = height - margin;
        break;
      case 'top-right':
        x = width - textWidth - margin; y = height - margin;
        break;
      case 'bottom-left':
        x = margin; y = margin;
        break;
      case 'bottom-center':
        x = (width - textWidth) / 2; y = margin;
        break;
      case 'bottom-right':
        x = width - textWidth - margin; y = margin;
        break;
    }
    
    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
  });
  
  return pdf.save();
}

// =============================================================================
// COMPRESS PDF (Basic - removes metadata, optimizes)
// =============================================================================
export async function compressPDF(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  
  // Remove metadata for smaller size
  pdf.setTitle('');
  pdf.setAuthor('');
  pdf.setSubject('');
  pdf.setKeywords([]);
  pdf.setProducer('CR PDF Tools');
  pdf.setCreator('CR PDF Tools');
  
  return pdf.save({ useObjectStreams: true });
}

// =============================================================================
// GET PDF INFO
// =============================================================================
export async function getPDFInfo(file: File): Promise<{
  pageCount: number;
  title: string | undefined;
  author: string | undefined;
  subject: string | undefined;
  creator: string | undefined;
  producer: string | undefined;
  creationDate: Date | undefined;
  modificationDate: Date | undefined;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  
  return {
    pageCount: pdf.getPageCount(),
    title: pdf.getTitle(),
    author: pdf.getAuthor(),
    subject: pdf.getSubject(),
    creator: pdf.getCreator(),
    producer: pdf.getProducer(),
    creationDate: pdf.getCreationDate(),
    modificationDate: pdf.getModificationDate(),
  };
}

// =============================================================================
// IMAGE TO PDF
// =============================================================================
export async function imagesToPDF(files: File[]): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    let image;
    if (file.type === 'image/png') {
      image = await pdf.embedPng(bytes);
    } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      image = await pdf.embedJpg(bytes);
    } else {
      continue; // Skip unsupported formats
    }
    
    const page = pdf.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }
  
  return pdf.save();
}

// =============================================================================
// REARRANGE PAGES
// =============================================================================
export async function rearrangePages(file: File, newOrder: number[]): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  
  const newPdf = await PDFDocument.create();
  const indices = newOrder.map(p => p - 1).filter(i => i >= 0 && i < pdf.getPageCount());
  const copiedPages = await newPdf.copyPages(pdf, indices);
  copiedPages.forEach(page => newPdf.addPage(page));
  
  return newPdf.save();
}

// =============================================================================
// FLATTEN PDF (removes form fields)
// =============================================================================
export async function flattenPDF(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  
  const form = pdf.getForm();
  form.flatten();
  
  return pdf.save();
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function parseRanges(ranges: string, totalPages: number): number[][] {
  const groups: number[][] = [];
  const parts = ranges.split(',').map(s => s.trim());
  
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(s => parseInt(s.trim()));
      const pages: number[] = [];
      for (let i = start; i <= Math.min(end, totalPages); i++) {
        pages.push(i);
      }
      groups.push(pages);
    } else {
      const page = parseInt(part);
      if (page >= 1 && page <= totalPages) {
        groups.push([page]);
      }
    }
  }
  
  return groups;
}

// =============================================================================
// DOWNLOAD HELPER
// =============================================================================
export function downloadPDF(data: Uint8Array, filename: string): void {
  const blob = new Blob([data], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadZip(files: { data: Uint8Array; name: string }[]): void {
  // For multiple files, we'd need JSZip - for now, download individually
  files.forEach((file, index) => {
    setTimeout(() => downloadPDF(file.data, file.name), index * 500);
  });
}
