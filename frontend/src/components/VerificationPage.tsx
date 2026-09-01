import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  Building2,
  Calendar,
  User,
  CreditCard,
  FileText,
  Clock,
  Printer,
  ArrowLeft,
  Loader2,
  Award,
} from 'lucide-react';

export function VerificationPage() {
  const [queryId, setQueryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || params.get('identifier') || params.get('q');
    if (id) {
      setQueryId(id);
      fetchVerification(id);
    }
  }, []);

  const fetchVerification = async (idToVerify: string) => {
    if (!idToVerify.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const apiBase = import.meta.env.VITE_API_URL || 'https://api.monsuralitravels.com';

    try {
      const response = await fetch(`${apiBase}/api/v1/qr/verify/${encodeURIComponent(idToVerify.trim())}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data);
      } else {
        setError(data.message || 'Record not found in central official registry.');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setError('Unable to connect to verification server. Please check internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVerification(queryId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white uppercase">
                Monsur Ali Travels
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                Official Digital Certificate & Document Verification Portal
              </p>
            </div>
          </div>

          <a
            href="/"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Main Site</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl w-full mx-auto px-4 py-8 sm:py-12 grow flex flex-col justify-center space-y-6">
        {/* Search Bar Box */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-white">Instant Registry Verification</h2>
            <p className="text-xs text-slate-400">
              Scan QR or enter Employee Code, Money Receipt #, Case ID, or Agreement # to verify authenticity.
            </p>
          </div>

          <form onSubmit={handleManualSearch} className="flex gap-2">
            <div className="relative grow">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. EMP-001, MR-260819-4829, or CASE-2026-089"
                value={queryId}
                onChange={(e) => setQueryId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>Verify</span>
            </button>
          </form>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-emerald-500" />
            <p className="text-xs text-slate-400 font-semibold">Authenticating digital signature against master registry...</p>
          </div>
        )}

        {/* Error Result */}
        {error && !loading && (
          <div className="bg-rose-500/10 border border-rose-500/30 p-6 rounded-2xl text-center space-y-3 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <XCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-300">Authentication Failed</h3>
              <p className="text-xs text-slate-400 mt-1">{error}</p>
            </div>
            <div className="text-[11px] text-slate-500 border-t border-slate-800 pt-3">
              If you believe this is in error, please contact Monsur Ali Travels Head Office at <strong>info@monsuralitravels.com</strong>.
            </div>
          </div>
        )}

        {/* Verified Result Card */}
        {result && result.verified && !loading && (
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Top Seal Badge */}
            <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">
                    Official Verification Confirmed
                  </h3>
                  <p className="text-[11px] text-emerald-100 font-medium">
                    {result.entityType || 'Authenticated Document Record'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>

            {/* Particulars Table */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs text-slate-400">Verified System Entity:</span>
                <span className="text-xs font-bold text-white uppercase font-mono">{result.data?.title || result.entityType}</span>
              </div>

              {result.data?.name && (
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs text-slate-400">Officer / Candidate Name:</span>
                  <span className="text-xs font-bold text-emerald-400">{result.data.name}</span>
                </div>
              )}

              {result.data?.employeeCode && (
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs text-slate-400">Employee ID Code:</span>
                  <span className="text-xs font-mono font-bold text-white">{result.data.employeeCode}</span>
                </div>
              )}

              {result.data?.designation && (
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs text-slate-400">Designation / Role:</span>
                  <span className="text-xs font-semibold text-white">{result.data.designation}</span>
                </div>
              )}

              {result.data?.department && (
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs text-slate-400">Department:</span>
                  <span className="text-xs font-semibold text-white">{result.data.department}</span>
                </div>
              )}

              {result.data?.receiptNo && (
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs text-slate-400">Money Receipt Token #:</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{result.data.receiptNo}</span>
                </div>
              )}

              {result.data?.clientName && (
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs text-slate-400">Applicant / Client Name:</span>
                  <span className="text-xs font-bold text-white">{result.data.clientName}</span>
                </div>
              )}

              {result.data?.amount !== undefined && (
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs text-slate-400">Payment Amount:</span>
                  <span className="text-sm font-black text-emerald-400">
                    ৳{Number(result.data.amount).toLocaleString()} {result.data.currency || 'BDT'} ({result.data.paymentMethod || 'Cash'})
                  </span>
                </div>
              )}

              {result.data?.serviceType && (
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs text-slate-400">Service Category:</span>
                  <span className="text-xs font-semibold text-white">{result.data.serviceType}</span>
                </div>
              )}

              {result.data?.caseNumber && (
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs text-slate-400">Case Dossier Reference:</span>
                  <span className="text-xs font-mono font-bold text-sky-400">{result.data.caseNumber}</span>
                </div>
              )}

              {result.data?.destinationCountry && (
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs text-slate-400">Target Destination:</span>
                  <span className="text-xs font-bold text-white">{result.data.destinationCountry}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                <span>Validation Timestamp:</span>
                <span className="font-mono">{new Date(result.data?.verifiedAt || Date.now()).toLocaleString()}</span>
              </div>
            </div>

            {/* Official Footer Guarantee */}
            <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                Digitally Sealed by Monsur Ali Travels Security
              </span>
              <span>100% Authentic Record</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default VerificationPage;
