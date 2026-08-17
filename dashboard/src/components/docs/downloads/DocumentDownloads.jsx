import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, FolderDown, Search, CheckCircle, ExternalLink, HardDrive, ShieldCheck, FileCheck } from 'lucide-react';

export function DocumentDownloads() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [downloadingId, setDownloadingId] = useState(null);

  // Available Backup & Server Template Files
  const documentFiles = [
    {
      id: 1,
      title: 'Indian Visa Application Requirement Form',
      description: 'ইন্ডিয়ান ভিসা আবেদনের জন্য প্রয়োজনীয় কাগজপত্র, বিদ্যুৎ বিল, ব্যাংক স্টেটমেন্ট ও ছবির অফিশিয়াল নির্দেশাবলী।',
      category: 'visa',
      fileSize: '1.2 MB',
      fileType: 'PDF',
      updatedAt: '2026-08-15',
      downloadUrl: '/documents/Indian_Visa_Application_Requirement.pdf',
      downloadCount: 342
    },
    {
      id: 2,
      title: 'Passport Submission Requirement Checklist',
      description: 'পাসপোর্ট নতুন আবেদন ও নবায়নের এনআইডি, আবেদনকারী ও অভিভাবকের তথ্যাবলী সম্বলিত ফরম্যাট।',
      category: 'passport',
      fileSize: '890 KB',
      fileType: 'PDF',
      updatedAt: '2026-08-14',
      downloadUrl: '/documents/Passport_Submission_Requirements.pdf',
      downloadCount: 512
    },
    {
      id: 3,
      title: 'BMET Manpower Clearance Guidelines & Form',
      description: 'বিএমইটি (BMET) ম্যানপাওয়ার স্মার্ট কার্ড ও বায়োমেট্রিক ফিঙ্গারপ্রিন্ট চেকলিস্ট ফরম্যাট।',
      category: 'manpower',
      fileSize: '2.1 MB',
      fileType: 'PDF',
      updatedAt: '2026-08-10',
      downloadUrl: '/documents/BMET_Manpower_Clearance_Guidelines.pdf',
      downloadCount: 218
    },
    {
      id: 4,
      title: 'Overseas Employment Agreement Contract Template',
      description: 'বৈদেশিক কর্মসংস্থান নিয়োগকর্তা ও কর্মীর মধ্যকার দ্বিপাক্ষিক অফিশিয়াল এগ্রিমেন্ট টেম্পলেট।',
      category: 'legal',
      fileSize: '1.5 MB',
      fileType: 'DOCX',
      updatedAt: '2026-08-08',
      downloadUrl: '/documents/Employment_Agreement_Contract_Template.docx',
      downloadCount: 184
    },
    {
      id: 5,
      title: 'Client Billing & Invoice Master Template',
      description: 'ম্যানপাওয়ার এজেন্সি প্রসেসিং ফি ও কন্টাক্টর পেমেন্ট ইনভয়েস মাস্টার এক্সেল স্প্রেডশীট।',
      category: 'invoice',
      fileSize: '450 KB',
      fileType: 'XLSX',
      updatedAt: '2026-08-05',
      downloadUrl: '/documents/Client_Invoice_Master_Template.xlsx',
      downloadCount: 429
    },
    {
      id: 6,
      title: 'Candidate Character Certificate Format Template',
      description: 'ওয়ার্ক পারমিট ক্যান্ডিডেটের চারিত্রিক সনদপত্র বাংলা ও ইংরেজি প্রিন্ট ফরম্যাট।',
      category: 'legal',
      fileSize: '620 KB',
      fileType: 'PDF',
      updatedAt: '2026-08-01',
      downloadUrl: '/documents/Candidate_Character_Certificate_Format.pdf',
      downloadCount: 295
    }
  ];

  const categories = [
    { id: 'all', name: 'All Documents' },
    { id: 'visa', name: 'Visa Forms' },
    { id: 'passport', name: 'Passport Forms' },
    { id: 'manpower', name: 'Manpower Forms' },
    { id: 'legal', name: 'Contracts & Legal' },
    { id: 'invoice', name: 'Invoices & Billing' }
  ];

  const filteredFiles = documentFiles.filter((file) => {
    const matchesSearch = file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          file.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDownload = (file) => {
    setDownloadingId(file.id);

    try {
      // Create document text content featuring official agency address and contact info
      const docContent = `====================================================================
MONSUR ALI TOURS & TRAVELS (MONSUR ALI TRAVELS)
Government Approved Overseas Manpower & Passport Processing Agency (RL-1842)
--------------------------------------------------------------------
Head Office: Nadampur, Jagannathpur, Sunamganj - 3060, Sylhet, Bangladesh
Phone / WhatsApp: +8801345579534
Email: monsuralitravels@gmail.com | Web: www.monsuralitravels.com
====================================================================

DOCUMENT TITLE: ${file.title}
CATEGORY: ${file.category.toUpperCase()}
UPDATED DATE: ${file.updatedAt}

DESCRIPTION:
${file.description}

--------------------------------------------------------------------
OFFICIAL INSTRUCTIONS & REQUIREMENTS:
1. Ensure all candidate documents match NID / Birth Certificate exactly.
2. Submit original passport copies along with recent lab print photos.
3. For support, contact office at Nadampur, Jagannathpur, Sunamganj - 3060, Sylhet.

Authorized Signature
Monsur Ali Tours & Travels Processing Cell
====================================================================`;

      const blob = new Blob([docContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${file.title.replace(/\s+/g, '_')}_Monsur_Ali_Travels.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setTimeout(() => {
        setDownloadingId(null);
      }, 1000);
    }
  };

  return (
    <div className="space-y-6">

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border p-4 rounded-xl">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-muted/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFiles.map((file) => (
          <div
            key={file.id}
            className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between hover:border-primary/50 transition-all shadow-xs group"
          >
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {file.fileType} • {file.fileSize}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  Downloads: {file.downloadCount}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                {file.title}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-3 leading-relaxed">
                {file.description}
              </p>
            </div>

            {/* Footer Action */}
            <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-mono">
                Updated: {file.updatedAt}
              </span>

              <button
                onClick={() => handleDownload(file)}
                disabled={downloadingId === file.id}
                className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs"
              >
                {downloadingId === file.id ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 animate-spin" />
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Direct Download</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
