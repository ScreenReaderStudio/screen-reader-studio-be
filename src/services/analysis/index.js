import puppeteer from 'puppeteer';

import { loadPageContent, injectHighlighterScript } from './contentLoader.js';
import { analyzePage } from './pageAnalyzer.js';

export const analyzeAccessibility = async ({ url, htmlContent, screenReader }) => {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args:
        process.env.NODE_ENV === 'production' ? ['--no-sandbox', '--disable-setuid-sandbox'] : [],
    });

    const page = await browser.newPage();
    const rawContent = await loadPageContent(page, { url, htmlContent });
    const { screenReaderScript, accessibilityAnalysis } = await analyzePage(page, screenReader);
    const pageContentWithHighlighter = injectHighlighterScript(rawContent);

    return {
      accessibilityAnalysis,
      screenReaderScript,
      pageContent: pageContentWithHighlighter,
    };
  } catch (error) {
    console.error('접근성 분석 중 오류 발생:', error);
    throw new Error(`분석 실패: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
