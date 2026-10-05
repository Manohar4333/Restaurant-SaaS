import cron from 'node-cron';
import { SubscriptionService } from '../services/subscription.service';

export function startSubscriptionJob() {
  // Run once every hour at minute 0 (0 * * * *)
  cron.schedule('0 * * * *', async () => {
    try {
      await SubscriptionService.checkSubscriptionStatuses();
    } catch (err) {
      console.error('[SubscriptionJob] Error running automated check:', err);
    }
  });

  console.log('[Cron] Subscription evaluator job scheduled (runs hourly).');
}
