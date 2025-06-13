import { createClient } from '@supabase/supabase-js';
import { checkRateLimit } from '../../lib/utils/redisRateLimit';
import { isFridayUK } from '../../lib/utils/dateUtils';

// Server-side Supabase client with full access
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_SERVICE_KEY || ''
);

export async function POST(req: Request) {
  try {
    // Verify cron secret
    const cronSecret = req.headers.get('x-cron-secret');
    if (cronSecret !== process.env.CRON_SECRET_KEY) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify it's Friday (UK time)
    if (!isFridayUK()) {
      return new Response(JSON.stringify({ 
        error: 'Weekly reset can only be performed on Friday (UK time)',
        currentTime: new Date().toISOString()
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get client IP for rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    
    // Check rate limit
    const { allowed, headers: rateLimitHeaders } = await checkRateLimit('cron', ip);
    
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...rateLimitHeaders
        }
      });
    }

    // Your existing weekly reset logic here
    // ...

    return new Response(JSON.stringify({ 
      message: 'Weekly reset completed successfully',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...rateLimitHeaders
      }
    });

  } catch (error) {
    console.error('Error in weekly reset:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 