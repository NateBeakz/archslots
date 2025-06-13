import { createClient } from '@supabase/supabase-js';

// Add comprehensive logging
console.log('Weekly reset module loaded at:', new Date().toISOString());
console.log('Environment check:', {
  hasSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
  hasSupabaseKey: !!process.env.VITE_SUPABASE_ANON_KEY,
  hasCronSecret: !!process.env.CRON_SECRET_KEY
});

export default async function handler(req, res) {
  try {
    console.log('Weekly reset started');
    
    // Verify cron secret
    const cronSecret = req.headers['x-cron-secret'];
    if (cronSecret !== process.env.CRON_SECRET_KEY) {
      console.log('Unauthorized access attempt');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify it's Friday (UK time)
    const now = new Date();
    const ukTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/London' }));
    if (ukTime.getDay() !== 5) { // 5 is Friday
      console.log('Reset attempted on non-Friday:', ukTime.toISOString());
      return res.status(400).json({ 
        error: 'Weekly reset can only be performed on Friday (UK time)',
        currentTime: ukTime.toISOString()
      });
    }

    // Reset weekly leaderboard
    console.log('Starting weekly leaderboard reset...');
    
    const { error: resetError } = await supabase
      .from('weekly_leaderboard')
      .delete()
      .neq('id', 0); // Delete all records except the dummy record

    if (resetError) {
      console.error('Error resetting weekly leaderboard:', resetError);
      throw new Error(`Failed to reset weekly leaderboard: ${resetError.message}`);
    }

    // Reset weekly stats
    console.log('Resetting weekly stats...');
    
    const { error: statsError } = await supabase
      .from('weekly_stats')
      .delete()
      .neq('id', 0);

    if (statsError) {
      console.error('Error resetting weekly stats:', statsError);
      throw new Error(`Failed to reset weekly stats: ${statsError.message}`);
    }

    console.log('Weekly reset completed successfully');
    return res.status(200).json({ 
      success: true,
      message: 'Weekly reset completed',
      timestamp: ukTime.toISOString()
    });

  } catch (error) {
    console.error('Weekly reset error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'Unknown error'
    });
  }
} 