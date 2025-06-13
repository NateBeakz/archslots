import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function getUKWeekStart(date = new Date()) {
  const ukTime = new Date(date.toLocaleString("en-US", {timeZone: "Europe/London"}));
  const ukDate = new Date(ukTime.getFullYear(), ukTime.getMonth(), ukTime.getDate());
  
  const dayOfWeek = ukDate.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  const monday = new Date(ukDate);
  monday.setDate(ukDate.getDate() - daysToMonday);
  
  return monday.toISOString().split('T')[0];
}

async function testWeeklyCalculations() {
  try {
    console.log('🧪 Testing Weekly Calculation Logic');
    console.log('=====================================');
    
    const currentWeekStart = getUKWeekStart();
    console.log(`📅 Current week start: ${currentWeekStart}`);
    
    // Get current affiliate stats for a few users
    const { data: currentStats, error: currentStatsError } = await supabase
      .from('affiliate_stats')
      .select('*')
      .order('lifetime_wagered', { ascending: false })
      .limit(10);

    if (currentStatsError) {
      console.error('❌ Error fetching current stats:', currentStatsError);
      return;
    }

    if (!currentStats || currentStats.length === 0) {
      console.log('⚠️ No current stats found');
      return;
    }

    console.log(`\n📊 Testing calculations for top ${currentStats.length} users:\n`);

    for (const user of currentStats) {
      // Get first snapshot of this week for baseline
      const { data: firstSnapshot } = await supabase
        .from('weekly_snapshots')
        .select('*')
        .eq('username', user.username)
        .eq('week_start_date', currentWeekStart)
        .order('snapshot_datetime', { ascending: true })
        .limit(1);

      let weeklyWagered = 0;
      let weeklyDeposit = 0;
      let hasBaseline = false;

      if (firstSnapshot && firstSnapshot.length > 0) {
        hasBaseline = true;
        const baseline = firstSnapshot[0];
        weeklyWagered = Math.max(0, user.lifetime_wagered - baseline.lifetime_wagered_at_snapshot);
        weeklyDeposit = Math.max(0, user.deposit - baseline.deposit_at_snapshot);
        
        console.log(`👤 ${user.username}:`);
        console.log(`   📈 Baseline (${baseline.snapshot_datetime.split('T')[0]}): Wagered $${baseline.lifetime_wagered_at_snapshot.toLocaleString()}, Deposit $${baseline.deposit_at_snapshot.toLocaleString()}`);
        console.log(`   💰 Current: Wagered $${user.lifetime_wagered.toLocaleString()}, Deposit $${user.deposit.toLocaleString()}`);
        console.log(`   🔥 Weekly Difference: Wagered +$${weeklyWagered.toLocaleString()}, Deposit +$${weeklyDeposit.toLocaleString()}`);
      } else {
        weeklyWagered = user.lifetime_wagered;
        weeklyDeposit = user.deposit;
        
        console.log(`👤 ${user.username}:`);
        console.log(`   ⚠️ No baseline snapshot found - treating all as weekly`);
        console.log(`   💰 Current (all weekly): Wagered $${weeklyWagered.toLocaleString()}, Deposit $${weeklyDeposit.toLocaleString()}`);
      }
      
      console.log(`   ✅ Weekly Amounts: $${weeklyWagered.toLocaleString()} wagered, $${weeklyDeposit.toLocaleString()} deposited`);
      console.log('');
    }

    // Check current leaderboard
    const { data: leaderboard } = await supabase
      .from('weekly_leaderboard')
      .select('*')
      .eq('week_start_date', currentWeekStart)
      .order('weekly_wagered', { ascending: false })
      .limit(5);

    if (leaderboard && leaderboard.length > 0) {
      console.log('\n🏆 Current Weekly Leaderboard (Top 5):');
      leaderboard.forEach((entry, index) => {
        console.log(`${index + 1}. ${entry.username}: $${entry.weekly_wagered.toLocaleString()} (weekly), $${entry.total_lifetime_wagered.toLocaleString()} (lifetime)`);
      });
    }

    // Show snapshot count
    const { count: snapshotCount } = await supabase
      .from('weekly_snapshots')
      .select('*', { count: 'exact', head: true })
      .eq('week_start_date', currentWeekStart);

    console.log(`\n📸 Total snapshots for current week: ${snapshotCount || 0}`);
    
  } catch (error) {
    console.error('❌ Error in test:', error);
  }
}

testWeeklyCalculations(); 