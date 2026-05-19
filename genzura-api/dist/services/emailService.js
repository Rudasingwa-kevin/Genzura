import nodemailer from 'nodemailer';
// Get verified sender email from env (must be verified in Brevo)
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'kevincracker02@gmail.com';
const SENDER_NAME = process.env.SENDER_NAME || 'Genzura Legal';
// Create reusable transporter using Brevo SMTP
const createTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.BREVO_SMTP_USER || 'your-brevo-email@example.com',
            pass: process.env.BREVO_SMTP_KEY || 'your-brevo-smtp-key'
        }
    });
};
export class EmailService {
    /**
     * Send welcome email to new users
     */
    static async sendWelcomeEmail(email, name) {
        const transporter = createTransporter();
        try {
            await transporter.sendMail({
                from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
                to: email,
                subject: 'Welcome to Genzura - Your Legal Management System',
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1e3a8a; margin: 0;">🎉 Welcome to Genzura</h1>
              <p style="color: #64748b; margin-top: 5px;">Rwanda's Modern Legal Case Management Platform</p>
            </div>

            <h2 style="color: #1e293b; margin-bottom: 20px;">Hi ${name},</h2>

            <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
              Your Genzura account has been successfully created! You can now manage your legal cases, track deadlines, and collaborate with your team all in one secure platform.
            </p>

            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #1e293b;">Quick Start:</h3>
              <ul style="color: #475569; line-height: 1.8;">
                <li>Create your first case</li>
                <li>Upload case documents</li>
                <li>Set important deadlines</li>
                <li>Invite team members</li>
              </ul>
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${process.env.FRONTEND_URL}/cases" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Go to Dashboard
              </a>
            </div>

            <p style="color: #475569; line-height: 1.6; margin-bottom: 20px; font-size: 14px;">
              Need help? Contact our support team or check out our documentation.
            </p>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; font-size: 12px; color: #94a3b8; text-align: center;">
              <p>&copy; 2026 Genzura Legal Management. All rights reserved.</p>
              <p>Kigali, Rwanda</p>
            </div>
          </div>
        `
            });
            console.log(`✅ Welcome email sent to ${email}`);
        }
        catch (error) {
            console.error('❌ Failed to send welcome email:', error);
            // Don't throw error - signup should still succeed even if email fails
        }
    }
    /**
     * Send password reset email
     */
    static async sendPasswordResetEmail(email, token) {
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        const transporter = createTransporter();
        try {
            await transporter.sendMail({
                from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
                to: email,
                subject: 'Reset Your Genzura Password',
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 12px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1e3a8a; margin: 0;">Genzura</h1>
              <p style="color: #64748b; margin-top: 5px;">Secure Litigation Management</p>
            </div>
            
            <h2 style="color: #1e293b; margin-bottom: 20px;">Reset your password</h2>
            
            <p style="color: #475569; line-height: 1.6; margin-bottom: 30px;">
              We received a request to reset your password for your Genzura account. Click the button below to set a new password:
            </p>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${resetLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
              If you didn't request a password reset, you can safely ignore this email. This link will expire in 1 hour.
            </p>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; font-size: 12px; color: #94a3b8; text-align: center;">
              <p>&copy; 2026 Genzura Litigation. All rights reserved.</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        `,
            });
            console.log(`✅ Password reset email sent to ${email}`);
        }
        catch (error) {
            console.error('❌ Failed to send password reset email:', error);
            throw new Error('Failed to send password reset email');
        }
    }
    /**
     * Send event reminder notification
     */
    static async sendEventReminder(email, eventTitle, eventDate, eventType, caseNumber) {
        const transporter = createTransporter();
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        try {
            await transporter.sendMail({
                from: '"Genzura Reminders" <reminders@genzura.rw>',
                to: email,
                subject: `⏰ Reminder: ${eventTitle}`,
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 30px; background-color: #fef3c7; padding: 15px; border-radius: 8px;">
              <h1 style="color: #92400e; margin: 0;">⏰ Event Reminder</h1>
            </div>

            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
              <h2 style="margin-top: 0; color: #1e293b;">${eventTitle}</h2>
              <p style="color: #475569; margin: 10px 0;"><strong>Type:</strong> ${eventType}</p>
              <p style="color: #475569; margin: 10px 0;"><strong>Date & Time:</strong> ${formattedDate}</p>
              ${caseNumber ? `<p style="color: #475569; margin: 10px 0;"><strong>Case:</strong> ${caseNumber}</p>` : ''}
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${process.env.FRONTEND_URL}/calendar" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                View in Calendar
              </a>
            </div>

            <p style="color: #475569; line-height: 1.6; font-size: 14px; text-align: center;">
              This is an automated reminder from Genzura.
            </p>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; font-size: 12px; color: #94a3b8; text-align: center;">
              <p>&copy; 2026 Genzura Legal Management</p>
            </div>
          </div>
        `
            });
            console.log(`✅ Reminder email sent to ${email} for event: ${eventTitle}`);
        }
        catch (error) {
            console.error('❌ Failed to send reminder email:', error);
            // Don't throw - notification should still work even if email fails
        }
    }
    /**
     * Send deadline alert
     */
    static async sendDeadlineAlert(email, caseNumber, caseTitle, deadline, daysUntil) {
        const transporter = createTransporter();
        const urgencyColor = daysUntil <= 1 ? '#dc2626' : daysUntil <= 3 ? '#f59e0b' : '#3b82f6';
        const urgencyText = daysUntil === 0 ? 'TODAY' : daysUntil === 1 ? 'TOMORROW' : `in ${daysUntil} days`;
        try {
            await transporter.sendMail({
                from: '"Genzura Alerts" <alerts@genzura.rw>',
                to: email,
                subject: `🚨 Deadline Alert: ${caseNumber} - ${urgencyText.toUpperCase()}`,
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid ${urgencyColor}; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 30px; background-color: ${urgencyColor}; padding: 15px; border-radius: 8px;">
              <h1 style="color: white; margin: 0;">🚨 DEADLINE ALERT</h1>
              <p style="color: white; margin-top: 10px; font-size: 18px; font-weight: bold;">${urgencyText.toUpperCase()}</p>
            </div>

            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid ${urgencyColor};">
              <h2 style="margin-top: 0; color: #1e293b;">${caseTitle}</h2>
              <p style="color: #475569; margin: 10px 0;"><strong>Case Number:</strong> ${caseNumber}</p>
              <p style="color: #475569; margin: 10px 0;"><strong>Deadline:</strong> ${deadline.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p style="color: ${urgencyColor}; margin: 10px 0; font-weight: bold; font-size: 16px;">⏰ Due ${urgencyText}</p>
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${process.env.FRONTEND_URL}/cases/${caseNumber}" style="background-color: ${urgencyColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                View Case Details
              </a>
            </div>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; font-size: 12px; color: #94a3b8; text-align: center;">
              <p>&copy; 2026 Genzura Legal Management</p>
            </div>
          </div>
        `
            });
            console.log(`✅ Deadline alert sent to ${email} for ${caseNumber}`);
        }
        catch (error) {
            console.error('❌ Failed to send deadline alert:', error);
        }
    }
    /**
     * Send subscription expiry warning
     */
    static async sendSubscriptionExpiryWarning(email, name, plan, expiryDate, daysUntil) {
        const transporter = createTransporter();
        const urgencyColor = daysUntil === 1 ? '#dc2626' : daysUntil === 3 ? '#f59e0b' : '#3b82f6';
        const urgencyEmoji = daysUntil === 1 ? '🚨' : daysUntil === 3 ? '⚠️' : '📅';
        const formattedDate = expiryDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        try {
            await transporter.sendMail({
                from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
                to: email,
                subject: `${urgencyEmoji} Your ${plan} subscription expires in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`,
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid ${urgencyColor}; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 30px; background-color: ${urgencyColor}; padding: 15px; border-radius: 8px;">
              <h1 style="color: white; margin: 0;">${urgencyEmoji} Subscription Expiring Soon</h1>
            </div>

            <h2 style="color: #1e293b; margin-bottom: 20px;">Hi ${name},</h2>

            <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
              Your <strong>${plan}</strong> subscription will expire in <strong style="color: ${urgencyColor};">${daysUntil} day${daysUntil > 1 ? 's' : ''}</strong> on <strong>${formattedDate}</strong>.
            </p>

            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid ${urgencyColor};">
              <h3 style="margin-top: 0; color: #1e293b;">What happens after expiry?</h3>
              <ul style="color: #475569; line-height: 1.8;">
                <li>Your account will be moved to the <strong>Genzura (Free)</strong> plan</li>
                <li>You'll keep all your existing cases and documents</li>
                <li>New case creation limited to 20 cases total</li>
                <li>New document uploads limited to 20 documents total</li>
                <li>Document downloads will be disabled</li>
              </ul>
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${process.env.FRONTEND_URL}/subscription" style="background-color: ${urgencyColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin-right: 10px;">
                Renew Now
              </a>
              <a href="${process.env.FRONTEND_URL}/subscription/plans" style="background-color: #f1f5f9; color: #1e293b; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                View Plans
              </a>
            </div>

            <p style="color: #475569; line-height: 1.6; font-size: 14px;">
              Questions? Contact our support team at support@genzura.rw
            </p>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; font-size: 12px; color: #94a3b8; text-align: center;">
              <p>&copy; 2026 Genzura Legal Management. All rights reserved.</p>
            </div>
          </div>
        `
            });
            console.log(`✅ Expiry warning sent to ${email} (${daysUntil} days)`);
        }
        catch (error) {
            console.error('❌ Failed to send expiry warning:', error);
        }
    }
    /**
     * Send grace period warning
     */
    static async sendGracePeriodWarning(email, name, plan, daysExpired) {
        const transporter = createTransporter();
        const daysRemaining = 3 - daysExpired;
        try {
            await transporter.sendMail({
                from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
                to: email,
                subject: `⚠️ Grace Period: ${daysRemaining} day${daysRemaining > 1 ? 's' : ''} until downgrade`,
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #dc2626; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 30px; background-color: #dc2626; padding: 15px; border-radius: 8px;">
              <h1 style="color: white; margin: 0;">⚠️ Subscription Expired - Grace Period Active</h1>
            </div>

            <h2 style="color: #1e293b; margin-bottom: 20px;">Hi ${name},</h2>

            <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
              Your <strong>${plan}</strong> subscription has expired. You're currently in a <strong style="color: #dc2626;">3-day grace period</strong>.
            </p>

            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #dc2626;">
              <h3 style="margin-top: 0; color: #dc2626;">⏰ ${daysRemaining} day${daysRemaining > 1 ? 's' : ''} remaining</h3>
              <p style="color: #475569; margin: 10px 0;">
                Your account will be automatically downgraded to the <strong>Free Plan</strong> in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''} if not renewed.
              </p>
              <ul style="color: #475569; line-height: 1.8; margin-top: 15px;">
                <li>All your data will be preserved</li>
                <li>Creation of new cases/documents will be limited</li>
                <li>Premium features will be disabled</li>
              </ul>
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${process.env.FRONTEND_URL}/subscription" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Renew Now to Keep Your Plan
              </a>
            </div>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; font-size: 12px; color: #94a3b8; text-align: center;">
              <p>&copy; 2026 Genzura Legal Management</p>
            </div>
          </div>
        `
            });
            console.log(`✅ Grace period warning sent to ${email} (${daysRemaining} days left)`);
        }
        catch (error) {
            console.error('❌ Failed to send grace period warning:', error);
        }
    }
    /**
     * Send subscription expired notification
     */
    static async sendSubscriptionExpiredEmail(email, name, previousPlan, casesCount, docsCount, caseOverage, docOverage) {
        const transporter = createTransporter();
        try {
            await transporter.sendMail({
                from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
                to: email,
                subject: '📋 Your subscription has expired - Now on Free Plan',
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 30px; background-color: #f1f5f9; padding: 15px; border-radius: 8px;">
              <h1 style="color: #1e293b; margin: 0;">📋 Subscription Expired</h1>
            </div>

            <h2 style="color: #1e293b; margin-bottom: 20px;">Hi ${name},</h2>

            <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
              Your <strong>${previousPlan}</strong> subscription has expired. Your account has been moved to the <strong>Genzura (Free)</strong> plan.
            </p>

            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #1e293b;">Your Account Status:</h3>
              <table style="width: 100%; color: #475569;">
                <tr>
                  <td style="padding: 8px 0;"><strong>Cases:</strong></td>
                  <td style="padding: 8px 0; text-align: right;">${casesCount} ${caseOverage > 0 ? `<span style="color: #f59e0b;">(${caseOverage} over limit)</span>` : ''}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Documents:</strong></td>
                  <td style="padding: 8px 0; text-align: right;">${docsCount} ${docOverage > 0 ? `<span style="color: #f59e0b;">(${docOverage} over limit)</span>` : ''}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Free Plan Limit:</strong></td>
                  <td style="padding: 8px 0; text-align: right;">20 cases, 20 documents</td>
                </tr>
              </table>
            </div>

            ${caseOverage > 0 || docOverage > 0 ? `
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
              <h3 style="margin-top: 0; color: #92400e;">⚠️ You're over the free plan limits</h3>
              <p style="color: #78350f; margin: 10px 0;">
                <strong>Good news:</strong> All your existing data is safe and accessible!
              </p>
              <p style="color: #78350f; margin: 10px 0;">
                However, you cannot create new cases or upload new documents until you:
              </p>
              <ul style="color: #78350f; line-height: 1.8;">
                ${caseOverage > 0 ? `<li>Delete at least ${caseOverage} case${caseOverage > 1 ? 's' : ''}</li>` : ''}
                ${docOverage > 0 ? `<li>Delete at least ${docOverage} document${docOverage > 1 ? 's' : ''}</li>` : ''}
                <li><strong>OR</strong> upgrade to a paid plan for unlimited access</li>
              </ul>
            </div>
            ` : `
            <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981;">
              <p style="color: #065f46; margin: 0;">
                ✅ You're within the free plan limits. You can continue creating cases and uploading documents!
              </p>
            </div>
            `}

            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${process.env.FRONTEND_URL}/subscription" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin-right: 10px;">
                Upgrade Now
              </a>
              <a href="${process.env.FRONTEND_URL}/cases" style="background-color: #f1f5f9; color: #1e293b; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Manage Cases
              </a>
            </div>

            <p style="color: #475569; line-height: 1.6; font-size: 14px;">
              Thank you for using Genzura. We hope you'll upgrade again soon!
            </p>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; font-size: 12px; color: #94a3b8; text-align: center;">
              <p>&copy; 2026 Genzura Legal Management. All rights reserved.</p>
            </div>
          </div>
        `
            });
            console.log(`✅ Subscription expired email sent to ${email}`);
        }
        catch (error) {
            console.error('❌ Failed to send subscription expired email:', error);
        }
    }
    /**
     * Test email configuration
     */
    static async testConnection() {
        const transporter = createTransporter();
        try {
            await transporter.verify();
            console.log('✅ Email service connected successfully');
            return true;
        }
        catch (error) {
            console.error('❌ Email service connection failed:', error);
            return false;
        }
    }
}
//# sourceMappingURL=emailService.js.map