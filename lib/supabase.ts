import { createClient } from '@supabase/supabase-js';

// Environment variables to be defined in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
