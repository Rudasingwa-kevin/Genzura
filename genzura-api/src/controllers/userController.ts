import { Request, Response } from 'express';
import { UserService } from '../services/userService.js';
import fs from 'fs';
import path from 'path';
import { SubscriptionService } from '../services/subscriptionService.js';
import { S3Service } from '../services/s3Service.js';

export class UserController {
  static async getAll(req: Request, res: Response) {
    try {
      const users = await UserService.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getActiveUsers(req: Request, res: Response) {
    try {
      const users = await UserService.getActiveUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const newUser = await UserService.createUser(req.body);
      res.status(201).json(newUser);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await UserService.updateStatus(id, status);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAnalytics(req: Request, res: Response) {
    try {
      const analytics = await UserService.getUserAnalytics();
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateProfile(req: any, res: Response) {
    try {
      const userId = req.user.id; // From auth middleware
      const { firstName, lastName, phone, location, jobTitle, language } = req.body;

      // Combine firstName and lastName into name if provided
      const name = firstName && lastName ? `${firstName} ${lastName}` : undefined;

      const updated = await UserService.updateProfile(userId, {
        name,
        phone,
        location,
        jobTitle,
        language,
      });

      const { passwordHash, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async uploadAvatar(req: any, res: Response) {
    try {
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Get current user to check for existing avatar
      const user = await UserService.getUserById(userId);

      // Delete old avatar if exists
      if (user?.avatarUrl) {
        if (S3Service.isConfigured()) {
          await S3Service.deleteFile(user.avatarUrl);
        } else {
          const oldPath = path.join(process.cwd(), user.avatarUrl);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
      }

      // Save new avatar URL
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      if (S3Service.isConfigured()) {
        try {
          await S3Service.uploadFile(req.file.path, avatarUrl, req.file.mimetype);
        } catch (s3Error) {
          console.error('[UserController] S3 avatar upload error, keeping local file as backup:', s3Error);
          // Fallback: keep local file if upload to S3 fails
        }
      }

      const updated = await UserService.updateProfile(userId, { avatarUrl });

      const { passwordHash, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error('[UserController] Avatar upload error:', error);
      // Cleanup local file on error if it still exists
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupErr) {
          console.error('[UserController] Failed to clean up temp avatar on error:', cleanupErr);
        }
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async removeAvatar(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const user = await UserService.getUserById(userId);

      // Delete avatar file if exists
      if (user?.avatarUrl) {
        if (S3Service.isConfigured()) {
          await S3Service.deleteFile(user.avatarUrl);
        } else {
          const avatarPath = path.join(process.cwd(), user.avatarUrl);
          if (fs.existsSync(avatarPath)) {
            fs.unlinkSync(avatarPath);
          }
        }
      }

      // Clear avatar URL in database
      const updated = await UserService.updateProfile(userId, { avatarUrl: null as any });

      const { passwordHash, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async inviteUser(req: any, res: Response) {
    try {
      const { name, email, role, phone, location, jobTitle } = req.body;
      const invitedBy = req.user.name; // Name of the user sending the invitation

      // Validate required fields
      if (!name || !email || !role) {
        return res.status(400).json({ error: 'Name, email, and role are required' });
      }

      const newUser = await UserService.inviteUser({
        name,
        email,
        role,
        phone,
        location,
        jobTitle,
        invitedBy,
      });

      res.status(201).json({
        message: 'Invitation sent successfully',
        user: newUser
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getMySubscription(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const limits = await SubscriptionService.getSubscriptionLimits(userId);
      res.json(limits);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
