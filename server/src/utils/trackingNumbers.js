/**
 * Generates unique Customer Code (e.g. CUST-104921)
 * @returns {string}
 */
export function generateCustomerCode() {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `CUST-${num}`;
}

/**
 * Generates unique Money Receipt / Payment Token No (e.g. MR-260820-4819)
 * @returns {string}
 */
export function generateReceiptTokenNo() {
  const date = new Date();
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `MR-${yy}${mm}${dd}-${randomSuffix}`;
}

/**
 * Generates unique Universal Case Number (e.g. GREECE-2026-4819 or CS-2026-4819)
 * @param {string} [caseType="GEN"]
 * @returns {string}
 */
export function generateCaseNumber(caseType = 'GEN') {
  const prefix = String(caseType).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'CS';
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${randomDigits}`;
}

/**
 * Generates unique Indian Visa Tracking Number (e.g. IVISA-AB1234C567)
 * @returns {string}
 */
export function generateUniqueIndianVisaTrackingNo() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const getChar = () => letters.charAt(Math.floor(Math.random() * letters.length));
  const num1 = Math.floor(1000 + Math.random() * 9000);
  const num2 = Math.floor(100 + Math.random() * 900);
  return `IVISA-${getChar()}${getChar()}${num1}${getChar()}${num2}`;
}

/**
 * Generates unique Passport Submission Tracking Number (e.g. PASS-AB1234C567)
 * @returns {string}
 */
export function generateUniquePassportTrackingNo() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const getChar = () => letters.charAt(Math.floor(Math.random() * letters.length));
  const num1 = Math.floor(1000 + Math.random() * 9000);
  const num2 = Math.floor(100 + Math.random() * 900);
  return `PASS-${getChar()}${getChar()}${num1}${getChar()}${num2}`;
}

/**
 * Generates unique Customer Guardian Application Number (e.g. CGA-AB-123456)
 * @returns {string}
 */
export function generateUniqueCustomerAppNo() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const getChar = () => letters.charAt(Math.floor(Math.random() * letters.length));
  const num = Math.floor(100000 + Math.random() * 900000);
  return `CGA-${getChar()}${getChar()}-${num}`;
}

/**
 * Generates unique Agreement ID (e.g. AGR-ABC84920)
 * @returns {string}
 */
export function generateUniqueAgreementId() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let alpha = '';
  for (let i = 0; i < 3; i++) {
    alpha += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `AGR-${alpha}${randomNum}`;
}

/**
 * Generates unique Salary Slip Number (e.g. SLIP-AB1234C567)
 * @returns {string}
 */
export function generateUniqueSlipNo() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const getChar = () => letters.charAt(Math.floor(Math.random() * letters.length));
  const num1 = Math.floor(1000 + Math.random() * 9000);
  const num2 = Math.floor(100 + Math.random() * 900);
  return `SLIP-${getChar()}${getChar()}${num1}${getChar()}${num2}`;
}

/**
 * Generates unique Invoice Number (e.g. I-AB1234C567)
 * @returns {string}
 */
export function generateUniqueInvoiceNo() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const getChar = () => letters.charAt(Math.floor(Math.random() * letters.length));
  const num1 = Math.floor(1000 + Math.random() * 9000);
  const num2 = Math.floor(100 + Math.random() * 900);
  return `I-${getChar()}${getChar()}${num1}${getChar()}${num2}`;
}
