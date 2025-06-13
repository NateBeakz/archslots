import { supabase } from '../supabase/client';

const SHUFFLE_API_URL = 'https://affiliate.shuffle.com/stats/a3c8d93b-e3b5-47af-8afe-5cfdf13667c7';
const RATE_LIMIT_DELAY = 1000; // 1 second between requests

interface ShuffleApiResponse {
  username: string;
  deposit: number;
  lifetimeWagered: number;
  campaignCode: string;
}

export class ShuffleApiService {
  private static instance: ShuffleApiService;
  private lastRequestTime: number = 0;

  private constructor() {}

  public static getInstance(): ShuffleApiService {
    if (!ShuffleApiService.instance) {
      ShuffleApiService.instance = new ShuffleApiService();
    }
    return ShuffleApiService.instance;
  }

  private async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
      await new Promise(resolve => 
        setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
  }

  public async fetchAffiliateStats(): Promise<ShuffleApiResponse[]> {
    try {
      await this.enforceRateLimit();

      const response = await fetch(SHUFFLE_API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Shuffle API data:', error);
      throw error;
    }
  }

  public async updateAffiliateStats(): Promise<boolean> {
    try {
      const stats = await this.fetchAffiliateStats();
      
      // Filter out users with no activity
      const activeUsers = stats.filter(user => user.deposit > 0 || user.lifetimeWagered > 0);
      
      // Update affiliate_stats table
      const { error: upsertError } = await supabase
        .from('affiliate_stats')
        .upsert(
          activeUsers.map(stat => ({
            username: stat.username,
            campaign_code: stat.campaignCode,
            deposit: parseFloat(stat.deposit.toString()) || 0,
            lifetime_wagered: parseFloat(stat.lifetimeWagered.toString()) || 0,
            updated_at: new Date().toISOString()
          })),
          { onConflict: 'username' }
        );

      if (upsertError) {
        throw upsertError;
      }

      return true;
    } catch (error) {
      console.error('Error updating affiliate stats:', error);
      return false;
    }
  }
} 