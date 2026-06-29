import cron from 'node-cron';
import { CaseDeadlineJob } from '../jobs/caseDeadlineJob.js';
import { KeepAliveJob } from '../jobs/keepAliveJob.js';
export class CronScheduler {
    static tasks = [];
    /**
     * Initialize all scheduled jobs
     */
    static initialize() {
        console.log('⏰ Initializing cron scheduler...');
        // Case deadline check - runs at 8:00 AM (server is warm) + noon backup
        const deadlineJob = cron.schedule('0 8 * * *', async () => {
            console.log('🕐 [CRON] Running scheduled case deadline check (8 AM)...');
            try {
                await CaseDeadlineJob.run();
            }
            catch (error) {
                console.error('❌ [CRON] Case deadline check job failed:', error);
            }
        }, {
            timezone: 'Africa/Kigali'
        });
        // Case deadline backup check at noon — catches missed 8 AM run (deduplication prevents double-sending)
        const deadlineBackupJob = cron.schedule('0 12 * * *', async () => {
            console.log('🕐 [CRON] Running backup case deadline check (12 PM)...');
            try {
                await CaseDeadlineJob.run();
            }
            catch (error) {
                console.error('❌ [CRON] Backup deadline check job failed:', error);
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
        this.tasks.push(deadlineJob);
        this.tasks.push(deadlineBackupJob);
        this.tasks.push(keepAliveJob);
        console.log('✅ Cron scheduler initialized');
        console.log('   📅 Case deadline check: Daily at 8:00 AM + 12:00 PM (Africa/Kigali)');
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