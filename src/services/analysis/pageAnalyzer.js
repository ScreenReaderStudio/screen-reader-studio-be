import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const axeScriptContent = fs.readFileSync(require.resolve('axe-core'), 'utf-8');
const koLocale = JSON.parse(fs.readFileSync(require.resolve('axe-core/locales/ko.json'), 'utf-8'));

async function generateScreenReaderScript(page) {
  return page.evaluate(() => {
    function getCssSelector(el) {
      if (!(el instanceof Element)) {
        return null;
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

    function getAccessibleName(el) {
      const ariaLabel = el.getAttribute('aria-label');
      if (ariaLabel && ariaLabel.trim()) {
        return ariaLabel.trim();
      }

      if (el.tagName.toLowerCase() === 'img' && el.alt) {
        return el.alt.trim();
      }

      if (el.innerText && el.innerText.trim()) {
        return el.innerText.trim();
      }

      const title = el.getAttribute('title');
      if (title && title.trim()) {
        return title.trim();
      }

      return '';
    }

    const script = [];
    const elements = document.querySelectorAll('body *');

    elements.forEach((el) => {
      if (!isElementVisible(el)) {
        return;
      }

      const role = el.getAttribute('role') || el.tagName.toLowerCase();
      const name = getAccessibleName(el).replace(/\s+/g, ' ');
      let text = '';

      if (name) {
        let roleText = '';

        switch (role) {
          case 'h1':
            roleText = '제목 레벨 1';
            break;
          case 'h2':
            roleText = '제목 레벨 2';
            break;
          case 'h3':
            roleText = '제목 레벨 3';
            break;
          case 'h4':
            roleText = '제목 레벨 4';
            break;
          case 'h5':
            roleText = '제목 레벨 5';
            break;
          case 'h6':
            roleText = '제목 레벨 6';
            break;
          case 'a':
          case 'link':
            roleText = '링크';
            break;
          case 'button':
            roleText = '버튼';
            break;
          case 'img':
            roleText = '이미지';
            break;
          case 'nav':
            roleText = '네비게이션';
            break;
          case 'main':
            roleText = '메인 콘텐츠';
            break;
          case 'search':
            roleText = '검색';
            break;
          case 'region':
            roleText = '영역';
            break;
          case 'textbox':
          case 'input':
            if (!['submit', 'button', 'checkbox', 'radio', 'image'].includes(el.type)) {
              roleText = '입력창';
            }
            break;
          case 'checkbox':
            roleText = '체크박스';
            break;
          case 'radio':
            roleText = '라디오 버튼';
            break;
        }

        if (roleText) {
          text = `${roleText}, ${name}`;
          if (
            el.value &&
            'value' in el &&
            (role === 'textbox' || el.tagName.toLowerCase() === 'input')
          ) {
            text += `, 현재 값: ${el.value}`;
          }
          if (el.checked && 'checked' in el) {
            text += `, 선택됨`;
          }
        }
      }

      if (text) {
        script.push({
          text,
          selector: getCssSelector(el),
        });
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
