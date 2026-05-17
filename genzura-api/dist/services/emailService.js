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