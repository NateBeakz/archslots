import { AutomationService } from '../../lib/services/automationService';
import { isFridayUK } from '../../lib/utils/dateUtils';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit } from '../../lib/utils/redisRateLimit';

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

    const automationService = AutomationService.getInstance();
    const success = await automationService.runHourlyUpdate();
    
    if (success) {
      return new Response(JSON.stringify({ 
        message: 'Hourly update completed successfully',
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...rateLimitHeaders
        }
      });
    } else {
      return new Response(JSON.stringify({ error: 'Hourly update failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error in hourly update:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 