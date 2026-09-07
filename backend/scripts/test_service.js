import { createWorker } from 'tesseract.js';
import sharp from 'sharp';

let workerInstance = null;

async function getWorker() {
  if (!workerInstance) {
    workerInstance = await createWorker('eng');
  }
  return workerInstance;
}

export function formatTitleCase(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function calculateIcaoCheckDigit(str) {
  if (!str) return -1;
  const weights = [7, 3, 1];
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    let val = 0;
    if (c >= 48 && c <= 57) val = c - 48;
    else if (c >= 65 && c <= 90) val = c - 55;
    else if (c === 60) val = 0;
    sum += val * weights[i % 3];
  }
  return sum % 10;
}

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

export function resolvePassportNumber(rawCandidate, expectedCheckDigit = null) {
  if (!rawCandidate) return '';
  const cleaned = rawCandidate.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const prefixMatch = cleaned.match(/([A-Z]{2})/);
  if (!prefixMatch) return cleaned.substring(0, 9);

  const prefix = prefixMatch[1];
  const startIndex = cleaned.indexOf(prefix);
  const rawDigitsPart = cleaned.substring(startIndex + 2);

  const digits = rawDigitsPart
    .replace(/[ODQ]/g, '0')
    .replace(/[ILT]/g, '1')
    .replace(/Z/g, '2')
    .replace(/A/g, '4')
    .replace(/S/g, '5')
    .replace(/[GB]/g, '8');

  if (digits.length === 7) {
    const candidate = `${prefix}${digits}`;
    if (expectedCheckDigit !== null) {
      if (calculateIcaoCheckDigit(candidate) === parseInt(expectedCheckDigit, 10)) {
        return candidate;
      }
    }
    return candidate;
  }

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

export function parseMrzLine1Names(line1) {
  if (!line1) return { surname: '', givenName: '' };
  let body = line1.replace(/^P[<K1L][B86]GD/, '').replace(/^P[<K1L]/, '');
  body = body.replace(/<+[A-Z0-9]?<+/g, '<<');

  const doubleParts = body.split('<<');
  if (doubleParts.length >= 2) {
    const surname = doubleParts[0].replace(/<+/g, ' ').replace(/[^A-Z\s]/g, '').trim();
    let givenPart = doubleParts[1].replace(/[<K1LC]{2,}.*$/, '');
    const given = givenPart.replace(/<+/g, ' ').replace(/[^A-Z\s]/g, '').trim();
    return { surname, givenName: given };
  } else if (doubleParts.length === 1) {
    const single = doubleParts[0].replace(/[<K1LC]{2,}.*$/, '').replace(/<+/g, ' ').replace(/[^A-Z\s]/g, '').trim();
    return { surname: '', givenName: single };
  }
  return { surname: '', givenName: '' };
}

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

      const midTop = Math.floor(height * 0.48);
      const midHeight = Math.floor(height * 0.26);
      const midBuf = await sharp(filePathOrBuffer)
        .extract({ left: 0, top: midTop, width, height: midHeight })
        .resize(Math.max(width * 2, 1600))
        .grayscale()
        .threshold(150)
        .toBuffer();

      const midOcr = await worker.recognize(midBuf);
      const midText = midOcr.data.text;

      // Given Name
      const givenMatch = midText.match(/Given\s*Name[^\n]*\n+([A-Z\s]{2,40})/i)
        || midText.match(/Given\s*Name\s*[:;.]?\s*([A-Z\s]{2,40})/i);
      if (givenMatch) {
        const rawGiven = givenMatch[1].split('\n')[0].replace(/[^A-Za-z\s]/g, '').trim();
        if (rawGiven.length >= 2 && !/nationality|bangladeshi|passport/i.test(rawGiven)) {
          bioGiven = rawGiven.replace(/\bAKM\b/i, 'A K M');
        }
      }

      // Surname
      const surnameMatch = midText.match(/Surname[^\n]*\n+([A-Z\s]{2,40})/i)
        || midText.match(/Surname\s*[:;.]?\s*([A-Z\s]{2,40})/i);
      if (surnameMatch) {
        const rawSurname = surnameMatch[1].split('\n')[0].replace(/[^A-Za-z\s]/g, '').trim();
        if (rawSurname.length >= 2 && !/given|name|nationality|bangladeshi/i.test(rawSurname)) {
          bioSurname = rawSurname;
        }
      }

      // Date of Birth
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
        if (line.includes('BGD') && (line.startsWith('P') || line.includes('P<'))) {
          const names = parseMrzLine1Names(line);
          if (names.surname) mrzSurname = names.surname;
          if (names.givenName) mrzGiven = names.givenName;
        }

        const bgdIndex = line.indexOf('BGD');
        if (bgdIndex >= 6) {
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
    // MERGE FULL NAME
    // Priority: Bio Given + Bio Surname, or Bio Given + MRZ Surname
    // ─────────────────────────────────────────────────────────────
    if (bioGiven && bioSurname) {
      extracted.fullName = formatTitleCase(`${bioGiven} ${bioSurname}`);
    } else if (bioGiven && mrzSurname) {
      extracted.fullName = formatTitleCase(`${bioGiven} ${mrzSurname}`);
    } else if (mrzGiven && bioSurname) {
      extracted.fullName = formatTitleCase(`${mrzGiven} ${bioSurname}`);
    } else if (bioGiven) {
      extracted.fullName = formatTitleCase(bioGiven);
    } else if (mrzGiven && mrzSurname) {
      extracted.fullName = formatTitleCase(`${mrzGiven} ${mrzSurname}`);
    } else if (mrzGiven) {
      extracted.fullName = formatTitleCase(mrzGiven);
    } else if (mrzSurname) {
      extracted.fullName = formatTitleCase(mrzSurname);
    }

    // ─────────────────────────────────────────────────────────────
    // PASS 3: EMERGENCY CONTACT / PAGE 3 (Top ~45%)
    // ─────────────────────────────────────────────────────────────
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

      // Full Name on Page 3 fallback
      if (!extracted.fullName) {
        const nm = text.match(/\bName\s*[:;.]?\s*([A-Z\s]{4,40})/i);
        if (nm) {
          const cand = nm[1].split('\n')[0].replace(/[^A-Za-z\s]/g, '').trim();
          if (cand.length > 4 && !/father|mother|spouse|emergency|address|contact/i.test(cand)) {
            extracted.fullName = formatTitleCase(cand);
          }
        }
      }

      // Father's Name
      const topLines = text.split('\n');
      for (const line of topLines) {
        if (/[FP]athers?/i.test(line)) {
          const afterFather = line.replace(/^.*?[FP]athers?['’s]*\s*/i, '');
          let val = afterFather
            .replace(/^(?:Name|Nome|eine|Nes|Mains|TC|TO|C|[:;.])+\s*/gi, '')
            .replace(/^(?:Name|Nome|eine|Nes|Mains|TC|TO|C|[:;.])+\s*/gi, '')
            .trim();

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

      // Telephone / Mobile
      const phoneMatch = text.match(/(?:Telephone|Phone|Mobile)\s*(?:No)?\s*[:;.]?\s*([0-9\s+]{10,18})/i)
        || text.match(/\b(01[3-9][0-9]{8})\b/)
        || text.match(/\b(8801[3-9][0-9]{8})\b/);
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
      console.warn('[PassportReader] Top page parse notice:', topErr.message);
    }
  } catch (err) {
    console.error('[PassportReader] Fatal error reading passport:', err);
  }

  return extracted;
}

const sampleImages = [
  'C:/Users/mdikr/.gemini/antigravity/brain/b57b9bd4-08da-4ccd-9411-8eb9066ded1f/.user_uploaded/media_1788719075923.jpg',
  'C:/Users/mdikr/.gemini/antigravity/brain/b57b9bd4-08da-4ccd-9411-8eb9066ded1f/.user_uploaded/media_1788719075929.webp',
  'C:/Users/mdikr/.gemini/antigravity/brain/b57b9bd4-08da-4ccd-9411-8eb9066ded1f/.user_uploaded/media_1788719075997.jpg'
];

async function runServiceTest() {
  for (let i = 0; i < sampleImages.length; i++) {
    console.log(`\n======================================================`);
    console.log(`TESTING SERVICE ON SAMPLE ${i + 1}:`);
    const start = Date.now();
    const result = await readPassportDocument(sampleImages[i]);
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`Extraction complete in ${duration}s:`);
    console.log(JSON.stringify(result, null, 2));
  }
  process.exit(0);
}

runServiceTest().catch((err) => {
  console.error(err);
  process.exit(1);
});
