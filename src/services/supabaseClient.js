import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Supabase URL과 Service Key가 필요합니다. .env 파일에 올바르게 설정되었는지 확인하세요.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
