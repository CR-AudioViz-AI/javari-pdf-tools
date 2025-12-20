'use client';

import React, { useState } from 'react';
import { 
  FileText, Merge, Split, RotateCw, Trash2, Image, Lock, 
  Unlock, Droplets, FileSearch, Download, Upload, Scissors,
  Layers, Type, Stamp, Shield, Zap, Globe, ChevronRight
} from 'lucide-react';

const TOOLS = [
  { id: 'merge', name: 'Merge PDFs', icon: Merge, desc: 'Combine multiple PDFs into one', category: 'organize' },
  { id: 'split', name: 'Split PDF', icon: Split, desc: 'Split PDF into multiple files', category: 'organize' },
  { id: 'rotate', name: 'Rotate Pages', icon: RotateCw, desc: 'Rotate PDF pages', category: 'organize' },
  { id: 'remove', name: 'Remove Pages', icon: Trash2, desc: 'Delete specific pages', category: 'organize' },
  { id: 'extract', name: 'Extract Pages', icon: Scissors, desc: 'Extract specific pages', category: 'organize' },
  { id: 'rearrange', name: 'Rearrange', icon: Layers, desc: 'Reorder PDF pages', category: 'organize' },
  
  { id: 'pdf-to-image', name: 'PDF to Image', icon: Image, desc: 'Convert PDF to PNG/JPG', category: 'convert' },
  { id: 'image-to-pdf', name: 'Image to PDF', icon: FileText, desc: 'Convert images to PDF', category: 'convert' },
  { id: 'pdf-to-word', name: 'PDF to Word', icon: FileText, desc: 'Convert PDF to DOCX', category: 'convert' },
  { id: 'word-to-pdf', name: 'Word to PDF', icon: FileText, desc: 'Convert DOCX to PDF', category: 'convert' },
  { id: 'html-to-pdf', name: 'HTML to PDF', icon: Globe, desc: 'Convert webpage to PDF', category: 'convert' },
  
  { id: 'compress', name: 'Compress PDF', icon: Droplets, desc: 'Reduce PDF file size', category: 'optimize' },
  { id: 'ocr', name: 'OCR', icon: FileSearch, desc: 'Extract text from scanned PDFs', category: 'optimize' },
  { id: 'repair', name: 'Repair PDF', icon: Zap, desc: 'Fix corrupted PDFs', category: 'optimize' },
  
  { id: 'add-password', name: 'Add Password', icon: Lock, desc: 'Protect PDF with password', category: 'security' },
  { id: 'remove-password', name: 'Remove Password', icon: Unlock, desc: 'Unlock protected PDF', category: 'security' },
  { id: 'watermark', name: 'Add Watermark', icon: Stamp, desc: 'Add watermark to PDF', category: 'security' },
  { id: 'redact', name: 'Redact', icon: Shield, desc: 'Permanently remove sensitive info', category: 'security' },
  
  { id: 'page-numbers', name: 'Page Numbers', icon: Type, desc: 'Add page numbers', category: 'edit' },
  { id: 'add-image', name: 'Add Image', icon: Image, desc: 'Insert images into PDF', category: 'edit' },
];

const CATEGORIES = [
  { id: 'organize', name: 'Organize', color: 'blue' },
  { id: 'convert', name: 'Convert', color: 'green' },
  { id: 'optimize', name: 'Optimize', color: 'purple' },
  { id: 'security', name: 'Security', color: 'red' },
  { id: 'edit', name: 'Edit', color: 'orange' },
];

export default function PDFToolsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const filteredTools = selectedCategory 
    ? TOOLS.filter(t => t.category === selectedCategory)
    : TOOLS;

  const handleToolClick = (toolId: string) => {
    // In production, this would open the specific tool
    // For now, redirect to StirlingPDF instance
    const stirlingUrl = process.env.NEXT_PUBLIC_STIRLING_URL || 'http://localhost:8080';
    window.open(`${stirlingUrl}/${toolId}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">CR PDF Tools</h1>
              <p className="text-xs text-slate-400">60+ Professional PDF Tools</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">Powered by CR AudioViz AI</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          All Your PDF Needs in One Place
        </h2>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
          Merge, split, compress, convert, and edit PDFs with 60+ professional tools.
          Free to use. No signup required.
        </p>
        
        {/* Quick Upload */}
        <div className="max-w-xl mx-auto">
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-600 rounded-2xl cursor-pointer bg-slate-800/50 hover:bg-slate-700/50 transition-colors">
            <Upload className="w-10 h-10 text-slate-400 mb-3" />
            <span className="text-slate-300 font-medium">Drop your PDF here</span>
            <span className="text-sm text-slate-500 mt-1">or click to browse</span>
            <input type="file" className="hidden" accept=".pdf" />
          </label>
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedCategory 
                  ? 'bg-white text-slate-900' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Tools
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat.id 
                    ? 'bg-white text-slate-900' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredTools.map(tool => (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.id)}
                className="group p-6 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-blue-500/50 hover:bg-slate-700/50 transition-all text-left"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-colors">
                  <tool.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white mb-1">{tool.name}</h3>
                <p className="text-sm text-slate-400">{tool.desc}</p>
                <ChevronRight className="w-4 h-4 text-slate-500 mt-3 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 py-16 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">60+</div>
              <div className="text-slate-400">PDF Tools</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">100%</div>
              <div className="text-slate-400">Free to Use</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">0</div>
              <div className="text-slate-400">Files Stored</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">SSL</div>
              <div className="text-slate-400">Encrypted</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 border-t border-slate-700">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-slate-400 text-sm">
            © 2025 CR AudioViz AI, LLC. All rights reserved.
          </p>
          <p className="text-slate-500 text-xs mt-2">
            "Your Story. Our Design."
          </p>
        </div>
      </footer>
    </div>
  );
}
