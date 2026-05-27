import { Router } from 'express';
import { EmailService } from '../services/emailService.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
const router = Router();
// Admin only - test email configuration
router.use(authenticate);
router.use(authorize(['Admin']));
/**
 * POST /api/test/email/connection
 * Test SMTP connection
 */
router.post('/email/connection', async (req, res) => {
    try {
        const isConnected = await EmailService.testConnection();
        if (isConnected) {
            res.json({
                success: true,
                message: 'Email service connected successfully! ✅',
                details: {
                    host: 'smtp-relay.brevo.com',
                    port: 587,
                    secure: false,
                    configured: true
                }
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Email service connection failed! ❌',
                error: 'Unable to verify SMTP connection'
            });
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Email service test failed',
            error: error.message
        });
    }
});
/**
 * POST /api/test/email/send
 * Send test email
 */
router.post('/email/send', async (req, res) => {
    try {
        const { to, type } = req.body;
        if (!to) {
            return res.status(400).json({
                success: false,
                error: 'Recipient email address is required'
            });
        }
        let result;
        switch (type) {
            case 'subscription_activated':
                await EmailService.sendSubscriptionActivatedEmail(to, 'Test User', 'Intango', new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
                );
                result = 'Subscription activated email sent';
                break;
            case 'subscription_extended':
                await EmailService.sendSubscriptionExtendedEmail(to, 'Test User', 'Intango', 30, new Date(Date.now() + 120 * 24 * 60 * 60 * 1000) // 120 days from now
                );
                result = 'Subscription extended email sent';
                break;
            case 'subscription_cancelled':
                await EmailService.sendSubscriptionCancelledEmail(to, 'Test User', 'Intango');
                result = 'Subscription cancelled email sent';
                break;
            case 'welcome':
                await EmailService.sendWelcomeEmail(to, 'Test User');
                result = 'Welcome email sent';
                break;
            case 'invitation':
                const token = 'test-invitation-token-123';
                const inviterName = 'Admin User';
                const role = 'Attorney';
                await EmailService.sendInvitationEmail(to, 'Test User', role, token, inviterName);
                result = 'Invitation email sent';
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid email type. Use: subscription_activated, subscription_extended, subscription_cancelled, welcome, invitation'
                });
        }
        res.json({
            success: true,
            message: `${result} successfully! ✅`,
            details: {
                to,
                type,
                sender: process.env.SENDER_EMAIL,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('Test email send error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send test email ❌',
            error: error.message,
            details: error.stack
        });
    }
});
/**
 * GET /api/test/email/config
 * Get email configuration status (without exposing credentials)
 */
router.get('/email/config', (req, res) => {
    const config = {
        smtpConfigured: !!(process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_KEY),
        senderEmail: process.env.SENDER_EMAIL || 'Not configured',
        senderName: process.env.SENDER_NAME || 'Not configured',
        frontendUrl: process.env.FRONTEND_URL || 'Not configured',
        apiUrl: process.env.API_URL || 'Not configured',
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false,
        hasUser: !!process.env.BREVO_SMTP_USER,
        hasKey: !!process.env.BREVO_SMTP_KEY,
        userMasked: process.env.BREVO_SMTP_USER
            ? `${process.env.BREVO_SMTP_USER.substring(0, 5)}...`
            : 'Not set'
    };
    const allConfigured = config.smtpConfigured && config.senderEmail !== 'Not configured';
    res.json({
        configured: allConfigured,
        status: allConfigured ? 'Ready ✅' : 'Incomplete ⚠️',
        config,
        recommendations: allConfigured ? [] : [
            !config.smtpConfigured && 'Set BREVO_SMTP_USER and BREVO_SMTP_KEY in .env',
            config.senderEmail === 'Not configured' && 'Set SENDER_EMAIL in .env',
            config.frontendUrl === 'Not configured' && 'Set FRONTEND_URL in .env'
        ].filter(Boolean)
    });
});
/**
 * POST /api/test/email/all-templates
 * Send all email templates to test recipient
 */
router.post('/email/all-templates', async (req, res) => {
    try {
        const { to } = req.body;
        if (!to) {
            return res.status(400).json({
                success: false,
                error: 'Recipient email address is required'
            });
        }
        const results = [];
        const templates = [
            'subscription_activated',
            'subscription_extended',
            'subscription_cancelled',
            'welcome',
            'invitation'
        ];
        for (const type of templates) {
            try {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between emails
                switch (type) {
                    case 'subscription_activated':
                        await EmailService.sendSubscriptionActivatedEmail(to, 'Test User', 'Intango', new Date(Date.now() + 90 * 24 * 60 * 60 * 1000));
                        break;
                    case 'subscription_extended':
                        await EmailService.sendSubscriptionExtendedEmail(to, 'Test User', 'Intango', 30, new Date(Date.now() + 120 * 24 * 60 * 60 * 1000));
                        break;
                    case 'subscription_cancelled':
                        await EmailService.sendSubscriptionCancelledEmail(to, 'Test User', 'Intango');
                        break;
                    case 'welcome':
                        await EmailService.sendWelcomeEmail(to, 'Test User');
                        break;
                    case 'invitation':
                        await EmailService.sendInvitationEmail(to, 'Test User', 'Attorney', 'test-token-123', 'Admin User');
                        break;
                }
                results.push({ type, status: 'sent ✅' });
            }
            catch (error) {
                results.push({ type, status: 'failed ❌', error: error.message });
            }
        }
        const successCount = results.filter(r => r.status.includes('✅')).length;
        const failureCount = results.filter(r => r.status.includes('❌')).length;
        res.json({
            success: failureCount === 0,
            message: `Sent ${successCount}/${templates.length} email templates`,
            results,
            summary: {
                total: templates.length,
                success: successCount,
                failed: failureCount
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to send test emails',
            error: error.message
        });
    }
});
export default router;
//# sourceMappingURL=testRoutes.js.map