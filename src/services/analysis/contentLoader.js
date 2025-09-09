const highlighterScript = `
  const highlightStyle = '3px solid #FF0000';
  let highlightedElement = null;

  window.addEventListener('message', (event) => {
    const { type, selector } = event.data;

    if (type === 'highlight') {
      if (highlightedElement) {
        highlightedElement.style.outline = '';
      }
      if (selector) {
        const newElement = document.querySelector(selector);

        if (newElement) {
          highlightedElement = newElement;
          highlightedElement.style.outline = highlightStyle;
          highlightedElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center',
          });
        }
      }
    }
  });
`;

export function injectHighlighterScript(htmlContent) {
  const headRegex = /(<\/head>)/i;
  const bodyRegex = /(<body)/i;

  if (headRegex.test(htmlContent)) {
    return htmlContent.replace(headRegex, `<script>${highlighterScript}</script>$1`);
  }

  if (bodyRegex.test(htmlContent)) {
    return htmlContent.replace(bodyRegex, `<script>${highlighterScript}</script>$1`);
  }

  return `<script>${highlighterScript}</script>${htmlContent}`;
}

export async function loadPageContent(page, { url, htmlContent }) {
  if (url) {
    const urlObj = new URL(url);

    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('HTTP와 HTTPS만 허용됩니다.');
    }

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 0 });

    return page.content();
  }

  if (htmlContent) {
    if (typeof htmlContent !== 'string' || htmlContent.length > 1000000) {
      throw new Error('유효하지 않은 HTML 콘텐츠가 제공됐습니다.');
    }

    await page.setContent(htmlContent, { waitUntil: 'networkidle0', timeout: 0 });

    return page.content();
  }

  throw new Error('URL 또는 HTML 콘텐츠 중 하나는 반드시 제공되어야 합니다.');
}
