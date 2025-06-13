import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const AFFILIATE_API_URL = 'https://affiliate.shuffle.com/stats/a3c8d93b-e3b5-47af-8afe-5cfdf13667c7';
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Utility functions for UK time calculations
function getUKWeekStart(date = new Date()) {
  const ukTime = new Date(date.toLocaleString("en-US", {timeZone: "Europe/London"}));
  const ukDate = new Date(ukTime.getFullYear(), ukTime.getMonth(), ukTime.getDate());
  
  const dayOfWeek = ukDate.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  const monday = new Date(ukDate);
  monday.setDate(ukDate.getDate() - daysToMonday);
  
  return monday.toISOString().split('T')[0];
}

function getUKWeekEnd(weekStartDate) {
  const startDate = new Date(weekStartDate);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  return endDate.toISOString().split('T')[0];
}

async function archivePreviousWeekWinners() {
  try {
    console.log('🏆 Archiving previous week winners...');
    
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
      console.error('❌ Error fetching top performers:', fetchError);
      return false;
    }

    if (!topPerformers || topPerformers.length === 0) {
      console.log('ℹ️ No previous week data to archive');
      return true;
    }

    // Prize structure
    const prizeStructure = {
      1: 1000,  // 1st place
      2: 500,   // 2nd place
      3: 250,   // 3rd place
      4: 100,   // 4th place
      5: 50     // 5th place
    };

    // Create winners data
    const winnersData = topPerformers.map((performer, index) => ({
      week_start_date: previousWeekStart,
      week_end_date: previousWeekEnd,
      position: index + 1,
      username: performer.username,
      campaign_code: performer.campaign_code,
      weekly_wagered: performer.weekly_wagered,
      total_lifetime_wagered: performer.total_lifetime_wagered,
      prize_amount: prizeStructure[index + 1] || null
    }));

    // Insert winners into archive
    const { error: insertError } = await supabase
      .from('past_winners')
      .insert(winnersData);

    if (insertError) {
      console.error('❌ Error archiving winners:', insertError);
      return false;
    }

    console.log(`✅ Successfully archived ${winnersData.length} winners from week ${previousWeekStart}`);
    
    // Display the archived winners
    console.log('\n🏆 ARCHIVED WINNERS:');
    console.log(`Week: ${previousWeekStart} to ${previousWeekEnd}`);
    winnersData.slice(0, 10).forEach((winner) => {
      const prizeText = winner.prize_amount ? ` (Prize: $${winner.prize_amount})` : '';
      console.log(`${winner.position}. ${winner.username}: $${winner.weekly_wagered.toLocaleString(undefined, { minimumFractionDigits: 2 })}${prizeText}`);
    });

    return true;
  } catch (error) {
    console.error('❌ Error in archivePreviousWeekWinners:', error);
    return false;
  }
}

async function performWeeklyReset() {
  try {
    console.log('🔄 Starting weekly reset process...');
    console.log(`⏰ Reset time: ${new Date().toISOString()}`);
    
    // 1. Archive previous week's winners
    const archiveSuccess = await archivePreviousWeekWinners();
    if (!archiveSuccess) {
      console.error('❌ Failed to archive previous week winners');
      return false;
    }

    // 2. Take initial snapshot for new week
    console.log('📸 Taking initial snapshot for new week...');
    
    const response = await fetch(AFFILIATE_API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch affiliate stats');
    }
    const stats = await response.json();
    
    // Filter out users with no activity
    const activeUsers = stats.filter(user => user.deposit > 0 || user.lifetimeWagered > 0);
    console.log(`📊 Found ${activeUsers.length} active users`);

    const currentWeekStart = getUKWeekStart();
    const snapshotTime = new Date().toISOString();

    const snapshotData = activeUsers.map(stat => ({
      username: stat.username,
      campaign_code: 'ARCH',
      week_start_date: currentWeekStart,
      snapshot_datetime: snapshotTime,
      lifetime_wagered_at_snapshot: parseFloat(stat.lifetimeWagered) || 0,
      deposit_at_snapshot: parseFloat(stat.deposit) || 0,
      weekly_wagered_calculated: 0 // Reset to 0 for new week
    }));

    // Insert initial snapshots for new week
    const { error: snapshotError } = await supabase
      .from('weekly_snapshots')
      .insert(snapshotData);

    if (snapshotError) {
      console.error('❌ Error inserting initial snapshots:', snapshotError);
      return false;
    }

    console.log(`✅ Successfully took initial snapshot for new week (${currentWeekStart})`);

    // 3. Initialize weekly leaderboard for new week
    console.log('🏁 Initializing weekly leaderboard for new week...');
    const currentWeekEnd = getUKWeekEnd(currentWeekStart);

    const leaderboardData = activeUsers.map(stat => ({
      username: stat.username,
      campaign_code: 'ARCH',
      week_start_date: currentWeekStart,
      week_end_date: currentWeekEnd,
      weekly_wagered: 0, // Start at 0 for new week
      total_deposit: 0, // Start at 0 for new week (weekly deposits)
      total_lifetime_wagered: parseFloat(stat.lifetimeWagered) || 0
    }));

    const { error: leaderboardError } = await supabase
      .from('weekly_leaderboard')
      .insert(leaderboardData);

    if (leaderboardError) {
      console.error('❌ Error initializing weekly leaderboard:', leaderboardError);
      return false;
    }

    console.log(`✅ Successfully initialized weekly leaderboard for ${leaderboardData.length} users`);
    console.log(`📅 New week period: ${currentWeekStart} to ${currentWeekEnd}`);
    console.log('🎉 Weekly reset process completed successfully!');
    
    return true;
  } catch (error) {
    console.error('❌ Error in performWeeklyReset:', error);
    return false;
  }
}

// Check if this is being run as the main script
if (import.meta.url === `file://${process.argv[1]}`) {
  performWeeklyReset()
    .then(success => {
      if (success) {
        console.log('✅ Weekly reset completed successfully');
        process.exit(0);
      } else {
        console.error('❌ Weekly reset failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Weekly reset failed with error:', error);
      process.exit(1);
    });
} 