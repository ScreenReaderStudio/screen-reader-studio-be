import { supabase } from './supabaseClient.js';

export const saveAnalysis = async ({
  userId,
  pageContent,
  accessibilityAnalysis,
  screenReaderScript,
  selectedScreenReader,
}) => {
  const { data, error } = await supabase
    .from('analyses')
    .insert([
      {
        user_id: userId,
        page_content: pageContent,
        accessibility_analysis: accessibilityAnalysis,
        screen_reader_script: screenReaderScript,
        selected_screen_reader: selectedScreenReader,
      },
    ])
    .select('id')
    .single();

  if (error) {
    console.error('Error saving analysis:', error);
    throw new Error(`분석 결과 저장 실패: ${error.message}`);
  }

  return data.id;
};

export const getAnalysisById = async (id) => {
  const { data, error } = await supabase
    .from('analyses')
    .select('page_content, accessibility_analysis, screen_reader_script, selected_screen_reader')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching analysis by ID:', error);
    throw new Error(`분석 결과 조회 실패: ${error.message}`);
  }

  return {
    pageContent: data.page_content,
    accessibilityAnalysis: data.accessibility_analysis,
    screenReaderScript: data.screen_reader_script,
    selectedScreenReader: data.selected_screen_reader,
  };
};
