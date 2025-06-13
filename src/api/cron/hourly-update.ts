import { AutomationService } from '../../lib/services/automationService';
import { isFridayUK } from '../../lib/utils/dateUtils';

export default async function handler(req: any, res: any) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET_KEY;
  if (req.headers['x-cron-secret'] !== cronSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const automationService = AutomationService.getInstance();
    const success = await automationService.runHourlyUpdate();
    
    if (success) {
      res.status(200).json({ message: 'Hourly update completed successfully' });
    } else {
      res.status(500).json({ error: 'Hourly update failed' });
    }
  } catch (error) {
    console.error('Error in hourly update endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 