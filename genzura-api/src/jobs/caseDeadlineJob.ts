import { PrismaClient, CaseStatus, NotificationType } from '@prisma/client';
import { EmailService } from '../services/emailService.js';
import { NotificationService } from '../services/notificationService.js';

const prisma = new PrismaClient();

// Deduplication: prevent sending the same deadline alert more than once per day
async function alreadySentAlertToday(userId: string, caseNumber: string): Promise<boolean> {
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
  const existing = await prisma.notification.findFirst({
    where: {
      userId,
      type: NotificationType.deadline,
      body: {
        contains: caseNumber
      },
      createdAt: {
        gte: twelveHoursAgo
      }
    }
  });
  return !!existing;
}

interface DeadlineCheckResult {
  processedCases: number;
  alertsSent: number;
  warnedExpired: number;
  warnedToday: number;
  warned1Day: number;
  warned3Days: number;
  warned7Days: number;
  errors: string[];
}

export class CaseDeadlineJob {
  /**
   * Main job that checks all case deadlines and sends alerts
   */
  static async run(): Promise<DeadlineCheckResult> {
    console.log('🔄 Running case deadline check...');

    const result: DeadlineCheckResult = {
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
          if (!kase.deadline || !kase.attorney) continue;

          result.processedCases++;

          const deadlineDate = new Date(kase.deadline);
          const daysUntil = this.calculateDaysDifference(deadlineDate, now);

          // Alert milestones:
          // - Exact: 7 days out (early warning)
          // - Range: 0-3 days (catches missed daily runs during business hours)
          // - Overdue: -1 and below (every day until resolved)
          const isUrgentRange = daysUntil >= 0 && daysUntil <= 3;
          const isEarlyWarning = daysUntil === 7;
          const isExpired = daysUntil < 0 && daysUntil >= -7; // alert for up to 7 days after expiry
          if (!isUrgentRange && !isEarlyWarning && !isExpired) {
            continue;
          }

          // Deduplication: skip if we already sent a deadline alert for this case today
          const alreadySent = await alreadySentAlertToday(kase.attorneyId, kase.caseNumber);
          if (alreadySent) {
            console.log(`⏭️  Skipping case ${kase.caseNumber} — alert already sent in the last 12h`);
            continue;
          }

          // Send warning/alert
          await EmailService.sendDeadlineAlert(
            kase.attorney.email,
            kase.caseNumber,
            kase.title,
            deadlineDate,
            daysUntil
          );

          // Create in-app notification
          const formattedDate = deadlineDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });

          let notifTitle = '';
          let notifBody = '';

          if (daysUntil < 0) {
            const absDays = Math.abs(daysUntil);
            notifTitle = 'Case Deadline EXPIRED 🚨';
            notifBody = `Case ${kase.caseNumber} (${kase.title}) deadline EXPIRED ${absDays} day${absDays === 1 ? '' : 's'} ago (${formattedDate}).`;
            result.warnedExpired++;
          } else if (daysUntil === 0) {
            notifTitle = 'Case Deadline TODAY ⏰';
            notifBody = `Case ${kase.caseNumber} (${kase.title}) is due TODAY (${formattedDate}).`;
            result.warnedToday++;
          } else if (daysUntil === 1) {
            notifTitle = 'Case Deadline Tomorrow ⏰';
            notifBody = `Case ${kase.caseNumber} (${kase.title}) deadline is TOMORROW (${formattedDate}).`;
            result.warned1Day++;
          } else if (daysUntil <= 3) {
            notifTitle = 'Case Deadline Approaching 📅';
            notifBody = `Case ${kase.caseNumber} (${kase.title}) deadline is in ${daysUntil} days (${formattedDate}).`;
            result.warned3Days++;
          } else if (daysUntil === 7) {
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
        } catch (error: any) {
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
    } catch (error: any) {
      console.error('❌ Case deadline check job failed:', error);
      result.errors.push(`Job failed: ${error.message}`);
      return result;
    }
  }

  /**
   * Helper to normalize a date to start of day in Kigali timezone (UTC+2)
   */
  private static getKigaliStartOfDay(date: Date): number {
    const options = { timeZone: 'Africa/Kigali', year: 'numeric', month: 'numeric', day: 'numeric' } as const;
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(date);
    const year = parseInt(parts.find(p => p.type === 'year')!.value);
    const month = parseInt(parts.find(p => p.type === 'month')!.value) - 1;
    const day = parseInt(parts.find(p => p.type === 'day')!.value);
    
    return new Date(year, month, day).getTime();
  }

  /**
   * Helper to calculate the difference in calendar days between targetDate and baseDate in Kigali timezone
   */
  static calculateDaysDifference(targetDate: Date, baseDate: Date): number {
    const d1Start = this.getKigaliStartOfDay(targetDate);
    const d2Start = this.getKigaliStartOfDay(baseDate);
    return Math.round((d1Start - d2Start) / (1000 * 60 * 60 * 24));
  }

  /**
   * Manual trigger for testing/admin purposes
   */
  static async runManual(): Promise<DeadlineCheckResult> {
    console.log('🔧 Manual case deadline check triggered');
    return await this.run();
  }
}
