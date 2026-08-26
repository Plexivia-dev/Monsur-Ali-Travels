import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** Format BDT currency */
export function formatBDT(amount) {
  if (amount >= 1_000_000) return `৳${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `৳${(amount / 1_000).toFixed(0)}k`;
  return `৳${amount.toLocaleString()}`;
}

/** Relative time string */
export function timeAgo(isoDate) {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const mins = Math.max(0, Math.floor(diffMs / 60_000));
  if (mins === 0) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(isoDate).toLocaleDateString('en-GB');
}

/** Truncate string */
export function truncate(str, max = 50) {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

/** Format DD/MM/YYYY */
export function formatToDdMmYyyy(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB'); // This gives DD/MM/YYYY format out of the box
}

/**
 * Extract document ID from any standard document data object
 */
export function getDocumentId(data) {
  if (!data || typeof data !== 'object') return '';
  return (
    data.verificationId ||
    data.agreementId ||
    data.invoiceNo ||
    data.slipNo ||
    data.applicationNo ||
    data.submissionNo ||
    data.receiptNo ||
    data.trackingNo ||
    data.tokenNo ||
    data.voucherNo ||
    data.certificateNo ||
    data.webFileNo ||
    data.caseNumber ||
    data.customId ||
    data.idNumber ||
    data.clientCode ||
    ''
  );
}

/**
 * Extract recipient/client/employee name from document data object
 */
export function getDocumentRecipientName(data) {
  if (!data || typeof data !== 'object') return '';
  return (
    data.clientInfo?.clientName ||
    data.client?.fullName ||
    data.client?.name ||
    data.applicantName ||
    data.employeeName ||
    data.parties?.employeeName ||
    data.clientName ||
    data.paidTo ||
    data.receivedBy ||
    data.candidateName ||
    data.groomName ||
    ''
  );
}

/**
 * Common utility to print or save PDF with the backend unique ID at the very beginning of the filename.
 */
export function printDocument({ docId, docType = '', clientName = '', data = null, extra = '' } = {}) {
  const originalTitle = document.title;

  const resolvedId = docId || (data ? getDocumentId(data) : '');
  const resolvedName = clientName || (data ? getDocumentRecipientName(data) : '');

  const cleanId = String(resolvedId || '').trim();
  const cleanType = String(docType || '').trim().replace(/[\s/\\:*?"<>|]+/g, '_');
  const cleanName = String(resolvedName || '').trim().replace(/[\s/\\:*?"<>|]+/g, '_');
  const cleanExtra = String(extra || '').trim().replace(/[\s/\\:*?"<>|]+/g, '_');

  const parts = [];
  if (cleanId) parts.push(cleanId);
  if (cleanType) parts.push(cleanType);
  if (cleanName) parts.push(cleanName);
  if (cleanExtra) parts.push(cleanExtra);

  const pdfFileName = parts.length > 0 ? parts.join('_') : 'Monsur_Ali_Travels_Document';

  try {
    document.title = pdfFileName;
    window.print();
  } finally {
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  }
}


