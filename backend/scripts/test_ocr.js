import { createWorker } from 'tesseract.js';
import sharp from 'sharp';

const sampleImages = [
  'C:/Users/mdikr/.gemini/antigravity/brain/b57b9bd4-08da-4ccd-9411-8eb9066ded1f/.user_uploaded/media_1788719075923.jpg',
  'C:/Users/mdikr/.gemini/antigravity/brain/b57b9bd4-08da-4ccd-9411-8eb9066ded1f/.user_uploaded/media_1788719075929.webp',
  'C:/Users/mdikr/.gemini/antigravity/brain/b57b9bd4-08da-4ccd-9411-8eb9066ded1f/.user_uploaded/media_1788719075997.jpg'
];

/**
 * Clean OCR errors in MRZ characters
 */
function cleanMrzLine(str) {
  return str
    .toUpperCase()
    .replace(/[«\(\[\{\<]/g, '<')
    .replace(/[»\)\]\}]/g, '<')
    .replace(/\s+/g, '')
    .trim();
}

/**
 * Format string to Title Case (e.g. "MD SUHAG RAHMAN" -> "Md Suhag Rahman")
 */
function formatTitleCase(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Fix common OCR confusion between letters and digits in 9-character BD passport numbers
 * BD Passport format: 2 Letters followed by 7 Digits (e.g. "BF0547103", "BW0193203", "AB8451089")
 */
function correctPassportNumber(raw) {
  if (!raw || raw.length < 8) return raw;
  const chars = raw.trim().toUpperCase().split('');
  // First 2 should be letters
  for (let i = 0; i < 2; i++) {
    if (chars[i] === '0') chars[i] = 'O';
    else if (chars[i] === '1') chars[i] = 'I';
    else if (chars[i] === '8') chars[i] = 'B';
  }
  // Next 7 should be digits
  for (let i = 2; i < chars.length && i < 9; i++) {
    if (chars[i] === 'O' || chars[i] === 'D' || chars[i] === 'Q') chars[i] = '0';
    else if (chars[i] === 'I' || chars[i] === 'L' || chars[i] === 'T') chars[i] = '1';
    else if (chars[i] === 'Z') chars[i] = '2';
    else if (chars[i] === 'A') chars[i] = '4';
    else if (chars[i] === 'S') chars[i] = '5';
    else if (chars[i] === 'G' || chars[i] === 'B') chars[i] = '8';
  }
  return chars.slice(0, 9).join('');
}

/**
 * Fix digits in YYMMDD string
 */
function correctDigits(str) {
  if (!str) return str;
  return str
    .replace(/[ODQ]/g, '0')
    .replace(/[IL]/g, '1')
    .replace(/Z/g, '2')
    .replace(/S/g, '5')
    .replace(/[GB]/g, '8');
}

/**
 * Parses YYMMDD from MRZ
 */
function parseMrzDate(yymmdd, isDob = false) {
  if (!yymmdd || yymmdd.length < 6) return '';
  const cleaned = correctDigits(yymmdd.substring(0, 6));
  const yy = parseInt(cleaned.substring(0, 2), 10);
  const mm = cleaned.substring(2, 4);
  const dd = cleaned.substring(4, 6);

  const m = parseInt(mm, 10);
  const d = parseInt(dd, 10);
  if (isNaN(yy) || isNaN(m) || isNaN(d) || m < 1 || m > 12 || d < 1 || d > 31) return '';

  const currentYear = new Date().getFullYear();
  const currentYY = currentYear % 100;

  let fullYear;
  if (isDob) {
    fullYear = yy > currentYY ? 1900 + yy : 2000 + yy;
  } else {
    fullYear = yy <= currentYY + 20 ? 2000 + yy : 1900 + yy;
  }
  return `${fullYear}-${mm}-${dd}`;
}

/**
 * Clean OCR misread filler characters (< read as L, C, K, etc.) from name line
 */
function parseMrzName(line1) {
  // line1 looks like: P<BGD[SURNAME]<<[GIVEN_NAMES]...
  // First, strip P<BGD or P< or P
  let body = line1.replace(/^P[<K1L][B86]GD/, '').replace(/^P[<K1L]/, '');
  
  // Cut off trailing repeated filler (like <<<<< or <L<L<L or <C<C<C)
  // Split on double chevron '<<'
  // But sometimes '<K' or '<L' or '<C' was OCR'd instead of '<<'
  body = body.replace(/[<K1LC]{2,}/g, '<<');
  const doubleParts = body.split('<<');
  
  if (doubleParts.length >= 2) {
    const surname = doubleParts[0].replace(/<+/g, ' ').replace(/[^A-Z\s]/g, '').trim();
    // In given names, strip any trailing filler sequences
    let givenPart = doubleParts[1].replace(/[<K1LC]{2,}.*$/, ''); // cut off at trailing filler
    const givenNames = givenPart.replace(/<+/g, ' ').replace(/[^A-Z\s]/g, '').trim();

    if (surname && givenNames) {
      return formatTitleCase(`${givenNames} ${surname}`);
    } else if (givenNames) {
      return formatTitleCase(givenNames);
    } else if (surname) {
      return formatTitleCase(surname);
    }
  } else if (doubleParts.length === 1) {
    let clean = doubleParts[0].replace(/[<K1LC]{2,}.*$/, '').replace(/<+/g, ' ').replace(/[^A-Z\s]/g, '').trim();
    return formatTitleCase(clean);
  }
  return '';
}

export async function parsePassportScan(filePathOrBuffer, worker) {
  const meta = await sharp(filePathOrBuffer).metadata();
  const width = meta.width;
  const height = meta.height;

  let result = {
    fullName: '',
    passportNumber: '',
    fatherName: '',
    dateOfBirth: '',
    passportExpiryDate: '',
    phone: '',
    address: '',
    nidNumber: '',
    rawMrz: []
  };

  // ── Step 1: MRZ Parsing (Bottom 30%) ──
  const mrzTop = Math.floor(height * 0.70);
  const mrzHeight = height - mrzTop;

  for (const thresh of [140, 160, 120]) {
    try {
      const mrzBuf = await sharp(filePathOrBuffer)
        .extract({ left: 0, top: mrzTop, width, height: mrzHeight })
        .resize(Math.max(width * 2, 1600))
        .grayscale()
        .threshold(thresh)
        .toBuffer();

      const ocr = await worker.recognize(mrzBuf);
      const lines = ocr.data.text.split('\n').map(cleanMrzLine).filter(l => l.length >= 20);

      for (const line of lines) {
        // Check for Line 1 (P<BGD...)
        if (line.includes('BGD') && (line.startsWith('P') || line.includes('P<'))) {
          result.rawMrz.push(line);
          if (!result.fullName) {
            result.fullName = parseMrzName(line);
          }
        }

        // Check for Line 2 ([PASSPORT 9]...BGD...)
        const l2 = line.match(/([A-Z0-9]{8,10})[0-9<][B86]GD([0-9OIlS]{6})[0-9<][MF<]([0-9OIlS]{6})/);
        if (l2) {
          result.rawMrz.push(line);
          if (!result.passportNumber) {
            result.passportNumber = correctPassportNumber(l2[1]);
          }
          if (!result.dateOfBirth) {
            result.dateOfBirth = parseMrzDate(l2[2], true);
          }
          if (!result.passportExpiryDate) {
            result.passportExpiryDate = parseMrzDate(l2[3], false);
          }
        } else {
          // Fallback passport number check
          const pMatch = line.match(/\b([A-PR-WY][0-9OIlSZ]{7,8})\b/);
          if (pMatch && !result.passportNumber) {
            result.passportNumber = correctPassportNumber(pMatch[1]);
          }
        }
      }

      if (result.passportNumber && result.dateOfBirth) break;
    } catch (e) {
      console.warn('MRZ pass error:', e.message);
    }
  }

  // ── Step 2: Emergency Contact / Page 3 (Top 45%) ──
  try {
    const topHeight = Math.floor(height * 0.45);
    const topBuf = await sharp(filePathOrBuffer)
      .extract({ left: 0, top: 0, width, height: topHeight })
      .resize(Math.max(width * 2, 1600))
      .grayscale()
      .threshold(160)
      .toBuffer();

    const topOcr = await worker.recognize(topBuf);
    const text = topOcr.data.text;

    // Full name check if MRZ missed it
    if (!result.fullName) {
      const nm = text.match(/Name\s*[:;]\s*([A-Z\s]{4,40})/i);
      if (nm) {
        const cleaned = nm[1].split('\n')[0].replace(/[^A-Za-z\s]/g, '').trim();
        if (cleaned.length > 3 && !/father|mother|spouse|emergency|address/i.test(cleaned)) {
          result.fullName = formatTitleCase(cleaned);
        }
      }
    }

    // Father's Name (handles "Father's Name", "Fathers Name", "Pathers eine", "Fathers Nome")
    const fm = text.match(/[FP]athers?\s*(?:Name|Nome|eine|Nes)?\s*[:;.]?\s*([A-Z0-9\s]{4,40})/i);
    if (fm) {
      let cand = fm[1].split('\n')[0].replace(/[^A-Za-z\s]/g, '').trim();
      // Replace leading digit OCR like "34D" -> "MD"
      cand = cand.replace(/^34D\b/i, 'MD').replace(/^HD\b/i, 'MD').replace(/^I4D\b/i, 'MD');
      if (cand.length > 3 && !/mother|spouse|address|emergency/i.test(cand)) {
        result.fatherName = formatTitleCase(cand);
      }
    }

    // Telephone / Mobile
    const pm = text.match(/(?:Telephone|Phone|Mobile)\s*(?:No)?\s*[:;.]?\s*([0-9\s+]{10,18})/i) || text.match(/\b(01[3-9][0-9]{8})\b/) || text.match(/\b(8801[3-9][0-9]{8})\b/);
    if (pm) {
      let rawPhone = (pm[1] || pm[0]).replace(/[^0-9+]/g, '');
      if (rawPhone.startsWith('880')) rawPhone = `+${rawPhone}`;
      else if (rawPhone.startsWith('01')) rawPhone = rawPhone;
      result.phone = rawPhone;
    }

    // Permanent Address
    const am = text.match(/Permanent\s*Address\s*[:;.]?\s*([^\n\r]{10,120})/i);
    if (am) {
      result.address = formatTitleCase(am[1].replace(/[:;]/g, '').trim());
    }
  } catch (e) {
    console.warn('Top page read error:', e.message);
  }

  // ── Step 3: Bio-data Middle Zone (if anything still missing) ──
  if (!result.passportNumber || !result.dateOfBirth || !result.fullName) {
    try {
      const midTop = Math.floor(height * 0.40);
      const midHeight = Math.floor(height * 0.35);
      const midBuf = await sharp(filePathOrBuffer)
        .extract({ left: 0, top: midTop, width, height: midHeight })
        .resize(Math.max(width * 2, 1600))
        .grayscale()
        .normalize()
        .toBuffer();

      const midOcr = await worker.recognize(midBuf);
      const midText = midOcr.data.text;

      if (!result.passportNumber) {
        const pm = midText.match(/Passport\s*No\s*[:;.]?\s*([A-PR-WY][0-9]{7,8})/i) || midText.match(/\b([A-PR-WY][0-9]{7,8})\b/);
        if (pm) result.passportNumber = correctPassportNumber(pm[1]);
      }

      if (!result.dateOfBirth) {
        const months = 'JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC';
        const dm = midText.match(new RegExp(`([0-3][0-9])\\s*(${months})\\s*(19[0-9]{2}|20[0-9]{2})`, 'i'));
        if (dm) {
          const monthMap = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
          result.dateOfBirth = `${dm[3]}-${monthMap[dm[2].toLowerCase()]}-${dm[1]}`;
        }
      }

      if (!result.passportExpiryDate) {
        const months = 'JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC';
        const em = midText.match(new RegExp(`Date of Expiry[^0-9]*([0-3][0-9])\\s*(${months})\\s*(20[0-9]{2})`, 'i'));
        if (em) {
          const monthMap = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
          result.passportExpiryDate = `${em[3]}-${monthMap[em[2].toLowerCase()]}-${em[1]}`;
        }
      }
    } catch (e) {
      console.warn('Middle bio-data error:', e.message);
    }
  }

  return result;
}

async function run() {
  const worker = await createWorker('eng');
  for (let i = 0; i < sampleImages.length; i++) {
    console.log(`\n======================================================`);
    console.log(`Extracting Image ${i + 1}: ${sampleImages[i]}`);
    const res = await parsePassportScan(sampleImages[i], worker);
    console.log('Result:', JSON.stringify(res, null, 2));
  }
  await worker.terminate();
}

run().catch(console.error);
