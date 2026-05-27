import nodemailer from 'nodemailer';
import { S3Service } from './s3Service.js';
import * as SibApiV3Sdk from '@sendinblue/client';

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

// S3 logo key
const LOGO_S3_KEY = 'branding/genzura-logo.png';

// Get logo URL (from S3 or fallback to local)
async function getLogoUrl(): Promise<string> {
  // If S3 is configured, generate presigned URL (valid for 7 days for emails)
  if (S3Service.isConfigured()) {
    try {
      const sevenDaysInSeconds = 7 * 24 * 60 * 60;
      return await S3Service.getPresignedUrl(LOGO_S3_KEY, sevenDaysInSeconds);
    } catch (error) {
      console.error('[EmailService] Failed to generate S3 presigned URL for logo:', error);
      // Fallback to local
    }
  }

  // Fallback to production API or local
  const API_URL = process.env.NODE_ENV === 'production'
    ? 'https://genzura-api.onrender.com'
    : (process.env.API_URL || 'http://localhost:5000');
  return `${API_URL}/public/Genzura%20full%20logo.png`;
}

// Check if Brevo API is configured (preferred for serverless)
const isBrevoApiConfigured = () => !!process.env.BREVO_API_KEY;

// Create Brevo API client
const createBrevoApiClient = () => {
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY!);
  return apiInstance;
};

// Create reusable transporter using Brevo SMTP (fallback)
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_USER || 'your-brevo-email@example.com',
      pass: process.env.BREVO_SMTP_KEY || 'your-brevo-smtp-key'
    },
    connectionTimeout: 30000, // 30 seconds
    greetingTimeout: 30000,
    socketTimeout: 60000 // 60 seconds
  });
};

// Helper function to send email (tries API first, falls back to SMTP)
const sendEmail = async (to: string, subject: string, htmlContent: string) => {
  // Try Brevo API first (works on serverless)
  if (isBrevoApiConfigured()) {
    try {
      const apiInstance = createBrevoApiClient();
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

      sendSmtpEmail.sender = { name: SENDER_NAME, email: SENDER_EMAIL };
      sendSmtpEmail.to = [{ email: to }];
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = htmlContent;

      await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log(`✅ Email sent via Brevo API to ${to}`);
      return;
    } catch (error) {
      console.error('⚠️ Brevo API failed, trying SMTP fallback:', error);
    }
  }

  // Fallback to SMTP (may timeout on serverless)
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
    to,
    subject,
    html: htmlContent
  });
  console.log(`✅ Email sent via SMTP to ${to}`);
};

// Email header with Genzura branding and actual logo
const getEmailHeader = (title: string, logoUrl: string) => `
  <div style="background: linear-gradient(135deg, ${BRAND_COLORS.blue} 0%, ${BRAND_COLORS.dark} 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
    <div style="background: white; padding: 25px 40px; margin: 0 auto 25px; border-radius: 14px; display: inline-block; box-shadow: 0 6px 16px rgba(0,0,0,0.2);">
      <img src="${logoUrl}" alt="Genzura Legal" style="height: 150px; width: auto; display: block; margin: 0 auto;" />
    </div>
    <h2 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">${title}</h2>
  </div>
`;

// Email footer with Genzura branding and logo
const getEmailFooter = (logoUrl: string) => `
  <div style="border-top: 2px solid ${BRAND_COLORS.light}; padding-top: 35px; margin-top: 40px; text-align: center;">
    <div style="margin-bottom: 25px;">
      <img src="${logoUrl}" alt="Genzura Legal" style="height: 120px; width: auto; display: inline-block; margin-bottom: 15px;" />
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
    const logoUrl = await getLogoUrl(); // Get logo URL from S3 or fallback

    try {
      await sendEmail(email, 'Welcome to Genzura - Your Legal Management System', `
          <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            ${getEmailHeader('Welcome to Genzura! 🎉', logoUrl)}

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

              ${getEmailFooter(logoUrl)}
            </div>
          </div>
        `);
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
    const logoUrl = await getLogoUrl();

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
    const logoUrl = await getLogoUrl();

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
    const logoUrl = await getLogoUrl();

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
    const logoUrl = await getLogoUrl();

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
            ${getEmailHeader(`Subscription Expiring ${urgencyEmoji}`, logoUrl)}

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

              ${getEmailFooter(logoUrl)}
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
    const logoUrl = await getLogoUrl();
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

              ${getEmailFooter(logoUrl)}
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
    const logoUrl = await getLogoUrl();

    try {
      await transporter.sendMail({
        from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
        to: email,
        subject: '📋 Your subscription has expired - Now on Free Plan',
        html: `
          <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            ${getEmailHeader('Subscription Expired 📋', logoUrl)}

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

              ${getEmailFooter(logoUrl)}
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
   * Send invitation email to new team member
   */
  static async sendInvitationEmail(
    email: string,
    name: string,
    role: string,
    invitationToken: string,
    invitedBy: string
  ) {
    const logoUrl = await getLogoUrl();
    const inviteLink = `${process.env.FRONTEND_URL}/accept-invitation?token=${invitationToken}`;

    try {
      await sendEmail(email, `You're invited to join Genzura Legal Management`, `
          <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            ${getEmailHeader('Welcome to the Team! 🎉', logoUrl)}

            <div style="padding: 35px 30px;">
              <h2 style="color: ${BRAND_COLORS.dark}; margin: 0 0 20px 0; font-size: 22px; font-weight: 700;">Hi ${name},</h2>

              <p style="color: #475569; line-height: 1.7; margin-bottom: 25px; font-size: 15px;">
                <strong style="color: ${BRAND_COLORS.dark};">${invitedBy}</strong> has invited you to join their team on <strong>Genzura Legal Management</strong> as a <strong style="color: ${BRAND_COLORS.blue};">${role}</strong>.
              </p>

              <div style="background: ${BRAND_COLORS.light}; padding: 25px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid ${BRAND_COLORS.blue};">
                <h3 style="margin: 0 0 15px 0; color: ${BRAND_COLORS.dark}; font-size: 16px; font-weight: 700;">What you'll get access to:</h3>
                <ul style="color: #475569; line-height: 2; margin: 0; padding-left: 20px; font-size: 14px;">
                  <li>📂 Comprehensive case management system</li>
                  <li>📄 Document storage and collaboration</li>
                  <li>📅 Integrated calendar and deadline tracking</li>
                  <li>👥 Team collaboration tools</li>
                  <li>📊 Real-time case updates and notifications</li>
                </ul>
              </div>

              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${inviteLink}" style="background: linear-gradient(135deg, ${BRAND_COLORS.blue} 0%, ${BRAND_COLORS.dark} 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block; font-size: 15px; box-shadow: 0 4px 12px rgba(24, 95, 165, 0.3);">
                  Accept Invitation & Set Password →
                </a>
              </div>

              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fef9e7 100%); padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #f59e0b;">
                <p style="color: #78350f; margin: 0; font-size: 13px; font-weight: 600;">
                  ⏰ <strong>Note:</strong> This invitation link will expire in 7 days for security reasons.
                </p>
              </div>

              <p style="color: #64748b; line-height: 1.6; font-size: 13px; text-align: center;">
                Need help? Contact us at <a href="mailto:support@genzura.rw" style="color: ${BRAND_COLORS.blue}; text-decoration: none; font-weight: 600;">support@genzura.rw</a>
              </p>

              ${getEmailFooter(logoUrl)}
            </div>
          </div>
        `);
    } catch (error) {
      console.error('❌ Failed to send invitation email:', error);
      throw new Error('Failed to send invitation email');
    }
  }

  /**
   * Send OTP verification email
   */
  static async sendOtpEmail(email: string, otp: string) {
    const transporter = createTransporter();
    const logoUrl = await getLogoUrl();

    try {
      await transporter.sendMail({
        from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
        to: email,
        subject: 'Email Verification Code - Genzura',
        html: `
          <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            ${getEmailHeader('Verify Your Email', logoUrl)}

            <div style="padding: 35px 30px;">
              <h2 style="color: ${BRAND_COLORS.dark}; margin: 0 0 20px 0; font-size: 22px; font-weight: 700;">Email Verification</h2>

              <p style="color: #475569; line-height: 1.7; margin-bottom: 25px; font-size: 15px;">
                Thank you for registering with Genzura. To verify your email address, please use the verification code below:
              </p>

              <div style="background: ${BRAND_COLORS.light}; padding: 30px; border-radius: 10px; margin-bottom: 30px; text-align: center; border: 2px dashed ${BRAND_COLORS.blue};">
                <p style="color: ${BRAND_COLORS.dark}; margin: 0 0 10px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                <p style="color: ${BRAND_COLORS.blue}; margin: 0; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</p>
              </div>

              <div style="background: #FFF7ED; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 3px solid #F97316;">
                <p style="color: #9A3412; margin: 0; font-size: 13px; line-height: 1.6;">
                  <strong>⚠️ Security Notice:</strong> This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.
                </p>
              </div>

              <p style="color: #475569; line-height: 1.7; margin-bottom: 20px; font-size: 14px;">
                If you have any questions, feel free to contact our support team.
              </p>
            </div>

            ${getEmailFooter(logoUrl)}
          </div>
        `
      });

      console.log(`✅ OTP email sent to ${email}`);
    } catch (error) {
      console.error('❌ Failed to send OTP email:', error);
      throw new Error('Failed to send OTP email');
    }
  }

  /**
   * Send subscription activated email
   */
  static async sendSubscriptionActivatedEmail(
    email: string,
    name: string,
    plan: string,
    endDate: Date
  ) {
    const logoUrl = await getLogoUrl();

    const planDetails: Record<string, any> = {
      Genzura: {
        name: 'Genzura Free',
        features: ['20 cases maximum', 'Basic document storage', 'Standard support']
      },
      Intango: {
        name: 'Intango Professional',
        features: ['Unlimited cases', 'Unlimited document storage', 'Priority support', 'Advanced analytics']
      },
      Inkingi: {
        name: 'Inkingi Enterprise',
        features: ['Unlimited cases', 'Unlimited document storage', '24/7 Premium support', 'Advanced analytics', 'Custom integrations']
      }
    };

    const details = planDetails[plan] || planDetails.Genzura;

    try {
      await sendEmail(email, `🎉 Your ${details.name} Plan is Now Active!`, `
          <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            ${getEmailHeader('Subscription Activated! 🎉', logoUrl)}

            <div style="padding: 35px 30px;">
              <h2 style="color: ${BRAND_COLORS.dark}; margin: 0 0 20px 0; font-size: 22px; font-weight: 700;">Hi ${name},</h2>

              <p style="color: #475569; line-height: 1.7; margin-bottom: 25px; font-size: 15px;">
                Great news! Your <strong>${details.name}</strong> subscription has been activated. You now have access to premium features!
              </p>

              <div style="background: linear-gradient(135deg, ${BRAND_COLORS.greenLight} 0%, ${BRAND_COLORS.light} 100%); padding: 25px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid ${BRAND_COLORS.green};">
                <h3 style="margin: 0 0 15px 0; color: ${BRAND_COLORS.dark}; font-size: 18px; font-weight: 700;">✨ Your Plan Includes:</h3>
                <ul style="color: #475569; line-height: 2; margin: 0; padding-left: 20px; font-size: 14px;">
                  ${details.features.map((f: string) => `<li>${f}</li>`).join('')}
                </ul>
              </div>

              <div style="background: ${BRAND_COLORS.light}; padding: 20px; border-radius: 10px; margin-bottom: 30px; text-align: center;">
                <p style="color: ${BRAND_COLORS.dark}; margin: 0 0 10px 0; font-size: 13px; font-weight: 600; text-transform: uppercase;">Valid Until</p>
                <p style="color: ${BRAND_COLORS.blue}; margin: 0; font-size: 24px; font-weight: 700;">${endDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>

              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard"
                   style="background: linear-gradient(135deg, ${BRAND_COLORS.blue} 0%, ${BRAND_COLORS.dark} 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 10px; font-weight: 700; display: inline-block; box-shadow: 0 4px 12px rgba(24, 95, 165, 0.3);">
                  Start Using Genzura
                </a>
              </div>

              <p style="color: #475569; line-height: 1.7; margin-bottom: 20px; font-size: 14px; text-align: center;">
                If you have any questions about your subscription, please contact our support team.
              </p>
            </div>

            ${getEmailFooter(logoUrl)}
          </div>
        `);
    } catch (error) {
      console.error('❌ Failed to send subscription activated email:', error);
      // Don't throw - subscription should still work even if email fails
    }
  }

  /**
   * Send subscription extended email
   */
  static async sendSubscriptionExtendedEmail(
    email: string,
    name: string,
    plan: string,
    extensionDays: number,
    newEndDate: Date
  ) {
    const transporter = createTransporter();
    const logoUrl = await getLogoUrl();

    try {
      await transporter.sendMail({
        from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
        to: email,
        subject: `⏰ Your Subscription Has Been Extended`,
        html: `
          <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            ${getEmailHeader('Subscription Extended ⏰', logoUrl)}

            <div style="padding: 35px 30px;">
              <h2 style="color: ${BRAND_COLORS.dark}; margin: 0 0 20px 0; font-size: 22px; font-weight: 700;">Hi ${name},</h2>

              <p style="color: #475569; line-height: 1.7; margin-bottom: 25px; font-size: 15px;">
                Good news! Your <strong>${plan}</strong> subscription has been extended by <strong>${extensionDays} days</strong>.
              </p>

              <div style="background: ${BRAND_COLORS.light}; padding: 25px; border-radius: 10px; margin-bottom: 30px; text-align: center; border: 2px solid ${BRAND_COLORS.blue};">
                <p style="color: ${BRAND_COLORS.dark}; margin: 0 0 10px 0; font-size: 13px; font-weight: 600; text-transform: uppercase;">New Expiration Date</p>
                <p style="color: ${BRAND_COLORS.blue}; margin: 0; font-size: 24px; font-weight: 700;">${newEndDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>

              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings?tab=subscription"
                   style="background: linear-gradient(135deg, ${BRAND_COLORS.blue} 0%, ${BRAND_COLORS.dark} 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 10px; font-weight: 700; display: inline-block; box-shadow: 0 4px 12px rgba(24, 95, 165, 0.3);">
                  View Subscription Details
                </a>
              </div>

              <p style="color: #475569; line-height: 1.7; margin-bottom: 20px; font-size: 14px; text-align: center;">
                Continue enjoying all the premium features of Genzura!
              </p>
            </div>

            ${getEmailFooter(logoUrl)}
          </div>
        `
      });

      console.log(`✅ Subscription extended email sent to ${email}`);
    } catch (error) {
      console.error('❌ Failed to send subscription extended email:', error);
    }
  }

  /**
   * Send subscription cancelled email
   */
  static async sendSubscriptionCancelledEmail(
    email: string,
    name: string,
    previousPlan: string
  ) {
    const transporter = createTransporter();
    const logoUrl = await getLogoUrl();

    try {
      await transporter.sendMail({
        from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
        to: email,
        subject: `Subscription Update - Genzura`,
        html: `
          <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            ${getEmailHeader('Subscription Update', logoUrl)}

            <div style="padding: 35px 30px;">
              <h2 style="color: ${BRAND_COLORS.dark}; margin: 0 0 20px 0; font-size: 22px; font-weight: 700;">Hi ${name},</h2>

              <p style="color: #475569; line-height: 1.7; margin-bottom: 25px; font-size: 15px;">
                Your <strong>${previousPlan}</strong> subscription has been cancelled and your account has been downgraded to the free Genzura plan.
              </p>

              <div style="background: #FFF7ED; padding: 25px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #F97316;">
                <h3 style="margin: 0 0 15px 0; color: ${BRAND_COLORS.dark}; font-size: 16px; font-weight: 700;">What This Means:</h3>
                <ul style="color: #475569; line-height: 2; margin: 0; padding-left: 20px; font-size: 14px;">
                  <li>Limited to 20 active cases</li>
                  <li>Basic document storage</li>
                  <li>Standard support access</li>
                </ul>
              </div>

              <p style="color: #475569; line-height: 1.7; margin-bottom: 25px; font-size: 15px;">
                You can still access all your existing data and continue using Genzura with the free plan limitations.
              </p>

              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings?tab=subscription"
                   style="background: linear-gradient(135deg, ${BRAND_COLORS.blue} 0%, ${BRAND_COLORS.dark} 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 10px; font-weight: 700; display: inline-block; box-shadow: 0 4px 12px rgba(24, 95, 165, 0.3);">
                  Upgrade Your Plan
                </a>
              </div>

              <p style="color: #475569; line-height: 1.7; margin-bottom: 20px; font-size: 14px; text-align: center;">
                Questions? Contact our support team anytime.
              </p>
            </div>

            ${getEmailFooter(logoUrl)}
          </div>
        `
      });

      console.log(`✅ Subscription cancelled email sent to ${email}`);
    } catch (error) {
      console.error('❌ Failed to send subscription cancelled email:', error);
    }
  }

  /**
   * Test email configuration
   */
  static async testConnection() {
    // Try Brevo API first (works on serverless)
    if (isBrevoApiConfigured()) {
      try {
        const apiInstance = createBrevoApiClient();
        // Test by getting account info
        const accountApi = new SibApiV3Sdk.AccountApi();
        accountApi.setApiKey(SibApiV3Sdk.AccountApiApiKeys.apiKey, process.env.BREVO_API_KEY!);
        await accountApi.getAccount();
        console.log('✅ Email service connected successfully (Brevo API)');
        return true;
      } catch (error) {
        console.error('❌ Brevo API connection failed:', error);
        return false;
      }
    }

    // Fallback to SMTP (may not work on serverless free tiers)
    const transporter = createTransporter();
    try {
      await transporter.verify();
      console.log('✅ Email service connected successfully (SMTP)');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }
}
