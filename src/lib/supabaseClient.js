import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aqhitjcuskjvmeavhgbj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxaGl0amN1c2tqdm1lYXZoZ2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwOTQ2MjUsImV4cCI6MjEwMzY3MDYyNX0.jlu3bWr7KsWEY6FWo_YwcBCwbo0ujkP83EFhAIrHwic';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConnected = Boolean(supabaseAnonKey && supabaseAnonKey.startsWith('eyJ'));
