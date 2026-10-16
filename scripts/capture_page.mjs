import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// Usage: node scripts/capture_page.mjs [route] [viewportWidth]
// Example: node scripts/capture_page.mjs /showcase 1440
const route = process.argv[2] || '/';
const width = parseInt(process.argv[3] || '1440', 10);
const height = 900;

const outputDir = path.resolve('public/screenshots');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const safeName = route.replace(/[^a-zA-Z0-9]/g, '_').replace(/^_+|_+$/g, '') || 'home';
const filename = `gro10x-${safeName}-${width}px.png`;
const outputPath = path.join(outputDir, filename);

(async () => {
  console.log(`Launching browser to capture http://localhost:3000${route} at ${width}px...`);
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2
  });

  const page = await context.newPage();
  await page.goto(`http://localhost:3000${route}`, { waitUntil: 'networkidle' });

  // Scroll down smoothly to trigger lazy-loaded images & animations
  await page.evaluate(async () => {
    const distance = 400;
    const delay = 60;
    while (document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight) {
      document.scrollingElement.scrollBy(0, distance);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    window.scrollTo(0, 0);
    await new Promise(resolve => setTimeout(resolve, 200));
  });

  // Capture full page
  await page.screenshot({ path: outputPath, fullPage: true });
  await browser.close();

  console.log(`✓ Full-page screenshot saved to: ${outputPath}`);
})();
