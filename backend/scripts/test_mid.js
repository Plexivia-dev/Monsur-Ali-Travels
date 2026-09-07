import { createWorker } from 'tesseract.js';
import sharp from 'sharp';

const sampleImages = [
  'C:/Users/mdikr/.gemini/antigravity/brain/b57b9bd4-08da-4ccd-9411-8eb9066ded1f/.user_uploaded/media_1788719075923.jpg',
  'C:/Users/mdikr/.gemini/antigravity/brain/b57b9bd4-08da-4ccd-9411-8eb9066ded1f/.user_uploaded/media_1788719075929.webp',
  'C:/Users/mdikr/.gemini/antigravity/brain/b57b9bd4-08da-4ccd-9411-8eb9066ded1f/.user_uploaded/media_1788719075997.jpg'
];

async function testMiddleBioPage() {
  const worker = await createWorker('eng');

  for (let i = 0; i < sampleImages.length; i++) {
    const imgPath = sampleImages[i];
    const meta = await sharp(imgPath).metadata();
    
    // Bio page is middle 35% (between 45% and 78%)
    const midTop = Math.floor(meta.height * 0.48);
    const midHeight = Math.floor(meta.height * 0.26);

    const buf = await sharp(imgPath)
      .extract({ left: 0, top: midTop, width: meta.width, height: midHeight })
      .resize(Math.max(meta.width * 2, 1600))
      .grayscale()
      .threshold(150)
      .toBuffer();

    const res = await worker.recognize(buf);
    console.log(`\n============== Sample ${i + 1} Middle Bio Page (Threshold 150) ==============`);
    console.log(res.data.text);
  }

  await worker.terminate();
}

testMiddleBioPage().catch(console.error);
