'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://fjgrhtfjwsmfmcrqenon.supabase.co/';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZ3JodGZqd3NtZm1jcnFlbm9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNDU3ODAsImV4cCI6MjA2MDkyMTc4MH0.2AKk7TPjsIoGD2syfSl9FDgIO3_0ulSOijXYUptSGI0';

let supabase: SupabaseClient;

export const getSupabase = (): SupabaseClient => {
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
}
