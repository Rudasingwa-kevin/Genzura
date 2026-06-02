import { PrismaClient, CaseStatus, NotificationType } from '@prisma/client';
import { EmailService } from '../services/emailService.js';
import { NotificationService } from '../services/notificationService.js';
const prisma = new PrismaClient();
export class CaseDeadlineJob {
    /**
     * Main job that checks all case deadlines and sends alerts
     */
    static async run() {
        console.log('🔄 Running case deadline check...');
        const result = {
            processedCases: 0,
            alertsSent: 0,
            warnedExpired: 0,
            warnedToday: 0,
            warned1Day: 0,
            warned3Days: 0,
            warned7Days: 0,
            errors: []
        };
        try {
            const now = new Date();
            // Find all active or pending cases with a deadline
            const activeCases = await prisma.case.findMany({
                where: {
                    status: {
                        in: [CaseStatus.Active, CaseStatus.Pending]
                    },
                    deadline: {
                        not: null
                    }
                },
                include: {
                    attorney: true
                }
            });
            console.log(`📊 Found ${activeCases.length} active/pending cases with deadlines to check`);
            for (const kase of activeCases) {
                try {
                    if (!kase.deadline || !kase.attorney)
                        continue;
                    result.processedCases++;
                    const deadlineDate = new Date(kase.deadline);
                    const daysUntil = this.calculateDaysDifference(deadlineDate, now);
                    // We only alert on exact milestones: -1, 0, 1, 3, 7 days
                    const targetMilestones = [-1, 0, 1, 3, 7];
                    if (!targetMilestones.includes(daysUntil)) {
                        continue;
                    }
                    // Send warning/alert
                    await EmailService.sendDeadlineAlert(kase.attorney.email, kase.caseNumber, kase.title, deadlineDate, daysUntil);
                    // Create in-app notification
                    const formattedDate = deadlineDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                    let notifTitle = '';
                    let notifBody = '';
                    if (daysUntil === -1) {
                        notifTitle = 'Case Deadline EXPIRED 🚨';
                        notifBody = `Case ${kase.caseNumber} (${kase.title}) deadline has EXPIRED (${formattedDate}).`;
                        result.warnedExpired++;
                    }
                    else if (daysUntil === 0) {
                        notifTitle = 'Case Deadline TODAY ⏰';
                        notifBody = `Case ${kase.caseNumber} (${kase.title}) is due TODAY (${formattedDate}).`;
                        result.warnedToday++;
                    }
                    else if (daysUntil === 1) {
                        notifTitle = 'Case Deadline Tomorrow ⏰';
                        notifBody = `Case ${kase.caseNumber} (${kase.title}) deadline is TOMORROW (${formattedDate}).`;
                        result.warned1Day++;
                    }
                    else if (daysUntil === 3) {
                        notifTitle = 'Case Deadline Approaching 📅';
                        notifBody = `Case ${kase.caseNumber} (${kase.title}) deadline is in 3 days (${formattedDate}).`;
                        result.warned3Days++;
                    }
                    else if (daysUntil === 7) {
                        notifTitle = 'Case Deadline Approaching 📅';
                        notifBody = `Case ${kase.caseNumber} (${kase.title}) deadline is in 7 days (${formattedDate}).`;
                        result.warned7Days++;
                    }
                    await NotificationService.createNotification({
                        userId: kase.attorneyId,
                        type: NotificationType.deadline,
                        title: notifTitle,
                        body: notifBody,
                        link: `/cases/${kase.caseNumber}`
                    });
                    result.alertsSent++;
                    console.log(`📧 Alert sent for case ${kase.caseNumber} to ${kase.attorney.email} (Due in ${daysUntil} days)`);
                }
                catch (error) {
                    const errorMsg = `Failed to process case ${kase.caseNumber}: ${error.message}`;
                    console.error(`❌ ${errorMsg}`);
                    result.errors.push(errorMsg);
                }
            }
            console.log('✅ Case deadline check completed');
            console.log(`   - Processed cases: ${result.processedCases}`);
            console.log(`   - Total alerts sent: ${result.alertsSent}`);
            console.log(`   - Expired alerts: ${result.warnedExpired}`);
            console.log(`   - Due today alerts: ${result.warnedToday}`);
            console.log(`   - Tomorrow alerts: ${result.warned1Day}`);
            console.log(`   - 3-day alerts: ${result.warned3Days}`);
            console.log(`   - 7-day alerts: ${result.warned7Days}`);
            return result;
        }
        catch (error) {
            console.error('❌ Case deadline check job failed:', error);
            result.errors.push(`Job failed: ${error.message}`);
            return result;
        }
    }
    /**
     * Helper to normalize a date to start of day in Kigali timezone (UTC+2)
     */
    static getKigaliStartOfDay(date) {
        const options = { timeZone: 'Africa/Kigali', year: 'numeric', month: 'numeric', day: 'numeric' };
        const formatter = new Intl.DateTimeFormat('en-US', options);
        const parts = formatter.formatToParts(date);
        const year = parseInt(parts.find(p => p.type === 'year').value);
        const month = parseInt(parts.find(p => p.type === 'month').value) - 1;
        const day = parseInt(parts.find(p => p.type === 'day').value);
        return new Date(year, month, day).getTime();
    }
    /**
     * Helper to calculate the difference in calendar days between targetDate and baseDate in Kigali timezone
     */
    static calculateDaysDifference(targetDate, baseDate) {
        const d1Start = this.getKigaliStartOfDay(targetDate);
        const d2Start = this.getKigaliStartOfDay(baseDate);
        return Math.round((d1Start - d2Start) / (1000 * 60 * 60 * 24));
    }
    /**
     * Manual trigger for testing/admin purposes
     */
    static async runManual() {
        console.log('🔧 Manual case deadline check triggered');
        return await this.run();
    }
}
//# sourceMappingURL=caseDeadlineJob.js.map