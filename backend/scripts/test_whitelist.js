import { createWorker } from 'tesseract.js';
import sharp from 'sharp';

const sampleImages = [
  'C:/Users/mdikr/.gemini/antigravity/brain/b57b9bd4-08da-4ccd-9411-8eb9066ded1f/.user_uploaded/media_1788719075923.jpg',
  'C:/Users/mdikr/.gemini/antigravity/brain/b57b9bd4-08da-4ccd-9411-8eb9066ded1f/.user_uploaded/media_1788719075929.webp',
  'C:/Users/mdikr/.gemini/antigravity/brain/b57b9bd4-08da-4ccd-9411-8eb9066ded1f/.user_uploaded/media_1788719075997.jpg'
];

async function testWhitelistMrz() {
  const worker = await createWorker('eng');
  await worker.setParameters({
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<',
    tessedit_pageseg_mode: '6',
  });

  for (let i = 0; i < sampleImages.length; i++) {
    const imgPath = sampleImages[i];
    const meta = await sharp(imgPath).metadata();
    const mrzTop = Math.floor(meta.height * 0.72);
    const mrzHeight = meta.height - mrzTop;

    const mrzBuf = await sharp(imgPath)
      .extract({ left: 0, top: mrzTop, width: meta.width, height: mrzHeight })
      .resize(Math.max(meta.width * 2, 1600))
      .grayscale()
      .threshold(140)
      .toBuffer();

    const res = await worker.recognize(mrzBuf);
    console.log(`\n============== Image ${i + 1} MRZ with Whitelist ==============`);
    console.log(res.data.text);
  }

  await worker.terminate();
}

testWhitelistMrz().catch(console.error);
