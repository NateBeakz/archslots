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

async function updateStats() {
  try {
    console.log('Fetching affiliate stats...');
    const response = await fetch(AFFILIATE_API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch affiliate stats');
    }
    const stats = await response.json();
    
    console.log(`Found ${stats.length} records to update`);
    
    // Filter out users with no activity
    const activeUsers = stats.filter(user => user.deposit > 0 || user.lifetimeWagered > 0);
    console.log(`${activeUsers.length} active users found`);

    // Update affiliate_stats table
    const { error: upsertError } = await supabase
      .from('affiliate_stats')
      .upsert(
        activeUsers.map(stat => ({
          username: stat.username,
          campaign_code: 'ARCH',
          deposit: parseFloat(stat.deposit) || 0,
          lifetime_wagered: parseFloat(stat.lifetimeWagered) || 0,
          updated_at: new Date().toISOString()
        })),
        { onConflict: 'username' }
      );

    if (upsertError) {
      console.error('Error upserting affiliate stats:', upsertError);
      return;
    }

    console.log('Affiliate stats updated successfully!');

    // Take weekly snapshot
    console.log('Taking weekly snapshot...');
    const currentWeekStart = getUKWeekStart();
    const snapshotTime = new Date().toISOString();

    const snapshotData = activeUsers.map(stat => ({
      username: stat.username,
      campaign_code: 'ARCH',
      week_start_date: currentWeekStart,
      snapshot_datetime: snapshotTime,
      lifetime_wagered_at_snapshot: parseFloat(stat.lifetimeWagered) || 0,
      deposit_at_snapshot: parseFloat(stat.deposit) || 0,
      weekly_wagered_calculated: 0 // Will be calculated properly in leaderboard update
    }));

    // Insert snapshots
    if (snapshotData.length > 0) {
      const { error: snapshotError } = await supabase
        .from('weekly_snapshots')
        .insert(snapshotData);

      if (snapshotError) {
        console.error('Error inserting snapshots:', snapshotError);
      } else {
        console.log(`Successfully took snapshot of ${snapshotData.length} users`);
      }
    }

    // Update weekly leaderboard
    console.log('Updating weekly leaderboard...');
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);
    const weekEndStr = currentWeekEnd.toISOString().split('T')[0];

    const leaderboardData = [];
    for (const stat of activeUsers) {
      // Get the FIRST snapshot of this week for this user (baseline)
      const { data: firstSnapshot } = await supabase
        .from('weekly_snapshots')
        .select('*')
        .eq('username', stat.username)
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
        
        weeklyWagered = Math.max(0, stat.lifetimeWagered - startOfWeekWagered);
        weeklyDeposit = Math.max(0, stat.deposit - startOfWeekDeposit);
      } else {
        // No baseline snapshot yet - this means all current amounts are "weekly"
        // This happens for new users or at the very start of a new week
        weeklyWagered = stat.lifetimeWagered;
        weeklyDeposit = stat.deposit;
      }

      leaderboardData.push({
        username: stat.username,
        campaign_code: 'ARCH',
        week_start_date: currentWeekStart,
        week_end_date: weekEndStr,
        weekly_wagered: weeklyWagered,
        total_deposit: weeklyDeposit, // Weekly deposit amount
        total_lifetime_wagered: parseFloat(stat.lifetimeWagered) || 0
      });
    }

    if (leaderboardData.length > 0) {
      const { error: leaderboardError } = await supabase
        .from('weekly_leaderboard')
        .upsert(leaderboardData, { onConflict: 'username,week_start_date' });

      if (leaderboardError) {
        console.error('Error updating weekly leaderboard:', leaderboardError);
      } else {
        console.log(`Successfully updated weekly leaderboard for ${leaderboardData.length} users`);
        
        // Show some sample calculations for debugging
        const topWeeklyUsers = leaderboardData
          .filter(user => user.weekly_wagered > 0)
          .sort((a, b) => b.weekly_wagered - a.weekly_wagered)
          .slice(0, 5);
          
        if (topWeeklyUsers.length > 0) {
          console.log('\n📊 Sample Weekly Calculations:');
          topWeeklyUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.username}: Weekly: $${user.weekly_wagered.toLocaleString(undefined, { minimumFractionDigits: 2 })}, Lifetime: $${user.total_lifetime_wagered.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
          });
        }
      }
    }
    
    // Display results
    console.log('\n=== CURRENT WEEK LEADERBOARD (Top 10) ===');
    const { data: currentWeekTop, error: currentWeekError } = await supabase
      .from('weekly_leaderboard')
      .select('*')
      .eq('week_start_date', currentWeekStart)
      .order('weekly_wagered', { ascending: false })
      .limit(10);
      
    if (currentWeekError) {
      console.error('Error fetching current week leaderboard:', currentWeekError);
    } else if (currentWeekTop && currentWeekTop.length > 0) {
      console.log(`Week: ${currentWeekStart} to ${weekEndStr}`);
      currentWeekTop.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username}: $${user.weekly_wagered.toLocaleString(undefined, { minimumFractionDigits: 2 })} (weekly)`);
      });
    } else {
      console.log('No current week leaderboard data available');
    }

    console.log('\n=== LIFETIME LEADERBOARD (Top 5) ===');
    const { data: topUsers, error: fetchError } = await supabase
      .from('affiliate_stats')
      .select('*')
      .order('lifetime_wagered', { ascending: false })
      .limit(5);
      
    if (fetchError) {
      throw fetchError;
    }
    
    if (topUsers && topUsers.length > 0) {
      topUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username}: $${user.lifetime_wagered.toLocaleString(undefined, { minimumFractionDigits: 2 })} (lifetime)`);
      });
    }
    
  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

updateStats(); 