import { createClient } from '@supabase/supabase-js';
import { checkRateLimit } from '../../lib/utils/redisRateLimit';
import { isFridayUK } from '../../lib/utils/dateUtils';

// Add comprehensive logging
console.log('Weekly reset module loaded at:', new Date().toISOString());
console.log('Environment check:', {
  hasSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
  hasSupabaseKey: !!process.env.VITE_SUPABASE_ANON_KEY,
  hasCronSecret: !!process.env.CRON_SECRET_KEY
});

// Server-side Supabase client with full access
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default async function handler(req: Request, res: any) {
  console.log('Weekly reset started at:', new Date().toISOString());
  
  try {
    // Verify cron secret
    const cronSecret = req.headers.get('x-cron-secret');
    if (cronSecret !== process.env.CRON_SECRET_KEY) {
      console.error('Unauthorized access attempt:', { 
        providedSecret: cronSecret ? 'present' : 'missing',
        expectedSecret: process.env.CRON_SECRET_KEY ? 'present' : 'missing'
      });
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify it's Friday (UK time)
    if (!isFridayUK()) {
      console.log('Reset attempted on non-Friday:', new Date().toISOString());
      return res.status(400).json({ 
        error: 'Weekly reset can only be performed on Friday (UK time)',
        currentTime: new Date().toISOString()
      });
    }

    // Get client IP for rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    console.log('Request from IP:', ip);
    
    // Check rate limit
    const { allowed, headers: rateLimitHeaders } = await checkRateLimit('cron', ip);
    
    if (!allowed) {
      console.log('Rate limit exceeded for IP:', ip);
      return res.status(429).json({ 
        error: 'Too many requests',
        headers: rateLimitHeaders
      });
    }

    // Reset weekly leaderboard
    console.log('Starting weekly leaderboard reset...');
    
    const { error: resetError } = await supabaseAdmin
      .from('weekly_leaderboard')
      .delete()
      .neq('id', 0); // Delete all records except the dummy record

    if (resetError) {
      console.error('Error resetting weekly leaderboard:', resetError);
      throw new Error(`Failed to reset weekly leaderboard: ${resetError.message}`);
    }

    // Reset weekly stats
    console.log('Resetting weekly stats...');
    
    const { error: statsError } = await supabaseAdmin
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
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Weekly reset error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
} 