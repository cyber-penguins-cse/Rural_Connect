import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection on load
supabase.from('products').select('count', { count: 'exact', head: true })
  .then(({ count, error }) => {
    if (error) {
      console.error('Supabase connection error:', error);
    } else {
      console.log('Supabase connected. Products count:', count);
    }
  });
