import { createClient } from '@supabase/supabase-js';
import { PublicAffiliateStats, PublicWeeklyLeaderboard, PublicPastWinner } from '../lib/supabase/client';
import { checkRateLimit } from '../lib/utils/redisRateLimit';

// Server-side Supabase client with full access
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_SERVICE_KEY || ''
);

// Security headers
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

export async function GET(req: Request) {
  try {
    // Get client IP for rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    
    // Check rate limit
    const { allowed, headers: rateLimitHeaders } = await checkRateLimit('leaderboard', ip);
    
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...rateLimitHeaders,
          ...securityHeaders
        }
      });
    }

    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    const weekStart = url.searchParams.get('weekStart');

    // Validate required parameters
    if (!type || !weekStart) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...securityHeaders
        }
      });
    }

    // Validate weekStart format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
      return new Response(JSON.stringify({ error: 'Invalid weekStart format' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...securityHeaders
        }
      });
    }

    switch (type) {
      case 'current':
        const { data: currentData, error: currentError } = await supabaseAdmin
          .from('weekly_leaderboard')
          .select('username, weekly_wagered')
          .eq('week_start_date', weekStart)
          .order('weekly_wagered', { ascending: false })
          .limit(50);

        if (currentError) throw currentError;

        const currentLeaderboard: PublicWeeklyLeaderboard[] = currentData.map((entry, index) => ({
          username: entry.username,
          weekly_wagered: entry.weekly_wagered,
          position: index + 1
        }));

        return new Response(JSON.stringify(currentLeaderboard), {
          headers: {
            'Content-Type': 'application/json',
            ...rateLimitHeaders,
            ...securityHeaders
          }
        });

      case 'past':
        const { data: pastData, error: pastError } = await supabaseAdmin
          .from('past_winners')
          .select('week_start_date, week_end_date, position, username, weekly_wagered, prize_amount')
          .eq('week_start_date', weekStart)
          .order('position', { ascending: true });

        if (pastError) throw pastError;

        const pastWinners: PublicPastWinner[] = pastData.map(winner => ({
          week_start_date: winner.week_start_date,
          week_end_date: winner.week_end_date,
          position: winner.position,
          username: winner.username,
          weekly_wagered: winner.weekly_wagered,
          prize_amount: winner.prize_amount
        }));

        return new Response(JSON.stringify(pastWinners), {
          headers: {
            'Content-Type': 'application/json',
            ...rateLimitHeaders,
            ...securityHeaders
          }
        });

      default:
        return new Response(JSON.stringify({ error: 'Invalid type parameter' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...securityHeaders
          }
        });
    }
  } catch (error) {
    console.error('Error in leaderboard API:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...securityHeaders
      }
    });
  }
} 