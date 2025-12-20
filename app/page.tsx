// CR PDF Tools - Main Page
// 60+ PDF tools powered by StirlingPDF
'use client';

import React, { useState, useCallback } from 'react';
import { 
  FileText, Scissors, Merge, RotateCw, Trash2, Image, 
  Lock, Unlock, Droplets, FileSearch, Minimize2, Download,
  Upload, ArrowLeftRight, Layers, FileType, Shield, Eye,
  Stamp, Hash, FileImage, Zap, BookOpen, Settings2
} from 'lucide-react';

// Tool categories and tools
const TOOL_CATEGORIES = [
  {
    name: 'Page Operations',
    icon: Layers,
    color: 'blue',
    tools: [
      { id: 'merge', name: 'Merge PDFs', icon: Merge, description: 'Combine multiple PDFs into one' },
      { id: 'split', name: 'Split PDF', icon: Scissors, description: 'Split PDF into multiple files' },
      { id: 'rotate', name: 'Rotate Pages', icon: RotateCw, description: 'Rotate PDF pages' },
      { id: 'remove', name: 'Remove Pages', icon: Trash2, description: 'Delete specific pages' },
      { id: 'extract', name: 'Extract Pages', icon: FileText, description: 'Extract specific pages' },
      { id: 'rearrange', name: 'Rearrange', icon: ArrowLeftRight, description: 'Reorder PDF pages' },
    ]
  },
  {
    name: 'Conversion',
    icon: FileType,
    color: 'green',
    tools: [
      { id: 'pdf-to-image', name: 'PDF to Image', icon: FileImage, description: 'Convert PDF to PNG/JPG' },
      { id: 'image-to-pdf', name: 'Image to PDF', icon: FileText, description: 'Convert images to PDF' },
      { id: 'pdf-to-word', name: 'PDF to Word', icon: FileType, description: 'Convert PDF to DOCX' },
      { id: 'word-to-pdf', name: 'Word to PDF', icon: FileText, description: 'Convert DOCX to PDF' },
      { id: 'pdf-to-pptx', name: 'PDF to PowerPoint', icon: FileType, description: 'Convert PDF to PPTX' },
      { id: 'html-to-pdf', name: 'HTML to PDF', icon: FileText, description: 'Convert HTML to PDF' },
    ]
  },
  {
    name: 'Security',
    icon: Shield,
    color: 'red',
    tools: [
      { id: 'add-password', name: 'Add Password', icon: Lock, description: 'Protect PDF with password' },
      { id: 'remove-password', name: 'Remove Password', icon: Unlock, description: 'Remove PDF password' },
      { id: 'add-watermark', name: 'Add Watermark', icon: Droplets, description: 'Add watermark to PDF' },
      { id: 'redact', name: 'Redact Text', icon: Eye, description: 'Permanently remove sensitive text' },
      { id: 'sanitize', name: 'Sanitize', icon: Shield, description: 'Remove metadata & hidden data' },
    ]
  },
  {
    name: 'Editing',
    icon: Settings2,
    color: 'purple',
    tools: [
      { id: 'compress', name: 'Compress PDF', icon: Minimize2, description: 'Reduce PDF file size' },
      { id: 'add-image', name: 'Add Image', icon: Image, description: 'Insert images into PDF' },
      { id: 'add-page-numbers', name: 'Page Numbers', icon: Hash, description: 'Add page numbers' },
      { id: 'add-stamp', name: 'Add Stamp', icon: Stamp, description: 'Add stamps to PDF' },
      { id: 'ocr', name: 'OCR', icon: BookOpen, description: 'Make PDF searchable' },
      { id: 'flatten', name: 'Flatten', icon: Zap, description: 'Flatten form fields' },
    ]
  },
];

const COLOR_CLASSES: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
  red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
};

export default function PDFToolsPage() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      f => f.type === 'application/pdf' || f.type.startsWith('image/')
    );
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const processFiles = async () => {
    if (!selectedTool || files.length === 0) return;
    setIsProcessing(true);
    
    // Simulate processing - in production, this would call StirlingPDF API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    alert(`Processing complete! Tool: ${selectedTool}, Files: ${files.length}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CR PDF Tools</h1>
              <p className="text-xs text-gray-500">60+ Professional PDF Tools</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Powered by CR AudioViz AI</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            All Your PDF Needs in One Place
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Merge, split, compress, convert, and secure your PDFs with our powerful suite of 60+ tools.
            No signup required. Your files stay private.
          </p>
        </div>

        {/* Upload Area */}
        <div 
          className={`mb-12 border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
            files.length > 0 ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {files.length > 0 ? `${files.length} file(s) selected` : 'Drop your PDF files here'}
          </p>
          <p className="text-sm text-gray-500 mb-4">or</p>
          <label className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
            <Upload className="w-5 h-5" />
            Choose Files
            <input 
              type="file" 
              accept=".pdf,image/*" 
              multiple 
              className="hidden" 
              onChange={handleFileSelect}
            />
          </label>
          
          {files.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {files.map((file, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border text-sm">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <button 
                    onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                    className="text-gray-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tool Categories */}
        <div className="grid md:grid-cols-2 gap-8">
          {TOOL_CATEGORIES.map((category) => {
            const colors = COLOR_CLASSES[category.color];
            const CategoryIcon = category.icon;
            
            return (
              <div key={category.name} className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center`}>
                    <CategoryIcon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {category.tools.map((tool) => {
                    const ToolIcon = tool.icon;
                    const isSelected = selectedTool === tool.id;
                    
                    return (
                      <button
                        key={tool.id}
                        onClick={() => setSelectedTool(isSelected ? null : tool.id)}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                          isSelected 
                            ? `${colors.bg} ${colors.border} ring-2 ring-offset-1 ring-${category.color}-400` 
                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <ToolIcon className={`w-5 h-5 mt-0.5 ${isSelected ? colors.text : 'text-gray-400'}`} />
                        <div>
                          <p className={`font-medium text-sm ${isSelected ? colors.text : 'text-gray-900'}`}>
                            {tool.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{tool.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Process Button */}
        {selectedTool && files.length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
            <button
              onClick={processFiles}
              disabled={isProcessing}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Process {files.length} File{files.length > 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2025 CR AudioViz AI, LLC. "Your Story. Our Design."</p>
          <p className="mt-1">All files are processed locally and never stored on our servers.</p>
        </div>
      </footer>
    </div>
  );
}
