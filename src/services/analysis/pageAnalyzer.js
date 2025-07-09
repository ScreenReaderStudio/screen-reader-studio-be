import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const axeScriptContent = fs.readFileSync(require.resolve('axe-core'), 'utf-8');
const koLocale = JSON.parse(fs.readFileSync(require.resolve('axe-core/locales/ko.json'), 'utf-8'));

async function generateScreenReaderScript(page) {
  return page.evaluate(() => {
    function getCssSelector(el) {
      if (!(el instanceof Element)) {
        return;
      }

      const path = [];

      while (el.nodeType === Node.ELEMENT_NODE) {
        let selector = el.nodeName.toLowerCase();

        if (el.id) {
          selector += '#' + el.id;
          path.unshift(selector);
          break;
        } else {
          let sib = el;
          let nth = 1;

          while ((sib = sib.previousElementSibling)) {
            if (sib.nodeName.toLowerCase() === selector) {
              nth++;
            }
          }

          if (nth != 1) {
            selector += ':nth-of-type(' + nth + ')';
          }
        }
        path.unshift(selector);
        el = el.parentNode;
      }

      return path.join(' > ');
    }

    function isElementVisible(el) {
      if (!el) {
        return false;
      }

      const style = window.getComputedStyle(el);

      return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
    }

    const script = [];
    const elements = document.querySelectorAll('body *');

    elements.forEach((el) => {
      if (!isElementVisible(el)) {
        return;
      }

      const role = el.getAttribute('role') || el.tagName.toLowerCase();
      let text = '';
      let name = el.getAttribute('aria-label') || el.innerText || el.alt || el.title;

      if (name) {
        name = name.trim().replace(/\s+/g, ' ');

        if (name.length > 0 && name.length < 200) {
          if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(role)) {
            const level = role.replace('h', '');
            text = `제목 레벨 ${level}, ${name}`;
          } else if (role === 'a' || role === 'link') {
            text = `링크, ${name}`;
          } else if (role === 'button') {
            text = `버튼, ${name}`;
          } else if (role === 'img') {
            text = `이미지, ${name}`;
          }
        }
      }

      if (text) {
        script.push({ text, selector: getCssSelector(el) });
      }
    });

    return script;
  });
}

async function runAxeAnalysis(page) {
  await page.addScriptTag({ content: axeScriptContent });

  return page.evaluate((locale) => {
    if (typeof axe === 'undefined') {
      throw new Error('axe-core를 사용할 수 없습니다.');
    }

    axe.configure({ locale });
    const options = {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'best-practice'] },
    };

    return axe.run(document, options);
  }, koLocale);
}

export async function analyzePage(page) {
  const [screenReaderScript, accessibilityAnalysis] = await Promise.all([
    generateScreenReaderScript(page),
    runAxeAnalysis(page),
  ]);

  return { screenReaderScript, accessibilityAnalysis };
}
