import { createWorker } from 'tesseract.js';
import sharp from 'sharp';

const sampleImages = [
  'C:/Users/mdikr/.gemini/antigravity/brain/b57b9bd4-08da-4ccd-9411-8eb9066ded1f/.user_uploaded/media_1788719075923.jpg',
  'C:/Users/mdikr/.gemini/antigravity/brain/b57b9bd4-08da-4ccd-9411-8eb9066ded1f/.user_uploaded/media_1788719075929.webp',
  'C:/Users/mdikr/.gemini/antigravity/brain/b57b9bd4-08da-4ccd-9411-8eb9066ded1f/.user_uploaded/media_1788719075997.jpg'
];

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
 * Parses YYMMDD from MRZ
 */
function parseMrzDate(yymmdd, isDob = false) {
  if (!yymmdd || yymmdd.length < 6) return '';
  const cleaned = yymmdd.substring(0, 6).replace(/[ODQ]/g, '0').replace(/[IL]/g, '1').replace(/Z/g, '2').replace(/S/g, '5').replace(/[GB]/g, '8');
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
 * BD Passport Number check & correction
 * BD Passport format: 2 Letters followed by 7 Digits (e.g. BF0547103, BW0193203, AB8451089)
 */
function correctPassportNumber(raw) {
  if (!raw) return '';
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  // Find a 2-letter prefix followed by digits/similar chars
  const match = cleaned.match(/([A-Z]{2})([0-9A-Z]{7,8})/);
  if (match) {
    const letters = match[1];
    let digits = match[2]
      .replace(/[ODQ]/g, '0')
      .replace(/[IL]/g, '1')
      .replace(/Z/g, '2')
      .replace(/A/g, '4')
      .replace(/S/g, '5')
      .replace(/[GB]/g, '8');
    
    // If it has 8 chars due to double-read, trim
    return `${letters}${digits.substring(0, 7)}`;
  }
  return cleaned.substring(0, 9);
}

/**
 * Intelligent Bangladesh Passport Parser
 */
export async function readPassportDocument(filePathOrBuffer, worker) {
  const meta = await sharp(filePathOrBuffer).metadata();
  const width = meta.width;
  const height = meta.height;

  const extracted = {
    fullName: '',
    passportNumber: '',
    fatherName: '',
    dateOfBirth: '',
    passportExpiryDate: '',
    phone: '',
    address: '',
    sex: '',
  };

  // ─────────────────────────────────────────────────────────────
  // STEP 1: MRZ READING (Bottom ~30% with OCR-B whitelist)
  // ─────────────────────────────────────────────────────────────
  try {
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<',
      tessedit_pageseg_mode: '6',
    });

    const mrzTop = Math.floor(height * 0.70);
    const mrzHeight = height - mrzTop;

    const mrzBuf = await sharp(filePathOrBuffer)
      .extract({ left: 0, top: mrzTop, width, height: mrzHeight })
      .resize(Math.max(width * 2, 1600))
      .grayscale()
      .threshold(140)
      .toBuffer();

    const mrzOcr = await worker.recognize(mrzBuf);
    const mrzLines = mrzOcr.data.text
      .split('\n')
      .map((l) => l.trim().replace(/\s+/g, ''))
      .filter((l) => l.length >= 25);

    for (const line of mrzLines) {
      // 1. Line 1: P<BGD[SURNAME]<<[GIVEN_NAMES]
      if (line.includes('BGD') && (line.startsWith('P') || line.includes('P<'))) {
        // Strip prefix P<BGD or P<
        let lineBody = line.replace(/^P[<K1L][B86]GD/, '').replace(/^P[<K1L]/, '');
        // Replace 2 or more chevrons/fillers with separator '<<'
        lineBody = lineBody.replace(/[<K1LC]{2,}/g, '<<');
        const parts = lineBody.split('<<');
        if (parts.length >= 2) {
          const surname = parts[0].replace(/<+/g, ' ').replace(/[^A-Z\s]/g, '').trim();
          let given = parts[1].replace(/[<K1LC]{2,}.*$/, '').replace(/<+/g, ' ').replace(/[^A-Z\s]/g, '').trim();
          if (surname && given) {
            extracted.fullName = formatTitleCase(`${given} ${surname}`);
          } else if (given) {
            extracted.fullName = formatTitleCase(given);
          } else if (surname) {
            extracted.fullName = formatTitleCase(surname);
          }
        } else if (parts.length === 1) {
          const single = parts[0].replace(/[<K1LC]{2,}.*$/, '').replace(/<+/g, ' ').replace(/[^A-Z\s]/g, '').trim();
          if (single) extracted.fullName = formatTitleCase(single);
        }
      }

      // 2. Line 2: [PASSPORT_NO 9][CHECK][BGD][DOB 6][CHECK][SEX][EXPIRY 6]
      const bgdIndex = line.indexOf('BGD');
      if (bgdIndex >= 7) {
        // Characters before BGD contains passport number
        const rawPassPart = line.substring(0, bgdIndex);
        const passMatch = rawPassPart.match(/([A-Z]{2}[0-9A-Z]{7,9})/);
        if (passMatch) {
          extracted.passportNumber = correctPassportNumber(passMatch[1]);
        }

        // Characters after BGD
        const afterBgd = line.substring(bgdIndex + 3);
        // afterBgd format: [DOB 6][CHECK 1][SEX 1][EXPIRY 6]...
        if (afterBgd.length >= 14) {
          const rawDob = afterBgd.substring(0, 6);
          extracted.dateOfBirth = parseMrzDate(rawDob, true);

          const rawSex = afterBgd.charAt(7);
          if (rawSex === 'M' || rawSex === 'F') extracted.sex = rawSex;

          const rawExp = afterBgd.substring(8, 14);
          extracted.passportExpiryDate = parseMrzDate(rawExp, false);
        }
      }
    }
  } catch (mrzErr) {
    console.warn('MRZ read notice:', mrzErr.message);
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 2: TOP HALF (Emergency Contact / Personal Data Page 3)
  // ─────────────────────────────────────────────────────────────
  try {
    // Reset worker whitelist for standard English text
    await worker.setParameters({
      tessedit_char_whitelist: '',
      tessedit_pageseg_mode: '3',
    });

    const topHeight = Math.floor(height * 0.45);
    const topBuf = await sharp(filePathOrBuffer)
      .extract({ left: 0, top: 0, width, height: topHeight })
      .resize(Math.max(width * 2, 1600))
      .grayscale()
      .threshold(160)
      .toBuffer();

    const topOcr = await worker.recognize(topBuf);
    const text = topOcr.data.text;

    // Full name fallback or match
    const nameMatch = text.match(/\bName\s*[:;.]?\s*([A-Z\s]{4,40})/i);
    if (nameMatch) {
      const cand = nameMatch[1].split('\n')[0].replace(/[^A-Za-z\s]/g, '').trim();
      if (cand.length > 4 && !/father|mother|spouse|emergency|address|contact/i.test(cand)) {
        // If MRZ name was incomplete or empty, use this clear printed name!
        if (!extracted.fullName || extracted.fullName.split(' ').length < cand.split(' ').length) {
          extracted.fullName = formatTitleCase(cand);
        }
      }
    }

    // Father's Name: matches "Father's Name: ...", "Fathers Name: ...", "Pathers eine: ..."
    const fatherMatch = text.match(/[FP]athers?\s*(?:Name|Nome|eine|Nes)?\s*[:;.]?\s*([A-Z0-9\s]{4,40})/i);
    if (fatherMatch) {
      let cand = fatherMatch[1].split('\n')[0].replace(/[^A-Za-z\s]/g, '').trim();
      cand = cand.replace(/^34D\b/i, 'MD').replace(/^HD\b/i, 'MD').replace(/^I4D\b/i, 'MD');
      if (cand.length > 4 && !/mother|spouse|address|emergency/i.test(cand)) {
        extracted.fatherName = formatTitleCase(cand);
      }
    }

    // Phone / Telephone: "Telephone No: 01710893889", "01912226566", "+880..."
    const phoneMatch = text.match(/(?:Telephone|Phone|Mobile)\s*(?:No)?\s*[:;.]?\s*([0-9\s+]{10,18})/i) || text.match(/\b(01[3-9][0-9]{8})\b/) || text.match(/\b(8801[3-9][0-9]{8})\b/);
    if (phoneMatch) {
      let p = (phoneMatch[1] || phoneMatch[0]).replace(/[^0-9+]/g, '');
      if (p.startsWith('880')) p = `+${p}`;
      extracted.phone = p;
    }

    // Address
    const addrMatch = text.match(/Permanent\s*Address\s*[:;.]?\s*([^\n\r]{8,120})/i);
    if (addrMatch) {
      const cleanAddr = addrMatch[1].replace(/[:;]/g, '').replace(/\s+/g, ' ').trim();
      if (cleanAddr.length > 6) {
        extracted.address = formatTitleCase(cleanAddr);
      }
    }
  } catch (topErr) {
    console.warn('Top page read notice:', topErr.message);
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 3: MIDDLE BIO-PAGE AREA (Printed fields fallback)
  // ─────────────────────────────────────────────────────────────
  if (!extracted.passportNumber || !extracted.dateOfBirth || !extracted.fullName) {
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

      // Passport No
      if (!extracted.passportNumber) {
        const pm = midText.match(/\b([A-PR-WY][0-9]{7,8})\b/);
        if (pm) extracted.passportNumber = pm[1].toUpperCase();
      }

      // DOB
      if (!extracted.dateOfBirth) {
        const months = 'JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC';
        const dm = midText.match(new RegExp(`([0-3][0-9])\\s*(${months})\\s*(19[0-9]{2}|20[0-9]{2})`, 'i'));
        if (dm) {
          const monthMap = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
          extracted.dateOfBirth = `${dm[3]}-${monthMap[dm[2].toLowerCase()]}-${dm[1]}`;
        }
      }

      // Expiry
      if (!extracted.passportExpiryDate) {
        const months = 'JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC';
        const em = midText.match(new RegExp(`Date of Expiry[^0-9]*([0-3][0-9])\\s*(${months})\\s*(20[0-9]{2})`, 'i'));
        if (em) {
          const monthMap = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
          extracted.passportExpiryDate = `${em[3]}-${monthMap[em[2].toLowerCase()]}-${em[1]}`;
        }
      }
    } catch (midErr) {
      console.warn('Middle area read notice:', midErr.message);
    }
  }

  return extracted;
}

async function testAll() {
  const worker = await createWorker('eng');

  for (let i = 0; i < sampleImages.length; i++) {
    console.log(`\n=============================================================`);
    console.log(`Testing Sample ${i + 1}: ${sampleImages[i]}`);
    const res = await readPassportDocument(sampleImages[i], worker);
    console.log('Result:', JSON.stringify(res, null, 2));
  }

  await worker.terminate();
}

testAll().catch(console.error);
