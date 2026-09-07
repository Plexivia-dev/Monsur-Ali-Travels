import { createWorker } from 'tesseract.js';
import sharp from 'sharp';

const sampleImages = [
  'C:/Users/mdikr/.gemini/antigravity/brain/b57b9bd4-08da-4ccd-9411-8eb9066ded1f/.user_uploaded/media_1788719075923.jpg',
  'C:/Users/mdikr/.gemini/antigravity/brain/b57b9bd4-08da-4ccd-9411-8eb9066ded1f/.user_uploaded/media_1788719075929.webp',
  'C:/Users/mdikr/.gemini/antigravity/brain/b57b9bd4-08da-4ccd-9411-8eb9066ded1f/.user_uploaded/media_1788719075997.jpg'
];

async function inspectTopHalves() {
  const worker = await createWorker('eng');

  for (let i = 0; i < sampleImages.length; i++) {
    const imgPath = sampleImages[i];
    const meta = await sharp(imgPath).metadata();
    const topHeight = Math.floor(meta.height * 0.45);

    const buf = await sharp(imgPath)
      .extract({ left: 0, top: 0, width: meta.width, height: topHeight })
      .resize(Math.max(meta.width * 2, 1600))
      .grayscale()
      .threshold(160)
      .toBuffer();

    const res = await worker.recognize(buf);
    console.log(`\n================ Top OCR Image ${i + 1} ================`);
    console.log(res.data.text);
  }

  await worker.terminate();
}

inspectTopHalves().catch(console.error);
