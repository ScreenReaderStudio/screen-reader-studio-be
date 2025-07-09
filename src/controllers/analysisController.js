import { analyzeAccessibility } from '../services/analysis/index.js';

export const handleAnalysisRequest = async (req, res) => {
  try {
    const { url, htmlContent } = req.body;

    if (!url && !htmlContent) {
      return res.status(400).json({ message: '분석할 URL 또는 HTML 콘텐츠를 제공해야 합니다.' });
    }

    const results = await analyzeAccessibility({ url, htmlContent });

    res.status(200).json(results);
  } catch (error) {
    console.error('분석 요청 처리 중 에러 발생:', error);
    res.status(500).json({ message: error.message || '서버 내부 오류가 발생했습니다.' });
  }
};
