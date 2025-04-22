'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fjgrhtfjwsmfmcrqenon.supabase.co/';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZ3JodGZqd3NtZm1jcnFlbm9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNDU3ODAsImV4cCI6MjA2MDkyMTc4MH0.2AKk7TPjsIoGD2syfSl9FDgIO3_0ulSOijXYUptSGI0';

let supabase;

export const getSupabase = () => {
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
};
