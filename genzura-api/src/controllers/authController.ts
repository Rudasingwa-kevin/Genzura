import { Request, Response } from 'express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bcrypt = require('bcryptjs');
import jwt from 'jsonwebtoken';
import { UserService } from '../services/userService.js';
import { EmailService } from '../services/emailService.js';
import { EmailValidator, PasswordValidator, Sanitizer, RateLimiter } from '../utils/validation.js';

// In-memory OTP storage (replace with Redis in production)
// Format: { email: { otp: string, expiresAt: number } }
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// Clean up expired OTPs every minute
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (data.expiresAt < now) {
      otpStore.delete(email);
      console.log(`🗑️ Expired OTP removed for ${email}`);
    }
  }
}, 60000);

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const user = await UserService.getUserByEmail(normalizedEmail);
      
      if (!user) {
        console.warn(`[Login] Attempt failed: User not found for email "${normalizedEmail}"`);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        console.warn(`[Login] Attempt failed: Incorrect password for user "${normalizedEmail}"`);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '24h' }
      );

      const { passwordHash, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async me(req: any, res: Response) {
    try {
      const user = await UserService.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { passwordHash, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async changePassword(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
      }

      // Validate new password strength
      const passwordValidation = PasswordValidator.validate(newPassword);
      if (!passwordValidation.valid) {
        return res.status(400).json({
          error: passwordValidation.error,
          passwordStrength: passwordValidation.strength
        });
      }

      // Get user and verify current password
      const user = await UserService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Hash and update new password
      const passwordHash = await bcrypt.hash(newPassword, 10);
      await UserService.updatePassword(userId, passwordHash);

      res.json({ message: 'Password changed successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Delete user account (requires password confirmation)
   */
  static async deleteAccount(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const { password, confirmText } = req.body;

      // Validate required fields
      if (!password) {
        return res.status(400).json({ error: 'Password is required to delete your account' });
      }

      if (confirmText !== 'DELETE MY ACCOUNT') {
        return res.status(400).json({ error: 'Please type "DELETE MY ACCOUNT" to confirm' });
      }

      // Get user and verify password
      const user = await UserService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        console.warn(`❌ Account deletion failed: Incorrect password for user ${user.email}`);
        return res.status(401).json({ error: 'Incorrect password' });
      }

      console.log(`✅ Password verified for account deletion: ${user.email}`);

      // Delete the account (soft delete - marks as inactive)
      await UserService.deleteAccount(userId);

      console.log(`🗑️ Account deleted for user: ${user.email}`);

      res.json({
        message: 'Your account has been permanently deleted',
        success: true
      });
    } catch (error: any) {
      console.error('Account deletion error:', error);
      res.status(500).json({ error: 'Failed to delete account' });
    }
  }
  static async sendOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Validate email format
      const sanitizedEmail = Sanitizer.sanitizeEmail(email);
      const emailValidation = EmailValidator.validate(sanitizedEmail);
      if (!emailValidation.valid) {
        return res.status(400).json({ error: emailValidation.error });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      try {
        // Send OTP via email service
        await EmailService.sendOtpEmail(sanitizedEmail, otp);

        // Store OTP in memory with 10-minute expiry
        const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes
        otpStore.set(sanitizedEmail, { otp, expiresAt });

        console.log(`✅ OTP sent to ${sanitizedEmail} (expires in 10 minutes)`);
        res.json({ message: 'Verification code sent to your email' });
      } catch (emailError) {
        console.error('❌ Email service error:', emailError);
        throw new Error('Failed to send verification email. Please check your email configuration.');
      }
    } catch (error: any) {
      console.error('OTP send error:', error);
      res.status(500).json({ error: error.message || 'Failed to send verification code' });
    }
  }

  static async verifyOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ error: 'Email and verification code are required' });
      }

      // Sanitize email
      const sanitizedEmail = Sanitizer.sanitizeEmail(email);

      // Basic format validation
      if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
        return res.status(400).json({ error: 'Invalid verification code format' });
      }

      // Get stored OTP
      const storedData = otpStore.get(sanitizedEmail);

      if (!storedData) {
        return res.status(400).json({ error: 'No verification code found. Please request a new code.' });
      }

      // Check if expired
      if (Date.now() > storedData.expiresAt) {
        otpStore.delete(sanitizedEmail);
        return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
      }

      // Verify OTP matches
      if (storedData.otp !== otp) {
        return res.status(400).json({ error: 'Invalid verification code. Please check and try again.' });
      }

      // OTP is valid - remove it from store
      otpStore.delete(sanitizedEmail);
      console.log(`✅ OTP verified for ${sanitizedEmail}`);

      res.json({ message: 'Email verified successfully', verified: true });
    } catch (error: any) {
      console.error('OTP verification error:', error);
      res.status(500).json({ error: 'Failed to verify code' });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const { email, password, name, role, phone, organization } = req.body;

      // Rate limiting by IP address
      const clientIp = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '').split(',')[0].trim();
      if (RateLimiter.shouldLimit(`register:${clientIp}`, 5, 15 * 60 * 1000)) {
        return res.status(429).json({ error: 'Too many registration attempts. Please try again in 15 minutes.' });
      }

      // Validate required fields
      if (!email || !password || !name || !phone) {
        return res.status(400).json({ error: 'Name, email, phone number, and password are required' });
      }

      // Sanitize inputs
      const sanitizedEmail = Sanitizer.sanitizeEmail(email);
      const sanitizedName = Sanitizer.sanitizeName(name);

      // Validate name
      if (sanitizedName.length < 2) {
        return res.status(400).json({ error: 'Name must be at least 2 characters' });
      }
      if (sanitizedName.length > 100) {
        return res.status(400).json({ error: 'Name is too long' });
      }
      if (!/^[a-zA-Z\s'-]+$/.test(sanitizedName)) {
        return res.status(400).json({ error: 'Name contains invalid characters' });
      }

      // Comprehensive email validation
      const emailValidation = EmailValidator.validate(sanitizedEmail, { allowFreeEmail: true });
      if (!emailValidation.valid) {
        return res.status(400).json({ error: emailValidation.error });
      }

      // Comprehensive password validation
      const passwordValidation = PasswordValidator.validate(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({
          error: passwordValidation.error,
          passwordStrength: passwordValidation.strength
        });
      }

      // Validate phone number
      if (!/^[+]?[\d\s()-]{10,}$/.test(phone.trim())) {
        return res.status(400).json({ error: 'Please enter a valid phone number' });
      }

      // Generate initials (max 3 characters)
      const nameParts = sanitizedName.split(' ').filter(Boolean);
      const initials = nameParts.length >= 2
        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
        : sanitizedName.substring(0, 2).toUpperCase();

      const user = await UserService.createUser({
        email: sanitizedEmail,
        password,
        name: sanitizedName,
        role: role || 'Attorney',
        initials,
        phone: phone.trim(),
        organization: organization?.trim()
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '24h' }
      );

      const { passwordHash, ...userWithoutPassword } = user;

      // Send welcome email (don't wait for it)
      EmailService.sendWelcomeEmail(user.email, user.name).catch(err =>
        console.error('Welcome email failed:', err)
      );

      // Clear rate limit on successful registration
      RateLimiter.clear(`register:${clientIp}`);

      res.status(201).json({
        user: userWithoutPassword,
        token,
        warnings: emailValidation.warnings
      });
    } catch (error: any) {
      console.error('Registration error:', error);

      // Handle specific error cases
      if (error.message.includes('already exists')) {
        return res.status(409).json({ error: error.message });
      }

      res.status(400).json({ error: error.message || 'Failed to create account' });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const user = await UserService.getUserByEmail(email);
      // We return success even if user doesn't exist for security reasons
      if (user) {
        const resetToken = jwt.sign(
          { id: user.id, purpose: 'password_reset' },
          process.env.JWT_SECRET || 'fallback_secret',
          { expiresIn: '1h' }
        );

        await EmailService.sendPasswordResetEmail(user.email, resetToken);
      }

      res.json({ message: 'If an account with that email exists, we have sent reset instructions.' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ error: 'Token and password are required' });
      }

      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      if (!decoded || decoded.purpose !== 'password_reset') {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }

      const user = await UserService.getUserById(decoded.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      await UserService.updatePassword(user.id, passwordHash);

      res.json({ message: 'Password has been reset successfully' });
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return res.status(400).json({ error: 'Reset link has expired' });
      }
      res.status(400).json({ error: 'Invalid token' });
    }
  }

  /**
   * Verify invitation token and return user info
   */
  static async verifyInvitation(req: Request, res: Response) {
    try {
      const { token } = req.params;
      if (!token) {
        return res.status(400).json({ error: 'Invitation token is required' });
      }

      const userInfo = await UserService.verifyInvitationToken(token);
      res.json(userInfo);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Accept invitation and set password
   */
  static async acceptInvitation(req: Request, res: Response) {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({ error: 'Token and password are required' });
      }

      // Validate password strength
      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }

      const user = await UserService.acceptInvitation(token, password);

      // Generate JWT token for immediate login
      const authToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Invitation accepted successfully',
        user,
        token: authToken
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

