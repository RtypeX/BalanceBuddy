'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase;

export const getSupabase = () => {
  if (!supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error(
        'Supabase URL or Anon Key not provided. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables are set.'
      );
      return null;
    }
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
};
