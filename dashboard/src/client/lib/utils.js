import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatToBengaliDate(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return dateInput;
  return d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatToDdMmYyyy(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return dateInput;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
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


