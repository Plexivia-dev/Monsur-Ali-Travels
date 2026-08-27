import React, { useState } from 'react';
import { X, Printer, FileCode, FileText, Check, Copy, Download, ExternalLink } from 'lucide-react';

export function ExportModal({ isOpen, onClose, documentTitle = 'Document', data = {}, elementId = 'printable-document-canvas' }) {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  if (!isOpen) return null;

  // 1. Native A4 Vector PDF Print
  const handlePrint = () => {
    onClose();
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // 2. Download JSON
  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${documentTitle.toLowerCase().replace(/\s+/g, '-')}-data.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 3. Download Standalone HTML
  const handleDownloadHtml = () => {
    const docElement = document.getElementById(elementId);
    if (!docElement) return;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${documentTitle} - Smart ERP Document</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      @page { size: A4 portrait; margin: 10mm; }
      body { margin: 0; padding: 0; background: white; }
    }
  </style>
</head>
<body class="bg-slate-100 min-h-screen p-8 flex justify-center text-slate-900">
  <div class="w-full max-w-[850px] bg-white p-10 shadow-xl">
    ${docElement.innerHTML}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${documentTitle.toLowerCase().replace(/\s+/g, '-')}-printable.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 4. Copy Plain Text / Summary
  const handleCopyText = () => {
    const textContent = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(textContent);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-foreground space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Export & Download Options
              </h2>
              <p className="text-xs text-muted-foreground">
                Select export format for "{documentTitle}"
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          
          {/* Option 1: Native Vector PDF Print */}
          <button
            onClick={handlePrint}
            className="flex items-start space-x-3 p-3.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-xl text-left transition-all cursor-pointer group"
          >
            <div className="p-2 bg-primary text-primary-foreground rounded-lg shadow-xs">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-foreground flex items-center gap-1">
                Save to PDF / Print (A4)
                <ExternalLink className="w-3 h-3 text-primary" />
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Crisp vector PDF output using browser A4 print engine.
              </p>
            </div>
          </button>

          {/* Option 2: Standalone HTML File */}
          <button
            onClick={handleDownloadHtml}
            className="flex items-start space-x-3 p-3.5 bg-muted/50 hover:bg-muted border border-border rounded-xl text-left transition-all cursor-pointer"
          >
            <div className="p-2 bg-purple-500/20 text-purple-500 rounded-lg">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-foreground">Download HTML File</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Self-contained printable webpage file.
              </p>
            </div>
          </button>

          {/* Option 3: JSON Data Schema */}
          <button
            onClick={handleDownloadJson}
            className="flex items-start space-x-3 p-3.5 bg-muted/50 hover:bg-muted border border-border rounded-xl text-left transition-all cursor-pointer"
          >
            <div className="p-2 bg-emerald-500/20 text-emerald-500 rounded-lg">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-foreground">Download JSON Data</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Raw JSON format for backup & REST APIs.
              </p>
            </div>
          </button>

          {/* Option 4: Copy Plain Text */}
          <button
            onClick={handleCopyText}
            className="flex items-start space-x-3 p-3.5 bg-muted/50 hover:bg-muted border border-border rounded-xl text-left transition-all cursor-pointer"
          >
            <div className="p-2 bg-amber-500/20 text-amber-500 rounded-lg">
              {copiedText ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </div>
            <div>
              <div className="font-bold text-foreground">
                {copiedText ? 'Copied Data!' : 'Copy Data Payload'}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Copy JSON payload to clipboard.
              </p>
            </div>
          </button>

        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-2 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold rounded-lg cursor-pointer transition-colors"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
}
