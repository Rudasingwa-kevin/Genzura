import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
export class EmailService {
    static async sendPasswordResetEmail(email, token) {
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        try {
            const data = await resend.emails.send({
                from: 'Genzura <onboarding@resend.dev>',
                to: email,
                subject: 'Reset your Genzura password',
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
            return data;
        }
        catch (error) {
            console.error('Failed to send email:', error);
            throw new Error('Failed to send password reset email');
        }
    }
}
//# sourceMappingURL=emailService.js.map