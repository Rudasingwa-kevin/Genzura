import nodemailer from 'nodemailer';

// Get verified sender email from env (must be verified in Brevo)
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'kevincracker02@gmail.com';
const SENDER_NAME = process.env.SENDER_NAME || 'Genzura Legal';

// Genzura Brand Colors
const BRAND_COLORS = {
  blue: '#185FA5',      // Primary brand blue
  dark: '#0C447C',      // Dark blue
  light: '#E6F1FB',     // Light blue background
  green: '#3B6D11',     // Brand green
  greenLight: '#EAF3DE' // Light green
};

// Logo URL (served from API's public folder or external CDN)
// For production, upload to CDN and set LOGO_URL env variable
// For now, serving from API server at /public/Genzura%20full%20logo.png
const API_URL = process.env.API_URL || 'http://localhost:5000';
const LOGO_URL = process.env.LOGO_URL || `${API_URL}/public/Genzura%20full%20logo.png`;

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

// Email header with Genzura branding and actual logo
const getEmailHeader = (title: string) => `
  <div style="background: linear-gradient(135deg, ${BRAND_COLORS.blue} 0%, ${BRAND_COLORS.dark} 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
    <div style="background: white; padding: 25px 40px; margin: 0 auto 25px; border-radius: 14px; display: inline-block; box-shadow: 0 6px 16px rgba(0,0,0,0.2);">
      <img src="${LOGO_URL}" alt="Genzura Legal" style="height: 150px; width: auto; display: block; margin: 0 auto;" />
    </div>
    <h2 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">${title}</h2>
  </div>
`;

// Email footer with Genzura branding and logo
const getEmailFooter = () => `
  <div style="border-top: 2px solid ${BRAND_COLORS.light}; padding-top: 35px; margin-top: 40px; text-align: center;">
    <div style="margin-bottom: 25px;">
      <img src="${LOGO_URL}" alt="Genzura Legal" style="height: 120px; width: auto; display: inline-block; margin-bottom: 15px;" />
      <p style="color: ${BRAND_COLORS.dark}; margin: 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">Stay in Control of Every Case</p>
    </div>
    <p style="color: #94a3b8; font-size: 13px; margin: 6px 0; font-weight: 500;">© 2026 Genzura Legal Management. All rights reserved.</p>
    <p style="color: #94a3b8; font-size: 12px; margin: 6px 0;">Kigali, Rwanda</p>
  </div>
`;

export class EmailService {
  /**
   * Send welcome email to new users
   */
  static async sendWelcomeEmail(email: string, name: string) {
    const transporter = createTransporter();

    try {
      await transporter.sendMail({
        from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
        to: email,
        subject: 'Welcome to Genzura - Your Legal Management System',
        html: `
          <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            ${getEmailHeader('Welcome to Genzura! 🎉')}

            <div style="padding: 35px 30px;">
              <h2 style="color: ${BRAND_COLORS.dark}; margin: 0 0 20px 0; font-size: 22px; font-weight: 700;">Hi ${name},</h2>

              <p style="color: #475569; line-height: 1.7; margin-bottom: 25px; font-size: 15px;">
                Your Genzura account has been successfully created! You can now manage your legal cases, track deadlines, and collaborate with your team all in one secure platform.
              </p>

              <div style="background: ${BRAND_COLORS.light}; padding: 25px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid ${BRAND_COLORS.blue};">
                <h3 style="margin: 0 0 15px 0; color: ${BRAND_COLORS.dark}; font-size: 16px; font-weight: 700;">Quick Start Guide:</h3>
                <ul style="color: #475569; line-height: 2; margin: 0; padding-left: 20px; font-size: 14px;">
                  <li>Create your first case</li>
                  <li>Upload case documents</li>
                  <li>Set important deadlines</li>
                  <li>Invite team members</li>
                </ul>
              </div>

              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${process.env.FRONTEND_URL}/cases" style="background: linear-gradient(135deg, ${BRAND_COLORS.blue} 0%, ${BRAND_COLORS.dark} 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block; font-size: 15px; box-shadow: 0 4px 12px rgba(24, 95, 165, 0.3);">
                  Go to Dashboard →
                </a>
              </div>

              <p style="color: #64748b; line-height: 1.6; margin-bottom: 20px; font-size: 13px; text-align: center;">
                Need help? Contact our support team at <a href="mailto:support@genzura.rw" style="color: ${BRAND_COLORS.blue}; text-decoration: none; font-weight: 600;">support@genzura.rw</a>
              </p>

              ${getEmailFooter()}
            </div>
          </div>
        `
      });

      console.log(`✅ Welcome email sent to ${email}`);
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      // Don't throw error - signup should still succeed even if email fails
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email: string, token: string) {
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
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Send event reminder notification
   */
  static async sendEventReminder(
    email: string,
    eventTitle: string,
    eventDate: Date,
    eventType: string,
    caseNumber?: string
  ) {
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
    } catch (error) {
      console.error('❌ Failed to send reminder email:', error);
      // Don't throw - notification should still work even if email fails
    }
  }

  /**
   * Send deadline alert
   */
  static async sendDeadlineAlert(
    email: string,
    caseNumber: string,
    caseTitle: string,
    deadline: Date,
    daysUntil: number
  ) {
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
    } catch (error) {
      console.error('❌ Failed to send deadline alert:', error);
    }
  }

  /**
   * Send subscription expiry warning
   */
  static async sendSubscriptionExpiryWarning(
    email: string,
    name: string,
    plan: string,
    expiryDate: Date,
    daysUntil: number
  ) {
    const transporter = createTransporter();

    const urgencyColor = daysUntil === 1 ? '#dc2626' : daysUntil === 3 ? '#f59e0b' : BRAND_COLORS.blue;
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
          <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 3px solid ${urgencyColor};">
            ${getEmailHeader(`Subscription Expiring ${urgencyEmoji}`)}

            <div style="padding: 35px 30px;">
              <h2 style="color: ${BRAND_COLORS.dark}; margin: 0 0 20px 0; font-size: 22px; font-weight: 700;">Hi ${name},</h2>

              <div style="background: linear-gradient(135deg, ${urgencyColor}15 0%, ${urgencyColor}05 100%); padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid ${urgencyColor};">
                <p style="color: #1e293b; line-height: 1.7; margin: 0; font-size: 15px;">
                  Your <strong style="color: ${urgencyColor};">${plan}</strong> subscription will expire in <strong style="color: ${urgencyColor}; font-size: 18px;">${daysUntil} day${daysUntil > 1 ? 's' : ''}</strong> on <strong>${formattedDate}</strong>.
                </p>
              </div>

              <div style="background: ${BRAND_COLORS.light}; padding: 25px; border-radius: 10px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px 0; color: ${BRAND_COLORS.dark}; font-size: 16px; font-weight: 700;">What happens after expiry?</h3>
                <ul style="color: #475569; line-height: 2; margin: 0; padding-left: 20px; font-size: 14px;">
                  <li>Your account moves to <strong>Genzura (Free)</strong> plan</li>
                  <li>✅ All existing cases and documents are preserved</li>
                  <li>📊 New case creation limited to 20 cases total</li>
                  <li>📄 New document uploads limited to 20 documents</li>
                  <li>⬇️ Document downloads will be disabled</li>
                </ul>
              </div>

              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${process.env.FRONTEND_URL}/subscription" style="background: linear-gradient(135deg, ${urgencyColor} 0%, ${urgencyColor}dd 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block; margin: 5px; font-size: 15px; box-shadow: 0 4px 12px ${urgencyColor}40;">
                  Renew Now →
                </a>
                <a href="${process.env.FRONTEND_URL}/subscription/plans" style="background: ${BRAND_COLORS.light}; color: ${BRAND_COLORS.dark}; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block; margin: 5px; font-size: 15px; border: 2px solid ${BRAND_COLORS.blue};">
                  View Plans
                </a>
              </div>

              <p style="color: #64748b; line-height: 1.6; font-size: 13px; text-align: center;">
                Questions? Contact us at <a href="mailto:support@genzura.rw" style="color: ${BRAND_COLORS.blue}; text-decoration: none; font-weight: 600;">support@genzura.rw</a>
              </p>

              ${getEmailFooter()}
            </div>
          </div>
        `
      });

      console.log(`✅ Expiry warning sent to ${email} (${daysUntil} days)`);
    } catch (error) {
      console.error('❌ Failed to send expiry warning:', error);
    }
  }

  /**
   * Send grace period warning
   */
  static async sendGracePeriodWarning(
    email: string,
    name: string,
    plan: string,
    daysExpired: number
  ) {
    const transporter = createTransporter();
    const daysRemaining = 3 - daysExpired;

    try {
      await transporter.sendMail({
        from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
        to: email,
        subject: `⚠️ Grace Period: ${daysRemaining} day${daysRemaining > 1 ? 's' : ''} until downgrade`,
        html: `
          <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 3px solid #dc2626;">
            <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px 20px; text-align: center;">
              <div style="background: white; width: 160px; height: 50px; margin: 0 auto 15px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <h1 style="color: ${BRAND_COLORS.blue}; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">GENZURA</h1>
              </div>
              <h2 style="color: white; margin: 0; font-size: 20px; font-weight: 600;">⚠️ Grace Period Active</h2>
            </div>

            <div style="padding: 35px 30px;">
              <h2 style="color: ${BRAND_COLORS.dark}; margin: 0 0 20px 0; font-size: 22px; font-weight: 700;">Hi ${name},</h2>

              <p style="color: #475569; line-height: 1.7; margin-bottom: 25px; font-size: 15px;">
                Your <strong>${plan}</strong> subscription has expired. You're currently in a <strong style="color: #dc2626;">3-day grace period</strong>.
              </p>

              <div style="background: linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%); padding: 25px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #dc2626;">
                <h3 style="margin: 0 0 10px 0; color: #dc2626; font-size: 18px; font-weight: 700;">⏰ ${daysRemaining} day${daysRemaining > 1 ? 's' : ''} remaining</h3>
                <p style="color: #475569; margin: 0 0 15px 0; font-size: 14px;">
                  Your account will be automatically downgraded to the <strong>Free Plan</strong> in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''} if not renewed.
                </p>
                <ul style="color: #475569; line-height: 2; margin: 0; padding-left: 20px; font-size: 14px;">
                  <li>✅ All your data will be preserved</li>
                  <li>📊 Creation of new cases/documents will be limited</li>
                  <li>⭐ Premium features will be disabled</li>
                </ul>
              </div>

              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${process.env.FRONTEND_URL}/subscription" style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 16px 36px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block; font-size: 16px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);">
                  Renew Now to Keep Your Plan →
                </a>
              </div>

              ${getEmailFooter()}
            </div>
          </div>
        `
      });

      console.log(`✅ Grace period warning sent to ${email} (${daysRemaining} days left)`);
    } catch (error) {
      console.error('❌ Failed to send grace period warning:', error);
    }
  }

  /**
   * Send subscription expired notification
   */
  static async sendSubscriptionExpiredEmail(
    email: string,
    name: string,
    previousPlan: string,
    casesCount: number,
    docsCount: number,
    caseOverage: number,
    docOverage: number
  ) {
    const transporter = createTransporter();

    try {
      await transporter.sendMail({
        from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
        to: email,
        subject: '📋 Your subscription has expired - Now on Free Plan',
        html: `
          <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            ${getEmailHeader('Subscription Expired 📋')}

            <div style="padding: 35px 30px;">
              <h2 style="color: ${BRAND_COLORS.dark}; margin: 0 0 20px 0; font-size: 22px; font-weight: 700;">Hi ${name},</h2>

              <p style="color: #475569; line-height: 1.7; margin-bottom: 25px; font-size: 15px;">
                Your <strong>${previousPlan}</strong> subscription has expired. Your account has been moved to the <strong>Genzura (Free)</strong> plan.
              </p>

              <div style="background: ${BRAND_COLORS.light}; padding: 25px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid ${BRAND_COLORS.blue};">
                <h3 style="margin: 0 0 15px 0; color: ${BRAND_COLORS.dark}; font-size: 16px; font-weight: 700;">📊 Your Account Status:</h3>
                <table style="width: 100%; color: #475569; font-size: 14px;">
                  <tr>
                    <td style="padding: 10px 0;"><strong>Cases:</strong></td>
                    <td style="padding: 10px 0; text-align: right;"><strong>${casesCount}</strong> ${caseOverage > 0 ? `<span style="color: #f59e0b; font-weight: 600;">(${caseOverage} over limit)</span>` : '<span style="color: #10b981;">✓</span>'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0;"><strong>Documents:</strong></td>
                    <td style="padding: 10px 0; text-align: right;"><strong>${docsCount}</strong> ${docOverage > 0 ? `<span style="color: #f59e0b; font-weight: 600;">(${docOverage} over limit)</span>` : '<span style="color: #10b981;">✓</span>'}</td>
                  </tr>
                  <tr style="border-top: 2px solid ${BRAND_COLORS.blue};">
                    <td style="padding: 10px 0;"><strong>Free Plan Limit:</strong></td>
                    <td style="padding: 10px 0; text-align: right;"><strong>20 cases, 20 documents</strong></td>
                  </tr>
                </table>
              </div>

              ${caseOverage > 0 || docOverage > 0 ? `
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fef9e7 100%); padding: 25px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #f59e0b;">
                <h3 style="margin: 0 0 10px 0; color: #92400e; font-size: 16px; font-weight: 700;">⚠️ You're over the free plan limits</h3>
                <p style="color: #78350f; margin: 0 0 10px 0; font-size: 14px;">
                  <strong>Good news:</strong> All your existing data is safe and accessible!
                </p>
                <p style="color: #78350f; margin: 0 0 10px 0; font-size: 14px;">
                  However, you cannot create new cases or upload new documents until you:
                </p>
                <ul style="color: #78350f; line-height: 2; margin: 0; padding-left: 20px; font-size: 14px;">
                  ${caseOverage > 0 ? `<li>Delete at least <strong>${caseOverage}</strong> case${caseOverage > 1 ? 's' : ''}</li>` : ''}
                  ${docOverage > 0 ? `<li>Delete at least <strong>${docOverage}</strong> document${docOverage > 1 ? 's' : ''}</li>` : ''}
                  <li><strong>OR</strong> upgrade to a paid plan for unlimited access</li>
                </ul>
              </div>
              ` : `
              <div style="background: linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%); padding: 25px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #10b981;">
                <p style="color: #065f46; margin: 0; font-size: 14px; font-weight: 600;">
                  ✅ You're within the free plan limits. You can continue creating cases and uploading documents!
                </p>
              </div>
              `}

              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${process.env.FRONTEND_URL}/subscription" style="background: linear-gradient(135deg, ${BRAND_COLORS.blue} 0%, ${BRAND_COLORS.dark} 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block; margin: 5px; font-size: 15px; box-shadow: 0 4px 12px rgba(24, 95, 165, 0.3);">
                  Upgrade Now →
                </a>
                <a href="${process.env.FRONTEND_URL}/cases" style="background: ${BRAND_COLORS.light}; color: ${BRAND_COLORS.dark}; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block; margin: 5px; font-size: 15px; border: 2px solid ${BRAND_COLORS.blue};">
                  Manage Cases
                </a>
              </div>

              <p style="color: #64748b; line-height: 1.6; font-size: 13px; text-align: center; margin-bottom: 20px;">
                Thank you for using Genzura. We hope you'll upgrade again soon!
              </p>

              ${getEmailFooter()}
            </div>
          </div>
        `
      });

      console.log(`✅ Subscription expired email sent to ${email}`);
    } catch (error) {
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
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }
}
