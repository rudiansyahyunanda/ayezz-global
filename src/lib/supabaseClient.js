import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dxrncbevjnfasvkcqhbj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4cm5jYmV2am5mYXN2a2NxaGJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2MzQwMDEsImV4cCI6MjEwMzIxMDAwMX0.BBSkybNT_yoLQV5RI6xcKAnzHsUSazf3SCnMzLSTgkA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConnected = Boolean(supabaseAnonKey && supabaseAnonKey.startsWith('eyJ'));
