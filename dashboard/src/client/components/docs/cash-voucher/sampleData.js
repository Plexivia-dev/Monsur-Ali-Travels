/**
 * Cash Voucher (Cash Money Voucher) — Sample Data & Utilities
 */

// ─── Voucher Number Generator ────────────────────────────────────────────────
export function generateVoucherNo() {
  const date = new Date();
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const hex = Math.floor(0x1000 + Math.random() * 0xefff)
    .toString(16)
    .toUpperCase();
  return `MAT-KV-${yy}${mm}${hex}`;
}

// ─── QR Code URL ─────────────────────────────────────────────────────────────
export function generateVoucherQrUrl(voucherNo) {
  return `https://monsuralitravels.com/cash-voucher?q=${encodeURIComponent(voucherNo)}`;
}

// ─── Number → English Words ───────────────────────────────────────────────────
export function numberToWords(amount) {
  if (!amount || isNaN(amount) || Number(amount) <= 0) return '';
  const num = Math.floor(Number(amount));

  const units = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen',
    'Eighteen', 'Nineteen',
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertHundreds(n) {
    let str = '';
    if (n >= 100) { str += units[Math.floor(n / 100)] + ' Hundred '; n %= 100; }
    if (n >= 20)  { str += tens[Math.floor(n / 10)] + ' '; n %= 10; }
    if (n > 0)    { str += units[n] + ' '; }
    return str.trim();
  }

  let result = '';
  const crore   = Math.floor(num / 10000000); let rem = num % 10000000;
  const lakh     = Math.floor(rem / 100000);       rem = rem % 100000;
  const thousand = Math.floor(rem / 1000);          rem = rem % 1000;

  if (crore   > 0) result += convertHundreds(crore)    + ' Crore ';
  if (lakh    > 0) result += convertHundreds(lakh)     + ' Lakh ';
  if (thousand > 0) result += convertHundreds(thousand) + ' Thousand ';
  if (rem     > 0) result += convertHundreds(rem);

  result = result.trim();
  return result ? `${result} Taka Only` : '';
}

// ─── Number → Bengali Words ───────────────────────────────────────────────────
export function numberToWordsBn(amount) {
  if (!amount || isNaN(amount) || Number(amount) <= 0) return '';
  const num = Math.floor(Number(amount));

  const units = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ',
    'এগারো', 'বারো', 'তেরো', 'চোদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ'];
  const tens = ['', '', 'বিশ', 'ত্রিশ', 'চল্লিশ', 'পঞ্চাশ', 'ষাট', 'সত্তর', 'আশি', 'নব্বই'];

  function convertHundreds(n) {
    let str = '';
    if (n >= 100) { str += units[Math.floor(n / 100)] + ' শত '; n %= 100; }
    if (n >= 20)  { str += tens[Math.floor(n / 10)] + ' '; n %= 10; }
    if (n > 0)    { str += units[n] + ' '; }
    return str.trim();
  }

  let result = '';
  const crore   = Math.floor(num / 10000000); let rem = num % 10000000;
  const lakh     = Math.floor(rem / 100000);       rem = rem % 100000;
  const thousand = Math.floor(rem / 1000);          rem = rem % 1000;

  if (crore   > 0) result += convertHundreds(crore)    + ' কোটি ';
  if (lakh    > 0) result += convertHundreds(lakh)     + ' লক্ষ ';
  if (thousand > 0) result += convertHundreds(thousand) + ' হাজার ';
  if (rem     > 0) result += convertHundreds(rem);

  result = result.trim();
  return result ? `${result} টাকা মাত্র` : '';
}

// ─── Default Data ─────────────────────────────────────────────────────────────
export function getDefaultCashVoucherData() {
  const items = [
    { slNo: 1, descriptionBn: '', descriptionEn: '', amount: 0 },
  ];

  return {
    _id: null,
    voucherNo: generateVoucherNo(),
    voucherDate: new Date().toLocaleDateString('en-GB'), // DD/MM/YYYY
    qrCode: '',
    did: '',

    items,
    subtotal: 0,
    taxVat: 0,
    grandTotal: 0,
    grandTotalInWordsEn: '',
    grandTotalInWordsBn: '',

    // Signatures
    receivedBy: '',
    preparedBy: '',
    accountsSignature: '',
    accountsDesignation: '',

    notes: '',
  };
}
