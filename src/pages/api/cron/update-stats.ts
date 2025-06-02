import { NextApiRequest, NextApiResponse } from 'next';
import { updateAffiliateStats } from '@/lib/services/affiliateService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify the request is from the cron job
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const success = await updateAffiliateStats();
    if (success) {
      res.status(200).json({ message: 'Stats updated successfully' });
    } else {
      res.status(500).json({ error: 'Failed to update stats' });
    }
  } catch (error) {
    console.error('Error in cron job:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 