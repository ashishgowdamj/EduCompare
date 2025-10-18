import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra as any) || {};
const SUPABASE_URL = (extra.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL) as string;
const SUPABASE_ANON_KEY = (extra.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase env missing. Check app.json -> expo.extra or .env');
}
console.log('SB URL in app:', SUPABASE_URL);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: true,
  },
});
