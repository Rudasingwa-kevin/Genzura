import { Request, Response } from 'express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bcrypt = require('bcryptjs');
import jwt from 'jsonwebtoken';
import { UserService } from '../services/userService.js';
import { EmailService } from '../services/emailService.js';

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
  static async register(req: Request, res: Response) {
    try {
      const { email, password, name, role } = req.body;

      // Validate required fields
      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Validate password strength
      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }

      const initials = name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase();

      const user = await UserService.createUser({
        email: email.toLowerCase().trim(),
        password,
        name,
        role: role || 'Attorney',
        initials
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

      res.status(201).json({ user: userWithoutPassword, token });
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
}

