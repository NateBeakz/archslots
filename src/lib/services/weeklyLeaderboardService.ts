import { supabase, AffiliateStats, WeeklyLeaderboard, WeeklySnapshot, PastWinner } from '../supabase/client';

// Utility function to get UK time equivalent dates
function getUKWeekStart(date: Date = new Date()): string {
  // Convert to UK time (handles BST/GMT automatically)
  const ukTime = new Date(date.toLocaleString("en-US", {timeZone: "Europe/London"}));
  const ukDate = new Date(ukTime.getFullYear(), ukTime.getMonth(), ukTime.getDate());
  
  // Get day of week (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = ukDate.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  // Calculate Monday of current week
  const monday = new Date(ukDate);
  monday.setDate(ukDate.getDate() - daysToMonday);
  
  return monday.toISOString().split('T')[0];
}

function getUKWeekEnd(weekStartDate: string): string {
  const startDate = new Date(weekStartDate);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6); // Add 6 days to get Sunday
  return endDate.toISOString().split('T')[0];
}

function isUKMidnight(): boolean {
  const now = new Date();
  const ukTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/London"}));
  return ukTime.getHours() === 0 && ukTime.getMinutes() === 0;
}

export class WeeklyLeaderboardService {
  
  /**
   * Take a snapshot of current affiliate stats for weekly tracking
   */
  async takeWeeklySnapshot(): Promise<boolean> {
    try {
      console.log('Taking weekly snapshot...');
      
      // Get current affiliate stats
      const { data: currentStats, error: fetchError } = await supabase
        .from('affiliate_stats')
        .select('*');

      if (fetchError) {
        console.error('Error fetching current stats:', fetchError);
        return false;
      }

      if (!currentStats || currentStats.length === 0) {
        console.log('No current stats to snapshot');
        return true;
      }

      const currentWeekStart = getUKWeekStart();
      const snapshotTime = new Date().toISOString();

      // Simple snapshot without weekly calculation here - that will be done in updateWeeklyLeaderboard
      const snapshotData: Omit<WeeklySnapshot, 'id' | 'created_at'>[] = currentStats.map(stat => ({
        username: stat.username,
        campaign_code: stat.campaign_code,
        week_start_date: currentWeekStart,
        snapshot_datetime: snapshotTime,
        lifetime_wagered_at_snapshot: stat.lifetime_wagered,
        deposit_at_snapshot: stat.deposit,
        weekly_wagered_calculated: 0 // Will be calculated properly in updateWeeklyLeaderboard
      }));

      // Insert snapshots
      const { error: insertError } = await supabase
        .from('weekly_snapshots')
        .insert(snapshotData);

      if (insertError) {
        console.error('Error inserting snapshots:', insertError);
        return false;
      }

      console.log(`Successfully took snapshot of ${snapshotData.length} users`);
      return true;
    } catch (error) {
      console.error('Error in takeWeeklySnapshot:', error);
      return false;
    }
  }

  /**
   * Update weekly leaderboard based on latest snapshots
   */
  async updateWeeklyLeaderboard(): Promise<boolean> {
    try {
      console.log('Updating weekly leaderboard...');
      
      const currentWeekStart = getUKWeekStart();
      const currentWeekEnd = getUKWeekEnd(currentWeekStart);

      // Get current affiliate stats to use as the "current" values
      const { data: currentStats, error: currentStatsError } = await supabase
        .from('affiliate_stats')
        .select('*');

      if (currentStatsError) {
        console.error('Error fetching current stats:', currentStatsError);
        return false;
      }

      if (!currentStats || currentStats.length === 0) {
        console.log('No current stats found');
        return true;
      }

      // Calculate weekly wagered for each user
      const leaderboardData: Omit<WeeklyLeaderboard, 'id' | 'created_at' | 'updated_at'>[] = [];

      for (const currentStat of currentStats) {
        // Get the FIRST snapshot of this week for this user (baseline)
        const { data: firstSnapshot } = await supabase
          .from('weekly_snapshots')
          .select('*')
          .eq('username', currentStat.username)
          .eq('week_start_date', currentWeekStart)
          .order('snapshot_datetime', { ascending: true })
          .limit(1);

        // Calculate weekly amounts
        let weeklyWagered = 0;
        let weeklyDeposit = 0;

        if (firstSnapshot && firstSnapshot.length > 0) {
          // We have a baseline from the start of the week
          const startOfWeekWagered = firstSnapshot[0].lifetime_wagered_at_snapshot;
          const startOfWeekDeposit = firstSnapshot[0].deposit_at_snapshot;
          
          weeklyWagered = Math.max(0, currentStat.lifetime_wagered - startOfWeekWagered);
          weeklyDeposit = Math.max(0, currentStat.deposit - startOfWeekDeposit);
        } else {
          // No baseline snapshot yet - this means all current amounts are "weekly"
          // This happens for new users or at the very start of a new week
          weeklyWagered = currentStat.lifetime_wagered;
          weeklyDeposit = currentStat.deposit;
        }

        leaderboardData.push({
          username: currentStat.username,
          campaign_code: currentStat.campaign_code,
          week_start_date: currentWeekStart,
          week_end_date: currentWeekEnd,
          weekly_wagered: weeklyWagered,
          total_deposit: weeklyDeposit, // This should be weekly deposit, not total
          total_lifetime_wagered: currentStat.lifetime_wagered // This remains lifetime
        });
      }

      // Upsert weekly leaderboard data
      const { error: upsertError } = await supabase
        .from('weekly_leaderboard')
        .upsert(leaderboardData, { onConflict: 'username,week_start_date' });

      if (upsertError) {
        console.error('Error upserting weekly leaderboard:', upsertError);
        return false;
      }

      console.log(`Successfully updated weekly leaderboard for ${leaderboardData.length} users`);
      return true;
    } catch (error) {
      console.error('Error in updateWeeklyLeaderboard:', error);
      return false;
    }
  }

  /**
   * Archive previous week's winners and reset for new week
   */
  async archivePreviousWeekWinners(): Promise<boolean> {
    try {
      console.log('Archiving previous week winners...');
      
      // Calculate previous week dates
      const today = new Date();
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const previousWeekStart = getUKWeekStart(lastWeek);
      const previousWeekEnd = getUKWeekEnd(previousWeekStart);

      // Get top performers from previous week
      const { data: topPerformers, error: fetchError } = await supabase
        .from('weekly_leaderboard')
        .select('*')
        .eq('week_start_date', previousWeekStart)
        .order('weekly_wagered', { ascending: false })
        .limit(50); // Archive top 50

      if (fetchError) {
        console.error('Error fetching top performers:', fetchError);
        return false;
      }

      if (!topPerformers || topPerformers.length === 0) {
        console.log('No previous week data to archive');
        return true;
      }

      // Create winners data
      const winnersData: Omit<PastWinner, 'id' | 'archived_at'>[] = topPerformers.map((performer, index) => ({
        week_start_date: previousWeekStart,
        week_end_date: previousWeekEnd,
        position: index + 1,
        username: performer.username,
        campaign_code: performer.campaign_code,
        weekly_wagered: performer.weekly_wagered,
        total_lifetime_wagered: performer.total_lifetime_wagered,
        // Add prize_amount logic here if needed
        prize_amount: this.calculatePrizeAmount(index + 1)
      }));

      // Insert winners into archive
      const { error: insertError } = await supabase
        .from('past_winners')
        .insert(winnersData);

      if (insertError) {
        console.error('Error archiving winners:', insertError);
        return false;
      }

      console.log(`Successfully archived ${winnersData.length} winners from week ${previousWeekStart}`);
      return true;
    } catch (error) {
      console.error('Error in archivePreviousWeekWinners:', error);
      return false;
    }
  }

  /**
   * Calculate prize amount based on position (customize as needed)
   */
  private calculatePrizeAmount(position: number): number | undefined {
    // Example prize structure - customize as needed
    const prizeStructure: { [key: number]: number } = {
      1: 1000,  // 1st place
      2: 500,   // 2nd place
      3: 250,   // 3rd place
      4: 100,   // 4th place
      5: 50     // 5th place
    };
    
    return prizeStructure[position];
  }

  /**
   * Get current week's leaderboard
   */
  async getCurrentWeekLeaderboard(limit: number = 100): Promise<WeeklyLeaderboard[]> {
    try {
      const currentWeekStart = getUKWeekStart();
      
      const { data, error } = await supabase
        .from('weekly_leaderboard')
        .select('*')
        .eq('week_start_date', currentWeekStart)
        .order('weekly_wagered', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching current week leaderboard:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCurrentWeekLeaderboard:', error);
      return [];
    }
  }

  /**
   * Get past winners by week
   */
  async getPastWinners(weekStartDate?: string, limit: number = 50): Promise<PastWinner[]> {
    try {
      let query = supabase
        .from('past_winners')
        .select('*');

      if (weekStartDate) {
        query = query.eq('week_start_date', weekStartDate);
      }

      const { data, error } = await query
        .order('week_start_date', { ascending: false })
        .order('position', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching past winners:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPastWinners:', error);
      return [];
    }
  }

  /**
   * Get all archived weeks
   */
  async getArchivedWeeks(): Promise<{ week_start_date: string; week_end_date: string }[]> {
    try {
      const { data, error } = await supabase
        .from('past_winners')
        .select('week_start_date, week_end_date')
        .order('week_start_date', { ascending: false });

      if (error) {
        console.error('Error fetching archived weeks:', error);
        return [];
      }

      // Remove duplicates
      const uniqueWeeks = data?.reduce((acc: any[], current) => {
        const exists = acc.find(week => week.week_start_date === current.week_start_date);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);

      return uniqueWeeks || [];
    } catch (error) {
      console.error('Error in getArchivedWeeks:', error);
      return [];
    }
  }

  /**
   * Weekly reset process - should run at 00:00 UK time on Mondays
   */
  async performWeeklyReset(): Promise<boolean> {
    try {
      console.log('Starting weekly reset process...');
      
      // 1. Archive previous week's winners
      const archiveSuccess = await this.archivePreviousWeekWinners();
      if (!archiveSuccess) {
        console.error('Failed to archive previous week winners');
        return false;
      }

      // 2. Take initial snapshot for new week
      const snapshotSuccess = await this.takeWeeklySnapshot();
      if (!snapshotSuccess) {
        console.error('Failed to take initial snapshot for new week');
        return false;
      }

      console.log('Weekly reset process completed successfully');
      return true;
    } catch (error) {
      console.error('Error in performWeeklyReset:', error);
      return false;
    }
  }

  /**
   * Hourly update process - should run every hour
   */
  async performHourlyUpdate(): Promise<boolean> {
    try {
      console.log('Starting hourly update process...');
      
      // Check if it's Monday 00:00 UK time for weekly reset
      if (isUKMidnight() && new Date().getDay() === 1) { // Monday = 1
        console.log('Detected weekly reset time, performing reset...');
        return await this.performWeeklyReset();
      }

      // 1. Take snapshot
      const snapshotSuccess = await this.takeWeeklySnapshot();
      if (!snapshotSuccess) {
        console.error('Failed to take hourly snapshot');
        return false;
      }

      // 2. Update weekly leaderboard
      const leaderboardSuccess = await this.updateWeeklyLeaderboard();
      if (!leaderboardSuccess) {
        console.error('Failed to update weekly leaderboard');
        return false;
      }

      console.log('Hourly update process completed successfully');
      return true;
    } catch (error) {
      console.error('Error in performHourlyUpdate:', error);
      return false;
    }
  }

  /**
   * Initialize a new week's leaderboard with zero values
   */
  async initializeNewWeekLeaderboard(): Promise<boolean> {
    try {
      console.log('Initializing new week leaderboard...');
      
      const currentWeekStart = getUKWeekStart();
      const currentWeekEnd = getUKWeekEnd(currentWeekStart);

      // Get all active users from affiliate_stats
      const { data: activeUsers, error: fetchError } = await supabase
        .from('affiliate_stats')
        .select('username, campaign_code');

      if (fetchError) {
        console.error('Error fetching active users:', fetchError);
        return false;
      }

      if (!activeUsers || activeUsers.length === 0) {
        console.log('No active users to initialize leaderboard');
        return true;
      }

      // Initialize leaderboard entries with zero values
      const leaderboardData = activeUsers.map(user => ({
        username: user.username,
        campaign_code: user.campaign_code,
        week_start_date: currentWeekStart,
        week_end_date: currentWeekEnd,
        weekly_wagered: 0,
        total_deposit: 0,
        total_lifetime_wagered: 0
      }));

      // Insert initial leaderboard entries
      const { error: insertError } = await supabase
        .from('weekly_leaderboard')
        .upsert(leaderboardData, { onConflict: 'username,week_start_date' });

      if (insertError) {
        console.error('Error initializing leaderboard:', insertError);
        return false;
      }

      console.log(`Successfully initialized leaderboard for ${leaderboardData.length} users`);
      return true;
    } catch (error) {
      console.error('Error in initializeNewWeekLeaderboard:', error);
      return false;
    }
  }
}

export const weeklyLeaderboardService = new WeeklyLeaderboardService(); 