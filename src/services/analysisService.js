import fs from 'fs';
import { createRequire } from 'module';
import puppeteer from 'puppeteer';

const require = createRequire(import.meta.url);
const axeScriptContent = fs.readFileSync(require.resolve('axe-core'), 'utf-8');

export const analyzeAccessibility = async ({ url, htmlContent }) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    if (url) {
      await page.goto(url, { waitUntil: 'networkidle0' });
    } else if (htmlContent) {
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    } else {
      throw new Error('URL 또는 HTML 콘텐츠 중 하나는 반드시 제공되어야 합니다.');
    }

    await page.addScriptTag({ content: axeScriptContent });

    const results = await page.evaluate(() => {
      const options = { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'best-practice'] } };
      return axe.run(document, options);
    });

    return results;
  } catch (error) {
    console.error('접근성 분석 중 오류 발생:', error);
    throw new Error(`분석 실패: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
