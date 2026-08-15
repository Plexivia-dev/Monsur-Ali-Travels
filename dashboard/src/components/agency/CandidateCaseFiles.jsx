import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Globe2, 
  Building2, 
  Handshake, 
  FolderOpen, 
  FilePlus2, 
  User, 
  Briefcase, 
  Phone, 
  Mail, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  ShieldCheck, 
  X, 
  Download, 
  Upload, 
  Send
} from 'lucide-react';
import { toast } from 'sonner';

// Sample Candidate Case Files
const INITIAL_CASES = [
  {
    id: 'CASE-2026-001',
    fileNumber: 'MP-2026-8812',
    candidateName: 'Md. Rafiqul Islam',
    candidateAge: 29,
    candidateGender: 'Male',
    candidatePhone: '+8801712345678',
    candidateEmail: 'rafiqul.islam@gmail.com',
    passportNumber: 'A09823411',
    passportExpiry: '2029-08-15',
    tradeSkill: 'Heavy Equipment Operator',
    experienceYears: 6,
    destinationCountry: 'Saudi Arabia',
    destinationCountryCode: 'SA',
    destinationCity: 'Riyadh',
    workflowType: 'destination_partner',
    client: {
      name: 'Al-Bawardi Contracting',
      company: 'Al-Bawardi Group',
      country: 'Saudi Arabia',
      city: 'Riyadh',
      email: 'hr@albawardi.sa',
      phone: '+966114567890',
      contractRef: 'CONT-SA-8812'
    },
    destinationAgency: {
      agencyName: 'Gulf Horizon Recruitment Co.',
      country: 'Saudi Arabia',
      licenseNo: 'SA-LIC-4491',
      contactPerson: 'Tariq Al-Mansoor',
      email: 'tariq@gulfhorizon.sa',
      phone: '+966501234567',
      airportReceptionCity: 'Riyadh (RUH)'
    },
    currentStepId: 3,
    steps: [
      { id: 1, title: 'Candidate Profiling', status: 'completed', targetDays: 7, description: 'Skill verification & passport intake' },
      { id: 2, title: 'Client Selection', status: 'completed', targetDays: 10, description: 'CV submission & job offer signed' },
      { id: 3, title: 'Medical & Police Clearance', status: 'in_progress', targetDays: 14, description: 'GAMCA medical & PCC attestation' },
      { id: 4, title: 'Visa Stamping', status: 'pending', targetDays: 18, description: 'Embassy attestation & work permit' },
      { id: 5, title: 'Flight & Deployment', status: 'pending', targetDays: 5, description: 'Ticket issue & airport reception' }
    ],
    documents: [
      { id: 'doc-1', name: 'Original Passport', type: 'passport', fileName: 'passport_rafiqul.pdf', fileSize: '2.4 MB', uploadedAt: '2026-08-01', status: 'verified' },
      { id: 'doc-2', name: 'GAMCA Medical Fit Report', type: 'medical_fit', fileName: 'medical_report_fit.pdf', fileSize: '1.8 MB', uploadedAt: '2026-08-10', status: 'verified' },
      { id: 'doc-3', name: 'Police Clearance Certificate', type: 'police_clearance', fileName: 'pcc_mofa_attested.pdf', fileSize: '1.2 MB', uploadedAt: '2026-08-12', status: 'pending_review' }
    ],
    casePriority: 'high',
    expectedDeploymentDate: '2026-09-15',
    createdAt: '2026-08-01',
    internalNotes: 'Candidate passed Level-3 technical trade assessment in Dhaka.'
  },
  {
    id: 'CASE-2026-002',
    fileNumber: 'MP-2026-9104',
    candidateName: 'Kamrul Hasan',
    candidateAge: 32,
    candidateGender: 'Male',
    candidatePhone: '+8801819876543',
    candidateEmail: 'kamrul.hasan@gmail.com',
    passportNumber: 'B04419283',
    passportExpiry: '2030-03-22',
    tradeSkill: 'Industrial Electrician',
    experienceYears: 8,
    destinationCountry: 'UAE (Dubai)',
    destinationCountryCode: 'AE',
    destinationCity: 'Dubai',
    workflowType: 'direct_client',
    client: {
      name: 'Arabtec Engineering LLC',
      company: 'Arabtec Group',
      country: 'UAE',
      city: 'Dubai',
      email: 'recruitment@arabtec.ae',
      phone: '+97143219876',
      contractRef: 'CONT-UAE-9104'
    },
    currentStepId: 4,
    steps: [
      { id: 1, title: 'Candidate Profiling', status: 'completed', targetDays: 7, description: 'Skill verification & passport intake' },
      { id: 2, title: 'Client Selection', status: 'completed', targetDays: 10, description: 'CV submission & job offer signed' },
      { id: 3, title: 'Medical & Police Clearance', status: 'completed', targetDays: 14, description: 'GAMCA medical & PCC attestation' },
      { id: 4, title: 'Visa Stamping', status: 'in_progress', targetDays: 18, description: 'Embassy attestation & work permit' },
      { id: 5, title: 'Flight & Deployment', status: 'pending', targetDays: 5, description: 'Ticket issue & airport reception' }
    ],
    documents: [
      { id: 'doc-10', name: 'Original Passport', type: 'passport', fileName: 'passport_kamrul.pdf', fileSize: '3.1 MB', uploadedAt: '2026-07-20', status: 'verified' },
      { id: 'doc-11', name: 'Dubai Employment Visa', type: 'work_permit_visa', fileName: 'work_permit_dubai.pdf', fileSize: '1.5 MB', uploadedAt: '2026-08-14', status: 'verified' }
    ],
    casePriority: 'urgent',
    expectedDeploymentDate: '2026-09-01',
    createdAt: '2026-07-20',
    internalNotes: 'Direct corporate allocation for Dubai Metro expansion project.'
  },
  {
    id: 'CASE-2026-003',
    fileNumber: 'MP-2026-7731',
    candidateName: 'Sharmin Sultana',
    candidateAge: 27,
    candidateGender: 'Female',
    candidatePhone: '+8801612345678',
    candidateEmail: 'sharmin.sultana@gmail.com',
    passportNumber: 'EF9921043',
    passportExpiry: '2028-11-05',
    tradeSkill: 'Registered Nurse / Caregiver',
    experienceYears: 4,
    destinationCountry: 'Qatar',
    destinationCountryCode: 'QA',
    destinationCity: 'Doha',
    workflowType: 'outsourced_local',
    localAgency: {
      isOutsourced: true,
      subAgencyName: 'Sylhet Overseas Recruitment Agency',
      licenseNo: 'RL-1294',
      contactPerson: 'Mahbubur Rahman',
      email: 'info@sylhetoverseas.bd',
      phone: '+8801711998877',
      commissionAgreement: '15,000 BDT per candidate'
    },
    currentStepId: 2,
    steps: [
      { id: 1, title: 'Candidate Profiling', status: 'completed', targetDays: 7, description: 'Skill verification & passport intake' },
      { id: 2, title: 'Client Selection', status: 'in_progress', targetDays: 10, description: 'CV submission & job offer signed' },
      { id: 3, title: 'Medical & Police Clearance', status: 'pending', targetDays: 14, description: 'GAMCA medical & PCC attestation' },
      { id: 4, title: 'Visa Stamping', status: 'pending', targetDays: 18, description: 'Embassy attestation & work permit' },
      { id: 5, title: 'Flight & Deployment', status: 'pending', targetDays: 5, description: 'Ticket issue & airport reception' }
    ],
    documents: [
      { id: 'doc-20', name: 'Original Passport', type: 'passport', fileName: 'passport_sharmin.pdf', fileSize: '2.9 MB', uploadedAt: '2026-08-05', status: 'verified' },
      { id: 'doc-21', name: 'Nursing License & Degree', type: 'trade_certificate', fileName: 'nursing_degree_attested.pdf', fileSize: '4.2 MB', uploadedAt: '2026-08-06', status: 'verified' }
    ],
    casePriority: 'normal',
    expectedDeploymentDate: '2026-10-10',
    createdAt: '2026-08-05',
    internalNotes: 'Outsourced through Sylhet sub-agency partner.'
  }
];

export function CandidateCaseFiles() {
  const [cases, setCases] = useState(INITIAL_CASES);
  const [searchQuery, setSearchQuery] = useState('');
  const [workflowFilter, setWorkflowFilter] = useState('all');
  const [selectedCase, setSelectedCase] = useState(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New Case Form State
  const [newForm, setNewForm] = useState({
    candidateName: '',
    candidatePhone: '',
    candidateEmail: '',
    passportNumber: '',
    passportExpiry: '',
    tradeSkill: 'General Technician',
    destinationCountry: 'Saudi Arabia',
    destinationCity: 'Riyadh',
    workflowType: 'destination_partner',
    casePriority: 'normal'
  });

  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchesSearch = 
        c.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.fileNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.passportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tradeSkill.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.destinationCountry.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesWorkflow = workflowFilter === 'all' || c.workflowType === workflowFilter;
      return matchesSearch && matchesWorkflow;
    });
  }, [cases, searchQuery, workflowFilter]);

  const handleCreateCase = (e) => {
    e.preventDefault();
    if (!newForm.candidateName || !newForm.passportNumber) {
      toast.error('Candidate Name and Passport Number are required.');
      return;
    }

    const newCase = {
      id: `CASE-2026-${Math.floor(100 + Math.random() * 900)}`,
      fileNumber: `MP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      candidateName: newForm.candidateName,
      candidateAge: 28,
      candidateGender: 'Male',
      candidatePhone: newForm.candidatePhone || '+8801700000000',
      candidateEmail: newForm.candidateEmail || 'candidate@gmail.com',
      passportNumber: newForm.passportNumber,
      passportExpiry: newForm.passportExpiry || '2030-12-31',
      tradeSkill: newForm.tradeSkill,
      experienceYears: 5,
      destinationCountry: newForm.destinationCountry,
      destinationCountryCode: newForm.destinationCountry.includes('Saudi') ? 'SA' : newForm.destinationCountry.includes('UAE') ? 'AE' : 'QA',
      destinationCity: newForm.destinationCity,
      workflowType: newForm.workflowType,
      currentStepId: 1,
      steps: [
        { id: 1, title: 'Candidate Profiling', status: 'in_progress', targetDays: 7, description: 'Skill verification & passport intake' },
        { id: 2, title: 'Client Selection', status: 'pending', targetDays: 10, description: 'CV submission & job offer signed' },
        { id: 3, title: 'Medical & Police Clearance', status: 'pending', targetDays: 14, description: 'GAMCA medical & PCC attestation' },
        { id: 4, title: 'Visa Stamping', status: 'pending', targetDays: 18, description: 'Embassy attestation & work permit' },
        { id: 5, title: 'Flight & Deployment', status: 'pending', targetDays: 5, description: 'Ticket issue & airport reception' }
      ],
      documents: [
        { id: 'doc-new-1', name: 'Original Passport', type: 'passport', fileName: `${newForm.passportNumber}_copy.pdf`, fileSize: '2.1 MB', uploadedAt: new Date().toISOString().split('T')[0], status: 'pending_review' }
      ],
      casePriority: newForm.casePriority,
      expectedDeploymentDate: '2026-11-01',
      createdAt: new Date().toISOString().split('T')[0],
      internalNotes: 'Newly opened candidate case file.'
    };

    setCases([newCase, ...cases]);
    setIsNewModalOpen(false);
    toast.success(`Case File ${newCase.fileNumber} created successfully!`);
    setNewForm({
      candidateName: '',
      candidatePhone: '',
      candidateEmail: '',
      passportNumber: '',
      passportExpiry: '',
      tradeSkill: 'General Technician',
      destinationCountry: 'Saudi Arabia',
      destinationCity: 'Riyadh',
      workflowType: 'destination_partner',
      casePriority: 'normal'
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-sky-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-[11px] font-bold uppercase tracking-wider">
                Manpower Agency Module
              </span>
              <span className="text-xs text-sky-200/70">Candidate & Agent Workflow</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Globe2 className="w-6 h-6 text-sky-400" />
              Candidate Case Files & Agent Pipeline
            </h1>
            <p className="text-xs text-sky-100/80 max-w-2xl leading-relaxed">
              Track 5-stage deployment pipelines for overseas manpower candidates, manage destination agency allocations, local outsourced sub-agencies, and document verification vaults.
            </p>
          </div>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg hover:shadow-sky-500/25 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Candidate File
          </button>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search candidate name, passport, trade skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-muted/50 border border-border rounded-lg focus:outline-none focus:border-primary text-foreground"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <button
            onClick={() => setWorkflowFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              workflowFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            All Channels ({cases.length})
          </button>
          <button
            onClick={() => setWorkflowFilter('destination_partner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              workflowFilter === 'destination_partner' ? 'bg-sky-500/20 text-sky-500 border border-sky-500/30' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            Destination Partner
          </button>
          <button
            onClick={() => setWorkflowFilter('direct_client')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              workflowFilter === 'direct_client' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            Direct Corporate
          </button>
          <button
            onClick={() => setWorkflowFilter('outsourced_local')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              workflowFilter === 'outsourced_local' ? 'bg-purple-500/20 text-purple-500 border border-purple-500/30' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            Local Sub-Agency
          </button>
        </div>
      </div>

      {/* Case File Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCases.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelectedCase(c)}
            className="bg-card border border-border hover:border-sky-500/50 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-4 group"
          >
            {/* Header: File Ref & Workflow Tag */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <span className="text-[11px] font-mono font-bold text-sky-500">{c.fileNumber}</span>
                <h3 className="text-sm font-bold text-foreground group-hover:text-sky-500 transition-colors flex items-center gap-1.5">
                  {c.candidateName}
                </h3>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                c.workflowType === 'destination_partner' ? 'bg-sky-500/10 text-sky-500 border border-sky-500/20' :
                c.workflowType === 'direct_client' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                'bg-purple-500/10 text-purple-500 border border-purple-500/20'
              }`}>
                {c.workflowType.replace('_', ' ')}
              </span>
            </div>

            {/* Candidate Key Information */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-muted/40 p-2 rounded-lg">
                <span className="text-[10px] text-muted-foreground block font-medium">Trade Skill</span>
                <span className="font-semibold text-foreground truncate block">{c.tradeSkill}</span>
              </div>
              <div className="bg-muted/40 p-2 rounded-lg">
                <span className="text-[10px] text-muted-foreground block font-medium">Destination</span>
                <span className="font-semibold text-foreground truncate block">{c.destinationCountry}</span>
              </div>
              <div className="bg-muted/40 p-2 rounded-lg">
                <span className="text-[10px] text-muted-foreground block font-medium">Passport No.</span>
                <span className="font-mono font-semibold text-foreground truncate block">{c.passportNumber}</span>
              </div>
              <div className="bg-muted/40 p-2 rounded-lg">
                <span className="text-[10px] text-muted-foreground block font-medium">Deployment Target</span>
                <span className="font-semibold text-foreground truncate block">{c.expectedDeploymentDate}</span>
              </div>
            </div>

            {/* Pipeline Stage Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground font-medium">Current Stage:</span>
                <span className="font-bold text-sky-500">Stage {c.currentStepId} of 5</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden flex">
                {c.steps.map((st) => (
                  <div
                    key={st.id}
                    className={`h-full flex-1 border-r border-background ${
                      st.status === 'completed' ? 'bg-emerald-500' :
                      st.status === 'in_progress' ? 'bg-sky-500 animate-pulse' :
                      'bg-muted-foreground/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Footer Action CTA */}
            <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border/40">
              <span className="text-[10px]">Created: {c.createdAt}</span>
              <span className="text-sky-500 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                View Dossier <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Case File Detail Dossier Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-card border border-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 p-6 relative">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-500 font-mono text-xs font-bold">
                    {selectedCase.fileNumber}
                  </span>
                  <span className="text-xs text-muted-foreground">ID: {selectedCase.id}</span>
                </div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mt-1">
                  {selectedCase.candidateName}
                  <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {selectedCase.candidateAge} Yrs | {selectedCase.candidateGender}
                  </span>
                </h2>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 5-Step Pipeline View */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Deployment Pipeline Status
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {selectedCase.steps.map((st) => (
                  <div
                    key={st.id}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      st.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' :
                      st.status === 'in_progress' ? 'bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400' :
                      'bg-muted/40 border-border text-muted-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>Step {st.id}</span>
                      {st.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> :
                       st.status === 'in_progress' ? <Clock className="w-3.5 h-3.5 text-sky-500 animate-spin" /> :
                       <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />}
                    </div>
                    <p className="font-semibold text-[11px] truncate">{st.title}</p>
                    <p className="text-[10px] opacity-80 leading-tight">{st.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Vault */}
            <div className="space-y-3 border-t border-border pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Verified Document Vault ({selectedCase.documents.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedCase.documents.map((doc) => (
                  <div key={doc.id} className="bg-muted/30 border border-border p-3 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-5 h-5 text-sky-500" />
                      <div>
                        <p className="font-bold text-foreground">{doc.name}</p>
                        <p className="text-[10px] text-muted-foreground">{doc.fileName} • {doc.fileSize}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-500/15 text-emerald-500">
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-border pt-4 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Internal Notes: {selectedCase.internalNotes}</span>
              <button
                onClick={() => {
                  toast.success(`Dossier PDF report exported for ${selectedCase.candidateName}`);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Download className="w-4 h-4" /> Export Candidate Dossier PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Candidate Case File Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <form onSubmit={handleCreateCase} className="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <FilePlus2 className="w-5 h-5 text-sky-500" />
                New Manpower Candidate File
              </h3>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 rounded text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Candidate Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Md. Tanvir Hossain"
                  value={newForm.candidateName}
                  onChange={(e) => setNewForm({ ...newForm, candidateName: e.target.value })}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+88017..."
                    value={newForm.candidatePhone}
                    onChange={(e) => setNewForm({ ...newForm, candidatePhone: e.target.value })}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">Passport Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A09812345"
                    value={newForm.passportNumber}
                    onChange={(e) => setNewForm({ ...newForm, passportNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Trade / Skill Category</label>
                <select
                  value={newForm.tradeSkill}
                  onChange={(e) => setNewForm({ ...newForm, tradeSkill: e.target.value })}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground"
                >
                  <option value="Heavy Equipment Operator">Heavy Equipment Operator</option>
                  <option value="Industrial Electrician">Industrial Electrician</option>
                  <option value="Registered Nurse / Caregiver">Registered Nurse / Caregiver</option>
                  <option value="Duct Fabricator & HVAC Tech">Duct Fabricator & HVAC Tech</option>
                  <option value="Pipe Welder (6G)">Pipe Welder (6G)</option>
                  <option value="General Mason & Plasterer">General Mason & Plasterer</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">Destination Country</label>
                  <select
                    value={newForm.destinationCountry}
                    onChange={(e) => setNewForm({ ...newForm, destinationCountry: e.target.value })}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground"
                  >
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="UAE (Dubai)">UAE (Dubai)</option>
                    <option value="Qatar">Qatar</option>
                    <option value="Oman">Oman</option>
                    <option value="Malaysia">Malaysia</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">Workflow Channel</label>
                  <select
                    value={newForm.workflowType}
                    onChange={(e) => setNewForm({ ...newForm, workflowType: e.target.value })}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground"
                  >
                    <option value="destination_partner">Destination Partner</option>
                    <option value="direct_client">Direct Corporate Client</option>
                    <option value="outsourced_local">Local Sub-Agency</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-3 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg shadow-md cursor-pointer"
              >
                Create Candidate Case File
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
