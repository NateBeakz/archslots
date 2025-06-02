import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const AFFILIATE_API_URL = 'https://affiliate.shuffle.com/stats/a3c8d93b-e3b5-47af-8afe-5cfdf13667c7';
const supabaseUrl = 'https://kakqgeepcugvwpcygldo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtha3FnZWVwY3VndndwY3lnbGRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3OTc1MDksImV4cCI6MjA2NDM3MzUwOX0.xVTmDYqua01kEqS18t14TWwkY6r8noV9ap7RcKnt6Ys';

const supabase = createClient(supabaseUrl, supabaseKey);

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

    // First, let's insert all records
    const { error: insertError } = await supabase
      .from('affiliate_stats')
      .insert(
        activeUsers.map(stat => ({
          username: stat.username,
          campaign_code: 'ARCH',
          deposit: parseFloat(stat.deposit) || 0,
          lifetime_wagered: parseFloat(stat.lifetimeWagered) || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
      );

    if (insertError && !insertError.message.includes('duplicate key')) {
      console.error('Insert error:', insertError);
    }

    // Then update existing records
    for (const stat of activeUsers) {
      const { error: updateError } = await supabase
        .from('affiliate_stats')
        .update({
          deposit: parseFloat(stat.deposit) || 0,
          lifetime_wagered: parseFloat(stat.lifetimeWagered) || 0,
          updated_at: new Date().toISOString()
        })
        .eq('username', stat.username);

      if (updateError) {
        console.error(`Error updating ${stat.username}:`, updateError);
      }
    }

    console.log('Stats update completed!');
    
    // Fetch and display top 5 users by lifetime wagered
    const { data: topUsers, error: fetchError } = await supabase
      .from('affiliate_stats')
      .select('*')
      .order('lifetime_wagered', { ascending: false })
      .limit(5);
      
    if (fetchError) {
      throw fetchError;
    }
    
    console.log('\nTop 5 Users by Lifetime Wagered:');
    topUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username}: $${user.lifetime_wagered.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
    });
    
  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

updateStats(); 