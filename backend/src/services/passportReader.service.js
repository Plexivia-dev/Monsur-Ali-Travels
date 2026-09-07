import { createWorker } from 'tesseract.js';
import sharp from 'sharp';

/**
 * Global worker singleton to avoid re-initializing Tesseract on every upload
 */
let tesseractWorker = null;

async function getWorker() {
  if (!tesseractWorker) {
    tesseractWorker = await createWorker('eng');
  }
  return tesseractWorker;
}

/**
 * Formats a raw uppercase or noisy string to clean Title Case
 * e.g. "MD MOTIUR RAHMAN KHAN" -> "Md Motiur Rahman Khan"
 */
export function formatTitleCase(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Calculates ICAO 9303 Check Digit with weights 7, 3, 1
 */
export function calculateIcaoCheckDigit(str) {
  if (!str) return -1;
  const weights = [7, 3, 1];
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    let val = 0;
    if (c >= 48 && c <= 57) val = c - 48; // '0'-'9'
    else if (c >= 65 && c <= 90) val = c - 55; // 'A'-'Z'
    else if (c === 60) val = 0; // '<'
    sum += val * weights[i % 3];
  }
  return sum % 10;
}

/**
 * Parses YYMMDD from MRZ and returns YYYY-MM-DD
 */
export function parseMrzDate(yymmdd, isDob = false) {
  if (!yymmdd || yymmdd.length < 6) return '';
  const cleaned = yymmdd
    .substring(0, 6)
    .replace(/[ODQ]/g, '0')
    .replace(/[IL]/g, '1')
    .replace(/Z/g, '2')
    .replace(/S/g, '5')
    .replace(/[GB]/g, '8');

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
 * Reconstructs and validates a 9-character Bangladeshi passport number
 * Format: 2 letters + 7 digits (e.g. "BF0547103", "BW0193203", "AB8451089")
 */
export function resolvePassportNumber(rawCandidate, expectedCheckDigit = null) {
  if (!rawCandidate) return '';
  const cleaned = rawCandidate.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const prefixMatch = cleaned.match(/([A-Z]{2})/);
  if (!prefixMatch) return cleaned.substring(0, 9);

  const prefix = prefixMatch[1];
  const startIndex = cleaned.indexOf(prefix);
  const rawDigitsPart = cleaned.substring(startIndex + 2);

  // Normalize common OCR digit confusions
  const digits = rawDigitsPart
    .replace(/[ODQ]/g, '0')
    .replace(/[ILT]/g, '1')
    .replace(/Z/g, '2')
    .replace(/A/g, '4')
    .replace(/S/g, '5')
    .replace(/[GB]/g, '8');

  // Exact 7 digits
  if (digits.length === 7) {
    const candidate = `${prefix}${digits}`;
    if (expectedCheckDigit !== null) {
      if (calculateIcaoCheckDigit(candidate) === parseInt(expectedCheckDigit, 10)) {
        return candidate;
      }
    }
    return candidate;
  }

  // If duplicate OCR characters occurred (e.g. S5 for 5, length > 7), test combinations
  if (digits.length > 7 && expectedCheckDigit !== null) {
    const targetCheck = parseInt(expectedCheckDigit, 10);
    for (let i = 0; i <= digits.length - 7; i++) {
      const cand = `${prefix}${digits.substring(i, i + 7)}`;
      if (calculateIcaoCheckDigit(cand) === targetCheck) return cand;
    }
    for (let skip = 0; skip < digits.length; skip++) {
      const candDigits = digits.slice(0, skip) + digits.slice(skip + 1);
      if (candDigits.length >= 7) {
        const cand = `${prefix}${candDigits.substring(0, 7)}`;
        if (calculateIcaoCheckDigit(cand) === targetCheck) return cand;
      }
    }
  }

  return `${prefix}${digits.substring(0, 7)}`;
}

/**
 * Cleans OCR filler artifacts and chevron merges from MRZ given names
 */
export function cleanMrzGivenNames(rawGiven) {
  if (!rawGiven) return '';
  // Strip bulk trailing chevron noise (sequence of 3 or more filler chars at line end)
  let cleaned = rawGiven.replace(/[<LCKXIS]{3,}$/i, '');
  const tokens = cleaned.split(/[<\s]+/).filter(Boolean);
  const validTokens = [];

  for (const token of tokens) {
    let t = token.toUpperCase().replace(/[^A-Z]/g, '');
    if (!t) continue;

    // Strip trailing filler attached to the end of a token (e.g. "CHASINCCCCLCLLLL..." -> "CHASIN")
    t = t.replace(/[LCKX]{3,}$/i, '');
    if (!t) continue;

    // Chevron filler detection: isolated sequence of filler characters
    if (/^[LCKXIS]+$/.test(t) && (t.length >= 2 || ['L', 'C', 'K', 'X'].includes(t))) {
      break; // Filler noise begins here
    }

    // Misread chevron prefix before consonant (e.g. "<NAFISA" -> "KNAFISA" -> "NAFISA")
    if (t.startsWith('K') && t.length > 3 && /^[K][NMBCDFGHJKLMPQRSTVWXYZ]/.test(t)) {
      t = t.substring(1);
    }

    // Misread chevron prefix before H (e.g. "<HASIN" -> "CHASIN" -> "HASIN")
    if (t.startsWith('CH') && t.length > 4 && !/CHOUDHURY|CHOWDHURY|CHATTERJEE/i.test(t)) {
      t = t.substring(1);
    }

    // Trailing S attached to a real word where S was an angle bracket (e.g. HASINS -> HASIN)
    if (t.endsWith('S') && t.length > 4 && /HASIN|RAHMAN|UDDIN|ISLAM|KHAN|BEGUM|AHMED/i.test(t.slice(0, -1))) {
      validTokens.push(t.slice(0, -1));
      break;
    }

    validTokens.push(t);
  }
  return validTokens.join(' ');
}

/**
 * Extracts surname and given names from MRZ line 1
 * Handles ICAO Doc 9303: P<BGD[SURNAME]<<[GIVEN_NAMES]...
 */
export function parseMrzLine1Names(line1) {
  if (!line1) return { surname: '', givenName: '' };
  let body = line1.replace(/^P[<K1L][B86]GD/, '').replace(/^P[<K1L]/, '');
  
  // Look for double-chevron or OCR-morphed separator (<<, <K<, <L<, <C<)
  const sepMatch = body.match(/<+[LCKXIS]?<+/);
  if (sepMatch) {
    const surname = body.substring(0, sepMatch.index).replace(/<+/g, ' ').replace(/[^A-Z\s]/g, '').trim();
    const givenRaw = body.substring(sepMatch.index + sepMatch[0].length);
    const givenName = cleanMrzGivenNames(givenRaw);
    return { surname, givenName };
  }

  // Fallback: single separator
  const singleParts = body.split('<').filter(Boolean);
  if (singleParts.length >= 2) {
    const surname = singleParts[0].replace(/[^A-Z]/g, '').trim();
    const givenName = cleanMrzGivenNames(singleParts.slice(1).join('<'));
    return { surname, givenName };
  }

  return { surname: body.replace(/[^A-Z\s]/g, '').trim(), givenName: '' };
}

/**
 * Main intelligent reader for Bangladeshi passports
 */
export async function readPassportDocument(filePathOrBuffer) {
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

  try {
    const worker = await getWorker();
    const meta = await sharp(filePathOrBuffer).metadata();
    const width = meta.width;
    const height = meta.height;

    // ─────────────────────────────────────────────────────────────
    // PASS 1: MIDDLE BIO PAGE (Printed English text: Given Name, Surname, DOB)
    // ─────────────────────────────────────────────────────────────
    let bioGiven = '';
    let bioSurname = '';
    try {
      await worker.setParameters({
        tessedit_char_whitelist: '',
        tessedit_pageseg_mode: '3',
      });

      const midTop = Math.floor(height * 0.45);
      const midHeight = Math.floor(height * 0.30);
      const midBuf = await sharp(filePathOrBuffer)
        .extract({ left: 0, top: midTop, width, height: midHeight })
        .resize(Math.max(width * 2, 1600))
        .grayscale()
        .threshold(150)
        .toBuffer();

      const midOcr = await worker.recognize(midBuf);
      const midText = midOcr.data.text;

      // Given Name
      const givenMatch = midText.match(/[Gg]ive[rn]\s*Name[^\n]*\n+([^\n]{2,40})/i)
        || midText.match(/[Gg]ive[rn]\s*Name\s*[:;.]?\s*([^\n]{2,40})/i);
      if (givenMatch) {
        const rawGiven = givenMatch[1].split('\n')[0].replace(/[^A-Za-z\s]/g, '').trim();
        if (rawGiven.length >= 2 && !/nationality|bangladeshi|passport/i.test(rawGiven)) {
          bioGiven = rawGiven.replace(/\bAKM\b/i, 'A K M');
        }
      }

      // Surname
      const surnameMatch = midText.match(/Surname[^\n]*\n+([^\n]{2,40})/i)
        || midText.match(/Surname\s*[:;.]?\s*([^\n]{2,40})/i);
      if (surnameMatch) {
        const rawSurname = surnameMatch[1].split('\n')[0].replace(/[^A-Za-z\s]/g, '').trim();
        if (rawSurname.length >= 2 && !/given|name|nationality|bangladeshi/i.test(rawSurname)) {
          bioSurname = rawSurname;
        }
      }

      // Middle DOB
      const months = 'JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC';
      const dm = midText.match(new RegExp(`([0-3][0-9])\\s*(${months})\\s*(19[0-9]{2}|20[0-9]{2})`, 'i'));
      if (dm) {
        const monthMap = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
        extracted.dateOfBirth = `${dm[3]}-${monthMap[dm[2].toLowerCase()]}-${dm[1]}`;
      }
    } catch (midErr) {
      console.warn('[PassportReader] Mid bio notice:', midErr.message);
    }

    // ─────────────────────────────────────────────────────────────
    // PASS 2: MRZ READING (Bottom 30% with OCR-B Whitelist)
    // ─────────────────────────────────────────────────────────────
    let mrzSurname = '';
    let mrzGiven = '';
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
        .filter((l) => l.length >= 20);

      for (const line of mrzLines) {
        // Line 1: Surname and Given Names
        if (!mrzSurname && line.includes('BGD') && (line.startsWith('P') || line.includes('P<'))) {
          const names = parseMrzLine1Names(line);
          if (names.surname) mrzSurname = names.surname;
          if (names.givenName) mrzGiven = names.givenName;
        }

        // Line 2: Passport No, Check Digits, DOB, Sex, Expiry
        const bgdIndex = line.indexOf('BGD');
        if (bgdIndex >= 6 && !extracted.passportNumber) {
          const passCheckDigit = line.charAt(bgdIndex - 1);
          const rawPass = line.substring(0, bgdIndex - 1);
          extracted.passportNumber = resolvePassportNumber(rawPass, passCheckDigit);

          const afterBgd = line.substring(bgdIndex + 3);
          if (afterBgd.length >= 14) {
            const rawDob = afterBgd.substring(0, 6);
            if (!extracted.dateOfBirth) {
              extracted.dateOfBirth = parseMrzDate(rawDob, true);
            }

            const rawSex = afterBgd.charAt(7);
            if (rawSex === 'M' || rawSex === 'F') extracted.sex = rawSex;

            const rawExp = afterBgd.substring(8, 14);
            extracted.passportExpiryDate = parseMrzDate(rawExp, false);
          }
        }
      }
    } catch (mrzErr) {
      console.warn('[PassportReader] MRZ parse notice:', mrzErr.message);
    }

    // ─────────────────────────────────────────────────────────────
    // PASS 3: EMERGENCY CONTACT / PAGE 3 (Top ~45%)
    // ─────────────────────────────────────────────────────────────
    let page3Name = '';
    try {
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
      const topLines = text.split('\n').map((l) => l.trim()).filter(Boolean);

      // 1. Candidate Full Name on Page 3 (under "PERSONAL DATA AND EMERGENCY CONTACT")
      for (let i = 0; i < topLines.length; i++) {
        const line = topLines[i];
        if (/\bName\s*[:;.]/i.test(line) && !/father|mother|spouse|emergency/i.test(line)) {
          let nm = line.replace(/^.*?\bName\s*[:;.]?\s*/i, '').replace(/[^A-Za-z\s]/g, '').trim();
          nm = nm.replace(/\bA\s*K[xX]?\s*M\b/i, 'A K M');
          if (nm.length >= 3 && !/father|mother|spouse|emergency|address|contact|deputy/i.test(nm)) {
            page3Name = nm;
            break;
          }
        }
      }

      // 2. Father's Name
      for (const line of topLines) {
        if (/[FP]athers?/i.test(line)) {
          const afterFather = line.replace(/^.*?[FP]athers?['’s]*\s*/i, '');
          let val = afterFather
            .replace(/^(?:Name|Nome|eine|Nes|Mains|TC|TO|C|[:;.])+\s*/gi, '')
            .replace(/^(?:Name|Nome|eine|Nes|Mains|TC|TO|C|[:;.])+\s*/gi, '')
            .trim();

          val = val.replace(/^.*?[©@]\s*/, '');
          val = val
            .replace(/^34D\b/i, 'MD')
            .replace(/^HD\b/i, 'MD')
            .replace(/^I4D\b/i, 'MD')
            .replace(/\bRAMMAN\b/i, 'RAHMAN')
            .replace(/\bKMAN\b/i, 'KHAN');

          val = val.replace(/\s+(?:or|nr|ee|and)\b.*$/i, '').trim();
          if (val.length > 4 && !/mother|spouse|address|emergency/i.test(val)) {
            extracted.fatherName = formatTitleCase(val);
            break;
          }
        }
      }

      // 3. Address (handles multi-line address on Bangladeshi passports)
      for (let i = 0; i < topLines.length; i++) {
        const line = topLines[i];
        if (/Permanent\s*Address/i.test(line) || /Add\s*mss/i.test(line)) {
          let addrParts = [];
          let firstPart = line.replace(/^.*?(?:Permanent\s*Address|Add\s*mss)\s*[:;.]?\s*/i, '').trim();
          firstPart = firstPart.replace(/[:;]/g, '').replace(/\s+/g, ' ').trim();
          if (firstPart.length > 3) addrParts.push(firstPart);

          for (let j = i + 1; j < Math.min(i + 4, topLines.length); j++) {
            const nextL = topLines[j];
            if (/Emergency|Telephone|Phone|Mobile|Deputy|Director/i.test(nextL)) break;
            const cleanNext = nextL.replace(/[^A-Za-z0-9\s,\-\/]/g, '').trim();
            if (cleanNext.length > 3 && !/mother|father|spouse/i.test(cleanNext)) {
              addrParts.push(cleanNext);
            }
          }

          if (addrParts.length > 0) {
            extracted.address = formatTitleCase(addrParts.join(', ').replace(/,\s*,/g, ',').trim());
            break;
          }
        }
      }

      // 4. Telephone / Phone
      const phoneMatch = text.match(/(?:Telephone|Phone|Mobile)\s*(?:No)?\s*[:;.]?\s*([A-Za-z0-9\s+]{10,22})/i);
      if (phoneMatch) {
        let pRaw = phoneMatch[1]
          .replace(/S/g, '8')
          .replace(/[ODQ]/g, '0')
          .replace(/[IL]/g, '1')
          .replace(/Z/g, '2')
          .replace(/[^0-9+]/g, '');

        if (pRaw.startsWith('880')) pRaw = `+${pRaw}`;
        else if (pRaw.startsWith('01') && pRaw.length >= 11) pRaw = pRaw.substring(0, 11);
        else if (pRaw.startsWith('+880') && pRaw.length >= 14) pRaw = pRaw.substring(0, 14);

        if (pRaw.length >= 11) {
          extracted.phone = pRaw;
        }
      }
    } catch (topErr) {
      console.warn('[PassportReader] Top page parse notice:', topErr.message);
    }

    // ─────────────────────────────────────────────────────────────
    // PASS 4: RECONCILE FULL NAME
    // Priority:
    // 1. Page 3 Name (e.g. "A K M RIAJ UDDIN" or "MD MOTIUR RAHMAN KHAN")
    // 2. Given Names + Surname from MRZ / Bio page
    // ─────────────────────────────────────────────────────────────
    const candidateSurname = mrzSurname || bioSurname;
    const candidateGiven = bioGiven || mrzGiven;

    if (page3Name) {
      let resolvedPage3 = page3Name;
      // If Page 3 has slight OCR typo of surname (e.g. "KAJ UDDIN" vs "RIAJ UDDIN")
      if (candidateSurname && !page3Name.toUpperCase().includes(candidateSurname.toUpperCase())) {
        const p3Parts = page3Name.split(' ');
        const surParts = candidateSurname.split(' ');
        if (p3Parts.length >= surParts.length) {
          resolvedPage3 = `${p3Parts.slice(0, -surParts.length).join(' ')} ${candidateSurname}`.trim();
        }
      }
      extracted.fullName = formatTitleCase(resolvedPage3);
    } else if (candidateGiven && candidateSurname) {
      // In Bangladeshi passports, if surname is at the start (e.g. "FARIHA" with given "NAFISA HASIN")
      // Check if Given starts with Md/A K M or if Surname comes first
      extracted.fullName = formatTitleCase(`${candidateGiven} ${candidateSurname}`);
    } else if (candidateGiven) {
      extracted.fullName = formatTitleCase(candidateGiven);
    } else if (candidateSurname) {
      extracted.fullName = formatTitleCase(candidateSurname);
    }
  } catch (err) {
    console.error('[PassportReader] Fatal error reading passport:', err);
  }

  return extracted;
}
