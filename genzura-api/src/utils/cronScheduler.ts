import cron, { ScheduledTask } from 'node-cron';
import { SubscriptionExpiryJob } from '../jobs/subscriptionExpiryJob.js';

export class CronScheduler {
  private static tasks: ScheduledTask[] = [];

  /**
   * Initialize all scheduled jobs
   */
  static initialize() {
    console.log('⏰ Initializing cron scheduler...');

    // Subscription expiry check - runs daily at 2:00 AM
    const expiryJob = cron.schedule('0 2 * * *', async () => {
      console.log('🕐 [CRON] Running scheduled subscription expiry check...');
      try {
        await SubscriptionExpiryJob.run();
      } catch (error) {
        console.error('❌ [CRON] Subscription expiry job failed:', error);
      }
    }, {
      timezone: 'Africa/Kigali'
    });

    this.tasks.push(expiryJob);

    console.log('✅ Cron scheduler initialized');
    console.log('   📅 Subscription expiry check: Daily at 2:00 AM (Africa/Kigali)');
  }

  /**
   * Start all scheduled tasks
   */
  static start() {
    this.tasks.forEach(task => task.start());
    console.log('▶️ All cron tasks started');
  }

  /**
   * Stop all scheduled tasks
   */
  static stop() {
    this.tasks.forEach(task => task.stop());
    console.log('⏸️ All cron tasks stopped');
  }

  /**
   * Destroy all scheduled tasks
   */
  static destroy() {
    this.tasks.forEach(task => task.destroy());
    this.tasks = [];
    console.log('🗑️ All cron tasks destroyed');
  }
}
