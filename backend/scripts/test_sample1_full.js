import { createWorker } from 'tesseract.js';
import sharp from 'sharp';

async function testSample1Text() {
  const imgPath = 'C:/Users/mdikr/.gemini/antigravity/brain/b57b9bd4-08da-4ccd-9411-8eb9066ded1f/.user_uploaded/media_1788719075923.jpg';
  const worker = await createWorker('eng');

  // Let's run full image OCR with 2x scale
  const meta = await sharp(imgPath).metadata();
  const scaled = await sharp(imgPath)
    .resize(meta.width * 2)
    .grayscale()
    .normalize()
    .toBuffer();

  const res = await worker.recognize(scaled);
  console.log('--- Full Scaled 2x OCR Output ---');
  console.log(res.data.text);

  await worker.terminate();
}

testSample1Text().catch(console.error);
