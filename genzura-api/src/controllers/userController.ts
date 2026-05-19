import { Request, Response } from 'express';
import { UserService } from '../services/userService.js';

export class UserController {
  static async getAll(req: Request, res: Response) {
    try {
      const users = await UserService.getAllUsers();
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
}
