// CR PDF Tools - Main Page with Processing
// 10 PDF tools powered by pdf-lib (browser-based)
'use client';

import React, { useState, useCallback } from 'react';
import { 
  FileText, Scissors, Merge, RotateCw, Trash2, Image, 
  Droplets, Minimize2, Download, CheckCircle,
  Upload, Layers, Shield,
  Hash, Zap, Loader2, X, AlertCircle
} from 'lucide-react';
import {
  mergePDFs,
  splitPDF,
  extractPages,
  removePages,
  rotatePages,
  addWatermark,
  addPageNumbers,
  compressPDF,
  imagesToPDF,
  flattenPDF,
  downloadPDF
} from '@/lib/pdf-processor';

// Tool type definition
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

// Tool definitions
const TOOLS: Record<string, Tool> = {
  merge: { 
    name: 'Merge PDFs', 
    icon: Merge, 
    description: 'Combine multiple PDFs into one',
    acceptMultiple: true,
    acceptImages: false,
    process: async (files: File[]) => {
      const result = await mergePDFs(files);
      downloadPDF(result, 'merged.pdf');
      return 'PDFs merged successfully!';
    }
  },
  split: { 
    name: 'Split PDF', 
    icon: Scissors, 
    description: 'Split PDF into multiple files',
    acceptMultiple: false,
    acceptImages: false,
    needsInput: true,
    inputLabel: 'Page ranges (e.g., 1-3, 5, 7-9)',
    process: async (files: File[], input?: string) => {
      const results = await splitPDF(files[0], input || '1');
      results.forEach((data, i) => {
        setTimeout(() => downloadPDF(data, `split-${i + 1}.pdf`), i * 300);
      });
      return `Split into ${results.length} files!`;
    }
  },
  extract: { 
    name: 'Extract Pages', 
    icon: FileText, 
    description: 'Extract specific pages',
    acceptMultiple: false,
    acceptImages: false,
    needsInput: true,
    inputLabel: 'Page numbers (e.g., 1, 3, 5)',
    process: async (files: File[], input?: string) => {
      const pages = (input || '1').split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      const result = await extractPages(files[0], pages);
      downloadPDF(result, 'extracted.pdf');
      return `Extracted ${pages.length} pages!`;
    }
  },
  remove: { 
    name: 'Remove Pages', 
    icon: Trash2, 
    description: 'Delete specific pages',
    acceptMultiple: false,
    acceptImages: false,
    needsInput: true,
    inputLabel: 'Pages to remove (e.g., 2, 4, 6)',
    process: async (files: File[], input?: string) => {
      const pages = (input || '1').split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      const result = await removePages(files[0], pages);
      downloadPDF(result, 'pages-removed.pdf');
      return `Removed ${pages.length} pages!`;
    }
  },
  rotate: { 
    name: 'Rotate Pages', 
    icon: RotateCw, 
    description: 'Rotate PDF pages 90°',
    acceptMultiple: false,
    acceptImages: false,
    process: async (files: File[]) => {
      const result = await rotatePages(files[0], 90);
      downloadPDF(result, 'rotated.pdf');
      return 'Rotated 90°!';
    }
  },
  watermark: { 
    name: 'Add Watermark', 
    icon: Droplets, 
    description: 'Add watermark to PDF',
    acceptMultiple: false,
    acceptImages: false,
    needsInput: true,
    inputLabel: 'Watermark text',
    process: async (files: File[], input?: string) => {
      const result = await addWatermark(files[0], input || 'CONFIDENTIAL');
      downloadPDF(result, 'watermarked.pdf');
      return 'Watermark added!';
    }
  },
  pagenumbers: { 
    name: 'Page Numbers', 
    icon: Hash, 
    description: 'Add page numbers',
    acceptMultiple: false,
    acceptImages: false,
    process: async (files: File[]) => {
      const result = await addPageNumbers(files[0]);
      downloadPDF(result, 'numbered.pdf');
      return 'Page numbers added!';
    }
  },
  compress: { 
    name: 'Compress PDF', 
    icon: Minimize2, 
    description: 'Reduce file size',
    acceptMultiple: false,
    acceptImages: false,
    process: async (files: File[]) => {
      const result = await compressPDF(files[0]);
      const savings = Math.round((1 - result.length / files[0].size) * 100);
      downloadPDF(result, 'compressed.pdf');
      return `Compressed! Saved ${savings}%`;
    }
  },
  imagetopdf: { 
    name: 'Images to PDF', 
    icon: Image, 
    description: 'Convert images to PDF',
    acceptMultiple: true,
    acceptImages: true,
    process: async (files: File[]) => {
      const result = await imagesToPDF(files);
      downloadPDF(result, 'images.pdf');
      return `Converted ${files.length} images!`;
    }
  },
  flatten: { 
    name: 'Flatten PDF', 
    icon: Zap, 
    description: 'Flatten form fields',
    acceptMultiple: false,
    acceptImages: false,
    process: async (files: File[]) => {
      const result = await flattenPDF(files[0]);
      downloadPDF(result, 'flattened.pdf');
      return 'PDF flattened!';
    }
  },
};

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
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
      setResult(null);
    }
  };

  const processFiles = async () => {
    if (!selectedTool || files.length === 0) return;
    
    const tool = TOOLS[selectedTool];
    setIsProcessing(true);
    setResult(null);

    try {
      const message = await tool.process(files, inputValue);
      setResult({ success: true, message });
    } catch (error) {
      setResult({ success: false, message: `Error: ${error instanceof Error ? error.message : 'Processing failed'}` });
    } finally {
      setIsProcessing(false);
    }
  };

  const clearFiles = () => {
    setFiles([]);
    setResult(null);
    setInputValue('');
  };

  const tool = selectedTool ? TOOLS[selectedTool] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">CR PDF Tools</h1>
              <p className="text-xs text-gray-500">10 Free PDF Tools</p>
            </div>
          </div>
          <span className="text-xs text-gray-400">Powered by CR AudioViz AI</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Tool Selection */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {Object.entries(TOOLS).map(([id, t]) => {
            const Icon = t.icon;
            const isSelected = selectedTool === id;
            return (
              <button
                key={id}
                onClick={() => {
                  setSelectedTool(isSelected ? null : id);
                  setFiles([]);
                  setResult(null);
                  setInputValue('');
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                    : 'border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/50'
                }`}
              >
                <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                <p className={`font-medium text-sm ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                  {t.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
              </button>
            );
          })}
        </div>

        {/* Selected Tool Interface */}
        {selectedTool && tool && (
          <div className="bg-white rounded-2xl shadow-lg border p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <tool.icon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{tool.name}</h2>
                <p className="text-sm text-gray-500">{tool.description}</p>
              </div>
            </div>

            {/* Upload Area */}
            <div 
              className={`border-2 border-dashed rounded-xl p-6 text-center mb-4 transition-all ${
                files.length > 0 ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 mb-2">
                {files.length > 0 
                  ? `${files.length} file(s) selected` 
                  : `Drop ${tool.acceptImages ? 'images' : 'PDF files'} here`}
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg cursor-pointer hover:bg-blue-700">
                <Upload className="w-4 h-4" />
                Choose Files
                <input 
                  type="file" 
                  accept={tool.acceptImages ? 'image/*' : '.pdf'}
                  multiple={tool.acceptMultiple}
                  className="hidden" 
                  onChange={handleFileSelect}
                />
              </label>

              {files.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border text-sm">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="truncate max-w-[120px]">{file.name}</span>
                      <button 
                        onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={clearFiles}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-full"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Input Field (if needed) */}
            {tool.needsInput && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {tool.inputLabel}
                </label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={tool.inputLabel}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
                />
              </div>
            )}

            {/* Result Message */}
            {result && (
              <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
                result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {result.success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                {result.message}
              </div>
            )}

            {/* Process Button */}
            <button
              onClick={processFiles}
              disabled={isProcessing || files.length === 0}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isProcessing ? (
                <><Loader2 className="w-5 h-5 animate-spin" />Processing...</>
              ) : (
                <><Download className="w-5 h-5" />Process & Download</>
              )}
            </button>
          </div>
        )}

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border">
            <Shield className="w-8 h-8 text-green-600 mb-2" />
            <h3 className="font-semibold text-gray-900">100% Private</h3>
            <p className="text-sm text-gray-500">Files processed in your browser. Nothing uploaded.</p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <Zap className="w-8 h-8 text-yellow-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Instant</h3>
            <p className="text-sm text-gray-500">No waiting. Files processed immediately.</p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <Layers className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Free Forever</h3>
            <p className="text-sm text-gray-500">No limits, no signup required.</p>
          </div>
        </div>
      </main>

      <footer className="border-t bg-white mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2025 CR AudioViz AI, LLC. "Your Story. Our Design."</p>
        </div>
      </footer>
    </div>
  );
}
