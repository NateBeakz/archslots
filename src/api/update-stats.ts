import { updateAffiliateStats } from '../lib/services/affiliateService';

export async function POST(req: Request) {
  // Verify the request is from the cron job
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${import.meta.env.VITE_CRON_SECRET_KEY}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const success = await updateAffiliateStats();
    if (success) {
      return new Response(JSON.stringify({ message: 'Stats updated successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ error: 'Failed to update stats' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error in cron job:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 