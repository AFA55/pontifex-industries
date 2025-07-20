import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Your Supabase URL (this is correct)
const supabaseUrl = 'https://zzvtdteuvdscoqzsovmy.supabase.co';

// REPLACE THIS with the correct anon/public key from Supabase Dashboard → Settings → API
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6dnRkdGV1dmRzY29xenNvdm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMjExNzksImV4cCI6MjA2Mzc5NzE3OX0.i2mKulOObulmZhW7I__DaV94YaQrTfUM1nyhUi08wLY';

// Debug: Log the configuration
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key (first 20 chars):', supabaseKey.substring(0, 20) + '...');

export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      debug: true, // Enable auth debugging
      persistSession: true,
      autoRefreshToken: true,
    }
  });
};

// Test connection
const supabase = createClient();
supabase.auth.getSession().then(({ data, error }) => {
  console.log('Supabase connection test:', { data, error });
});