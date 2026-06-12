import cron from 'node-cron';
import { SubscriptionExpiryJob } from '../jobs/subscriptionExpiryJob.js';
import { CaseDeadlineJob } from '../jobs/caseDeadlineJob.js';
import { KeepAliveJob } from '../jobs/keepAliveJob.js';
export class CronScheduler {
    static tasks = [];
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
            }
            catch (error) {
                console.error('❌ [CRON] Subscription expiry job failed:', error);
            }
        }, {
            timezone: 'Africa/Kigali'
        });
        // Case deadline check - runs daily at 3:00 AM
        const deadlineJob = cron.schedule('0 3 * * *', async () => {
            console.log('🕐 [CRON] Running scheduled case deadline check...');
            try {
                await CaseDeadlineJob.run();
            }
            catch (error) {
                console.error('❌ [CRON] Case deadline check job failed:', error);
            }
        }, {
            timezone: 'Africa/Kigali'
        });
        // Keep-alive ping — every 14 minutes (Render free tier spins down at 15 min idle)
        const keepAliveJob = cron.schedule('*/14 * * * *', async () => {
            try {
                await KeepAliveJob.run();
            }
            catch (error) {
                console.error('❌ [CRON] Keep-alive job failed:', error);
            }
        });
        this.tasks.push(expiryJob);
        this.tasks.push(deadlineJob);
        this.tasks.push(keepAliveJob);
        console.log('✅ Cron scheduler initialized');
        console.log('   📅 Subscription expiry check: Daily at 2:00 AM (Africa/Kigali)');
        console.log('   📅 Case deadline check: Daily at 3:00 AM (Africa/Kigali)');
        console.log('   🏓 Keep-alive ping: Every 14 minutes (production only)');
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
//# sourceMappingURL=cronScheduler.js.map