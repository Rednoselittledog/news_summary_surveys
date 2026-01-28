import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey
    });
    throw new Error('Missing Supabase environment variables');
  }

  console.log('Creating Supabase client with URL:', supabaseUrl.substring(0, 30) + '...');

  return createBrowserClient(supabaseUrl, supabaseKey);
}
