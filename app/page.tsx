// CR PDF Tools - Self-Contained
'use client';

import React, { useState, useCallback } from 'react';
import { 
  FileText, Scissors, Merge, RotateCw, Trash2, Image, 
  Droplets, Minimize2, Download, CheckCircle,
  Upload, Layers, Shield, Hash, Zap, Loader2, X, AlertCircle
} from 'lucide-react';
import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';

// ============= PDF PROCESSING FUNCTIONS =============

async function mergePDFs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach(page => mergedPdf.addPage(page));
  }
  return mergedPdf.save();
}

async function splitPDF(file: File, ranges: string): Promise<Uint8Array[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const totalPages = pdf.getPageCount();
  const results: Uint8Array[] = [];
  
  const parts = ranges.split(',').map(s => s.trim());
  for (const part of parts) {
    const newPdf = await PDFDocument.create();
    let pages: number[] = [];
    
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(s => parseInt(s.trim()));
      for (let i = start; i <= Math.min(end, totalPages); i++) pages.push(i - 1);
    } else {
      const p = parseInt(part) - 1;
      if (p >= 0 && p < totalPages) pages.push(p);
    }
    
    if (pages.length > 0) {
      const copiedPages = await newPdf.copyPages(pdf, pages);
      copiedPages.forEach(page => newPdf.addPage(page));
      results.push(await newPdf.save());
    }
  }
  return results;
}

async function extractPages(file: File, pageNumbers: number[]): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();
  const indices = pageNumbers.map(p => p - 1).filter(i => i >= 0 && i < pdf.getPageCount());
  const copiedPages = await newPdf.copyPages(pdf, indices);
  copiedPages.forEach(page => newPdf.addPage(page));
  return newPdf.save();
}

async function removePages(file: File, pageNumbers: number[]): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const totalPages = pdf.getPageCount();
  const pagesToRemove = new Set(pageNumbers.map(p => p - 1));
  const pagesToKeep = Array.from({ length: totalPages }, (_, i) => i).filter(i => !pagesToRemove.has(i));
  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(pdf, pagesToKeep);
  copiedPages.forEach(page => newPdf.addPage(page));
  return newPdf.save();
}

async function rotatePages(file: File, rotation: 90 | 180 | 270): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  for (const page of pdf.getPages()) {
    const current = page.getRotation().angle;
    page.setRotation(degrees(current + rotation));
  }
  return pdf.save();
}

async function addWatermark(file: File, text: string): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, 50);
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: height / 2,
      size: 50,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity: 0.3,
      rotate: degrees(-45),
    });
  }
  return pdf.save();
}

async function addPageNumbers(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();
  const total = pages.length;
  pages.forEach((page, i) => {
    const { width } = page.getSize();
    const text = `Page ${i + 1} of ${total}`;
    const textWidth = font.widthOfTextAtSize(text, 12);
    page.drawText(text, { x: (width - textWidth) / 2, y: 30, size: 12, font, color: rgb(0, 0, 0) });
  });
  return pdf.save();
}

async function compressPDF(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  pdf.setTitle(''); pdf.setAuthor(''); pdf.setSubject(''); pdf.setKeywords([]);
  pdf.setProducer('CR PDF Tools'); pdf.setCreator('CR PDF Tools');
  return pdf.save({ useObjectStreams: true });
}

async function imagesToPDF(files: File[]): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    let image;
    if (file.type === 'image/png') image = await pdf.embedPng(bytes);
    else if (file.type.includes('jpeg') || file.type.includes('jpg')) image = await pdf.embedJpg(bytes);
    else continue;
    const page = pdf.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }
  return pdf.save();
}

async function flattenPDF(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  pdf.getForm().flatten();
  return pdf.save();
}

function downloadPDF(data: Uint8Array, filename: string): void {
  const blob = new Blob([data], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============= TOOL DEFINITIONS =============

interface Tool {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  acceptMultiple: boolean;
  acceptImages?: boolean;
  needsInput?: boolean;
  inputLabel?: string;
  process: (files: File[], input?: string) => Promise<string>;
}

const TOOLS: Record<string, Tool> = {
  merge: { 
    name: 'Merge PDFs', icon: Merge, description: 'Combine multiple PDFs',
    acceptMultiple: true, acceptImages: false,
    process: async (files) => { downloadPDF(await mergePDFs(files), 'merged.pdf'); return 'Merged!'; }
  },
  split: { 
    name: 'Split PDF', icon: Scissors, description: 'Split into multiple files',
    acceptMultiple: false, acceptImages: false, needsInput: true, inputLabel: 'Ranges (e.g., 1-3, 5)',
    process: async (files, input) => {
      const results = await splitPDF(files[0], input || '1');
      results.forEach((d, i) => setTimeout(() => downloadPDF(d, `split-${i+1}.pdf`), i * 300));
      return `Split into ${results.length} files!`;
    }
  },
  extract: { 
    name: 'Extract Pages', icon: FileText, description: 'Extract specific pages',
    acceptMultiple: false, acceptImages: false, needsInput: true, inputLabel: 'Pages (e.g., 1, 3, 5)',
    process: async (files, input) => {
      const pages = (input || '1').split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      downloadPDF(await extractPages(files[0], pages), 'extracted.pdf');
      return `Extracted ${pages.length} pages!`;
    }
  },
  remove: { 
    name: 'Remove Pages', icon: Trash2, description: 'Delete specific pages',
    acceptMultiple: false, acceptImages: false, needsInput: true, inputLabel: 'Pages to remove (e.g., 2, 4)',
    process: async (files, input) => {
      const pages = (input || '1').split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      downloadPDF(await removePages(files[0], pages), 'pages-removed.pdf');
      return `Removed ${pages.length} pages!`;
    }
  },
  rotate: { 
    name: 'Rotate 90°', icon: RotateCw, description: 'Rotate all pages 90°',
    acceptMultiple: false, acceptImages: false,
    process: async (files) => { downloadPDF(await rotatePages(files[0], 90), 'rotated.pdf'); return 'Rotated!'; }
  },
  watermark: { 
    name: 'Watermark', icon: Droplets, description: 'Add text watermark',
    acceptMultiple: false, acceptImages: false, needsInput: true, inputLabel: 'Watermark text',
    process: async (files, input) => { downloadPDF(await addWatermark(files[0], input || 'CONFIDENTIAL'), 'watermarked.pdf'); return 'Watermark added!'; }
  },
  pagenumbers: { 
    name: 'Page Numbers', icon: Hash, description: 'Add page numbers',
    acceptMultiple: false, acceptImages: false,
    process: async (files) => { downloadPDF(await addPageNumbers(files[0]), 'numbered.pdf'); return 'Numbers added!'; }
  },
  compress: { 
    name: 'Compress', icon: Minimize2, description: 'Reduce file size',
    acceptMultiple: false, acceptImages: false,
    process: async (files) => {
      const result = await compressPDF(files[0]);
      const savings = Math.round((1 - result.length / files[0].size) * 100);
      downloadPDF(result, 'compressed.pdf');
      return `Saved ${savings}%`;
    }
  },
  imagetopdf: { 
    name: 'Images→PDF', icon: Image, description: 'Convert images to PDF',
    acceptMultiple: true, acceptImages: true,
    process: async (files) => { downloadPDF(await imagesToPDF(files), 'images.pdf'); return `${files.length} images converted!`; }
  },
  flatten: { 
    name: 'Flatten', icon: Zap, description: 'Flatten form fields',
    acceptMultiple: false, acceptImages: false,
    process: async (files) => { downloadPDF(await flattenPDF(files[0]), 'flattened.pdf'); return 'Flattened!'; }
  },
};

// ============= MAIN COMPONENT =============

export default function PDFToolsPage() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const tool = selectedTool ? TOOLS[selectedTool] : null;
    const acceptImages = tool?.acceptImages || false;
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => 
      f.type === 'application/pdf' || (acceptImages && f.type.startsWith('image/'))
    );
    setFiles(prev => [...prev, ...droppedFiles]);
    setResult(null);
  }, [selectedTool]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) { setFiles(prev => [...prev, ...Array.from(e.target.files!)]); setResult(null); }
  };

  const processFiles = async () => {
    if (!selectedTool || files.length === 0) return;
    setIsProcessing(true); setResult(null);
    try {
      const message = await TOOLS[selectedTool].process(files, inputValue);
      setResult({ success: true, message });
    } catch (error) {
      setResult({ success: false, message: `Error: ${error instanceof Error ? error.message : 'Failed'}` });
    } finally { setIsProcessing(false); }
  };

  const tool = selectedTool ? TOOLS[selectedTool] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div><h1 className="text-lg font-bold text-gray-900">CR PDF Tools</h1><p className="text-xs text-gray-500">10 Free Tools</p></div>
          </div>
          <span className="text-xs text-gray-400">CR AudioViz AI</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {Object.entries(TOOLS).map(([id, t]) => {
            const Icon = t.icon;
            const isSelected = selectedTool === id;
            return (
              <button key={id} onClick={() => { setSelectedTool(isSelected ? null : id); setFiles([]); setResult(null); setInputValue(''); }}
                className={`p-4 rounded-xl border-2 text-left transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white hover:border-blue-200'}`}>
                <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                <p className={`font-medium text-sm ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>{t.name}</p>
                <p className="text-xs text-gray-500">{t.description}</p>
              </button>
            );
          })}
        </div>

        {tool && (
          <div className="bg-white rounded-2xl shadow-lg border p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center"><tool.icon className="w-6 h-6 text-blue-600" /></div>
              <div><h2 className="text-xl font-bold">{tool.name}</h2><p className="text-sm text-gray-500">{tool.description}</p></div>
            </div>

            <div className={`border-2 border-dashed rounded-xl p-6 text-center mb-4 ${files.length > 0 ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}`}
              onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
              <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 mb-2">{files.length > 0 ? `${files.length} file(s)` : `Drop ${tool.acceptImages ? 'images' : 'PDFs'} here`}</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg cursor-pointer hover:bg-blue-700">
                <Upload className="w-4 h-4" />Choose Files
                <input type="file" accept={tool.acceptImages ? 'image/*' : '.pdf'} multiple={tool.acceptMultiple} className="hidden" onChange={handleFileSelect} />
              </label>
              {files.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border text-sm">
                      <FileText className="w-4 h-4 text-blue-600" /><span className="truncate max-w-[100px]">{f.name}</span>
                      <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button onClick={() => { setFiles([]); setResult(null); }} className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-full">Clear</button>
                </div>
              )}
            </div>

            {tool.needsInput && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{tool.inputLabel}</label>
                <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={tool.inputLabel}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 outline-none" />
              </div>
            )}

            {result && (
              <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {result.success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}{result.message}
              </div>
            )}

            <button onClick={processFiles} disabled={isProcessing || files.length === 0}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium disabled:opacity-50">
              {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" />Processing...</> : <><Download className="w-5 h-5" />Process & Download</>}
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border"><Shield className="w-8 h-8 text-green-600 mb-2" /><h3 className="font-semibold">100% Private</h3><p className="text-sm text-gray-500">Browser-only processing</p></div>
          <div className="bg-white rounded-xl p-4 border"><Zap className="w-8 h-8 text-yellow-600 mb-2" /><h3 className="font-semibold">Instant</h3><p className="text-sm text-gray-500">No server upload</p></div>
          <div className="bg-white rounded-xl p-4 border"><Layers className="w-8 h-8 text-blue-600 mb-2" /><h3 className="font-semibold">Free Forever</h3><p className="text-sm text-gray-500">No limits</p></div>
        </div>
      </main>

      <footer className="border-t bg-white mt-12 py-6"><div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">© 2025 CR AudioViz AI</div></footer>
    </div>
  );
}
