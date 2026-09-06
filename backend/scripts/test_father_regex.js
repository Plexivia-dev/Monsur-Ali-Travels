const lines = [
  'PTS LTT Fathers Mains TC 34D ABDUR RAMMAN KMAN or EE',
  '® en Fathers Nome: MD ABULKALAM nr Ee'
];

for (const line of lines) {
  if (/[FP]athers?/i.test(line)) {
    // Strip everything up to father/pather
    const afterFather = line.replace(/^.*?[FP]athers?['’s]*\s*/i, '');
    // Strip common labels like Name, Nome, Mains, TC, colon, etc.
    let val = afterFather
      .replace(/^(?:Name|Nome|eine|Nes|Mains|TC|TO|C|[:;.])+\s*/gi, '')
      .replace(/^(?:Name|Nome|eine|Nes|Mains|TC|TO|C|[:;.])+\s*/gi, '')
      .trim();

    // Fix OCR noise: 34D -> MD, RAMMAN -> RAHMAN, KMAN -> KHAN
    val = val
      .replace(/^34D\b/i, 'MD')
      .replace(/^HD\b/i, 'MD')
      .replace(/^I4D\b/i, 'MD')
      .replace(/\bRAMMAN\b/i, 'RAHMAN')
      .replace(/\bKMAN\b/i, 'KHAN');

    // Strip trailing OCR garbage like 'or EE' or 'nr Ee'
    val = val.replace(/\s+(?:or|nr|ee|and)\b.*$/i, '').trim();
    console.log('Final Cleaned Father:', val);
  }
}
