import { createClient } from '@supabase/supabase-js';

// Only expose the anon key in client-side code
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a client with limited permissions
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false // Don't persist session in localStorage
  },
  db: {
    schema: 'public'
  }
});

// Types for client-side use only
export type PublicAffiliateStats = {
  username: string;
  weekly_wagered: number;
  total_lifetime_wagered: number;
  position?: number;
};

export type PublicWeeklyLeaderboard = {
  username: string;
  weekly_wagered: number;
  position: number;
};

export type PublicPastWinner = {
  week_start_date: string;
  week_end_date: string;
  position: number;
  username: string;
  weekly_wagered: number;
  prize_amount?: number;
};

export type AffiliateStats = {
  id?: number;
  username: string;
  campaign_code: string;
  deposit: number;
  lifetime_wagered: number;
  created_at?: string;
  updated_at?: string;
};

export type WeeklyLeaderboard = {
  id?: number;
  username: string;
  campaign_code: string;
  week_start_date: string;
  week_end_date: string;
  weekly_wagered: number;
  total_deposit: number;
  total_lifetime_wagered: number;
  created_at?: string;
  updated_at?: string;
};

export type WeeklySnapshot = {
  id?: number;
  username: string;
  campaign_code: string;
  week_start_date: string;
  snapshot_datetime: string;
  lifetime_wagered_at_snapshot: number;
  deposit_at_snapshot: number;
  weekly_wagered_calculated: number;
  created_at?: string;
};

export type PastWinner = {
  id?: number;
  week_start_date: string;
  week_end_date: string;
  position: number;
  username: string;
  campaign_code: string;
  weekly_wagered: number;
  total_lifetime_wagered: number;
  prize_amount?: number;
  archived_at?: string;
}; 