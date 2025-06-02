import { supabase, AffiliateStats } from '../supabase/client';

const AFFILIATE_API_URL = 'https://affiliate.shuffle.com/stats/a3c8d93b-e3b5-47af-8afe-5cfdf13667c7';

export async function fetchAffiliateStats(): Promise<AffiliateStats[]> {
  try {
    const response = await fetch(AFFILIATE_API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch affiliate stats');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching affiliate stats:', error);
    return [];
  }
}

export async function updateAffiliateStats() {
  try {
    const stats = await fetchAffiliateStats();
    
    // Batch upsert the stats
    const { error } = await supabase
      .from('affiliate_stats')
      .upsert(
        stats.map(stat => ({
          username: stat.username,
          campaign_code: stat.campaign_code,
          deposit: stat.deposit,
          lifetime_wagered: stat.lifetime_wagered,
          updated_at: new Date().toISOString()
        })),
        { onConflict: 'username' }
      );

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error updating affiliate stats:', error);
    return false;
  }
}

export async function getLeaderboard(limit: number = 100): Promise<AffiliateStats[]> {
  try {
    const { data, error } = await supabase
      .from('affiliate_stats')
      .select('*')
      .order('lifetime_wagered', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
} 