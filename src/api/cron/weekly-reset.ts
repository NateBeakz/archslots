import { AutomationService } from '../../lib/services/automationService';
import { isFridayUK } from '../../lib/utils/dateUtils';

export default async function handler(req: any, res: any) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET_KEY;
  if (req.headers['x-cron-secret'] !== cronSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Verify it's Friday in UK time
  if (!isFridayUK()) {
    return res.status(400).json({ error: 'Weekly reset can only be run on Fridays' });
  }

  try {
    const automationService = AutomationService.getInstance();
    const success = await automationService.runWeeklyReset();
    
    if (success) {
      res.status(200).json({ message: 'Weekly reset completed successfully' });
    } else {
      res.status(500).json({ error: 'Weekly reset failed' });
    }
  } catch (error) {
    console.error('Error in weekly reset endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 