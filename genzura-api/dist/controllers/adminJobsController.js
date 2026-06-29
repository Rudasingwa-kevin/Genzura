import { CaseDeadlineJob } from '../jobs/caseDeadlineJob.js';
export class AdminJobsController {
    /**
     * POST /api/admin/jobs/run-deadline-check
     * Manually trigger case deadline check (for testing/admin purposes)
     */
    static async runDeadlineCheck(req, res) {
        try {
            // Only admins can trigger this
            if (req.user?.role !== 'Admin') {
                return res.status(403).json({ error: 'Forbidden: Admin access required' });
            }
            console.log(`🔧 Manual case deadline check triggered by ${req.user.email}`);
            const result = await CaseDeadlineJob.runManual();
            res.json({
                success: true,
                message: 'Case deadline check completed',
                result: {
                    processedCases: result.processedCases,
                    alertsSent: result.alertsSent,
                    warnings: {
                        'expired': result.warnedExpired,
                        'today': result.warnedToday,
                        '1day': result.warned1Day,
                        '3days': result.warned3Days,
                        '7days': result.warned7Days
                    },
                    errors: result.errors
                }
            });
        }
        catch (error) {
            console.error('❌ Failed to run case deadline check:', error);
            res.status(500).json({
                error: 'Failed to run case deadline check',
                details: error.message
            });
        }
    }
    /**
     * GET /api/admin/jobs/status
     * Get status of scheduled jobs
     */
    static async getJobsStatus(req, res) {
        try {
            if (req.user?.role !== 'Admin') {
                return res.status(403).json({ error: 'Forbidden: Admin access required' });
            }
            res.json({
                jobs: [
                    {
                        name: 'Case Deadline Check',
                        schedule: 'Daily at 3:00 AM (Africa/Kigali)',
                        status: 'running',
                        description: 'Checks for approaching or expired case deadlines and sends alerts'
                    }
                ],
                timezone: 'Africa/Kigali'
            });
        }
        catch (error) {
            console.error('❌ Failed to get jobs status:', error);
            res.status(500).json({ error: 'Failed to get jobs status' });
        }
    }
}
//# sourceMappingURL=adminJobsController.js.map