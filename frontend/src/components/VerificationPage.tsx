import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  Printer,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

export function VerificationPage() {
  const [queryId, setQueryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pathId = window.location.pathname.replace(/^\/verify\/?/, '').trim();
    const id = params.get('id') || params.get('identifier') || params.get('q') || (pathId && pathId !== 'verify' ? decodeURIComponent(pathId) : '');
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

  const resolvedName = result?.data?.clientName || result?.data?.applicantName || result?.data?.employeeName || result?.data?.name;
  const resolvedAmount = result?.data?.amount !== undefined ? result.data.amount : result?.data?.grandTotal;
  const resolvedRefNo = result?.data?.receiptNo || result?.data?.invoiceNo || result?.data?.caseNumber || result?.data?.agreementNumber || result?.data?.employeeCode;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black print:bg-white print:text-black">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 print:hidden">
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
      <main className="max-w-2xl w-full mx-auto px-4 py-8 sm:py-12 grow flex flex-col justify-center space-y-6 print:p-0 print:m-0 print:max-w-none">
        {/* Search Bar Box */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-4 print:hidden">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-white">Instant Registry Verification</h2>
            <p className="text-xs text-slate-400">
              Scan QR or enter Employee Code, Money Receipt #, Invoice #, Case ID, or Agreement # to verify authenticity.
            </p>
          </div>

          <form onSubmit={handleManualSearch} className="flex gap-2">
            <div className="relative grow">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={queryId}
                onChange={(e) => setQueryId(e.target.value)}
                placeholder="e.g. MR-2026-0012, INV-2026-0045, EMP-001..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !queryId.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify</span>}
            </button>
          </form>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex flex-col items-center justify-center p-12 bg-slate-900 border border-slate-800 rounded-2xl">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
            <p className="text-xs text-slate-400 font-mono">Querying central ledger & security seal...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl flex items-start gap-4">
            <XCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-red-400">Authentication Failed / Record Unverified</h3>
              <p className="text-xs text-red-300/80 mt-1">{error}</p>
              <p className="text-[11px] text-slate-400 mt-2">
                If you believe this is an error, please contact Monsur Ali Travels head office with the original physical document.
              </p>
            </div>
          </div>
        )}

        {/* Verification Success Card */}
        {result && !loading && (
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden print:border-black print:bg-white print:text-black">
            {/* Certificate Header Banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white flex items-center justify-between print:bg-none print:text-black print:border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
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
                className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition print:hidden"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>

            {/* Particulars Table */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 print:border-gray-200 pb-3">
                <span className="text-xs text-slate-400 print:text-gray-600">Verified System Entity:</span>
                <span className="text-xs font-bold text-white uppercase font-mono print:text-black">{result.data?.title || result.entityType}</span>
              </div>

              {resolvedRefNo && (
                <div className="flex items-center justify-between border-b border-slate-800 print:border-gray-200 pb-3">
                  <span className="text-xs text-slate-400 print:text-gray-600">Reference / Token ID:</span>
                  <span className="text-xs font-mono font-bold text-emerald-400 print:text-emerald-700">{resolvedRefNo}</span>
                </div>
              )}

              {resolvedName && (
                <div className="flex items-center justify-between border-b border-slate-800 print:border-gray-200 pb-3">
                  <span className="text-xs text-slate-400 print:text-gray-600">Subject / Beneficiary Name:</span>
                  <span className="text-xs font-bold text-emerald-400 print:text-black">{resolvedName}</span>
                </div>
              )}

              {result.data?.passportNumber && result.data.passportNumber !== '—' && (
                <div className="flex items-center justify-between border-b border-slate-800 print:border-gray-200 pb-3">
                  <span className="text-xs text-slate-400 print:text-gray-600">Passport Number:</span>
                  <span className="text-xs font-mono font-bold text-white print:text-black">{result.data.passportNumber}</span>
                </div>
              )}

              {result.data?.designation && (
                <div className="flex items-center justify-between border-b border-slate-800 print:border-gray-200 pb-3">
                  <span className="text-xs text-slate-400 print:text-gray-600">Designation / Role:</span>
                  <span className="text-xs font-semibold text-white print:text-black">{result.data.designation}</span>
                </div>
              )}

              {result.data?.department && (
                <div className="flex items-center justify-between border-b border-slate-800 print:border-gray-200 pb-3">
                  <span className="text-xs text-slate-400 print:text-gray-600">Department:</span>
                  <span className="text-xs font-semibold text-white print:text-black">{result.data.department}</span>
                </div>
              )}

              {resolvedAmount !== undefined && (
                <div className="flex items-center justify-between border-b border-slate-800 print:border-gray-200 pb-3">
                  <span className="text-xs text-slate-400 print:text-gray-600">Total Valuation / Amount:</span>
                  <span className="text-sm font-black text-emerald-400 print:text-black">
                    ৳{Number(resolvedAmount).toLocaleString()} {result.data.currency || 'BDT'} {result.data.paymentMethod ? `(${result.data.paymentMethod})` : ''}
                  </span>
                </div>
              )}

              {result.data?.serviceType && (
                <div className="flex items-center justify-between border-b border-slate-800 print:border-gray-200 pb-3">
                  <span className="text-xs text-slate-400 print:text-gray-600">Service Category:</span>
                  <span className="text-xs font-semibold text-white print:text-black">{result.data.serviceType}</span>
                </div>
              )}

              {result.data?.destinationCountry && (
                <div className="flex items-center justify-between border-b border-slate-800 print:border-gray-200 pb-3">
                  <span className="text-xs text-slate-400 print:text-gray-600">Target Destination:</span>
                  <span className="text-xs font-bold text-white print:text-black">{result.data.destinationCountry}</span>
                </div>
              )}

              {result.data?.status && (
                <div className="flex items-center justify-between border-b border-slate-800 print:border-gray-200 pb-3">
                  <span className="text-xs text-slate-400 print:text-gray-600">Record Status:</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase print:text-emerald-800 print:bg-emerald-50">
                    {result.data.status}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 print:text-gray-500">
                <span>Validation Timestamp:</span>
                <span className="font-mono">{new Date(result.data?.verifiedAt || Date.now()).toLocaleString()}</span>
              </div>
            </div>

            {/* Official Footer Guarantee */}
            <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 print:bg-gray-50 print:border-gray-200 print:text-black">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold print:text-emerald-700">
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
