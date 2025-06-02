import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export type AffiliateStats = {
  id?: number;
  username: string;
  campaign_code: string;
  deposit: number;
  lifetime_wagered: number;
  created_at?: string;
  updated_at?: string;
}; 