import { Request, Response } from 'express';
import { CalendarService } from '../services/calendarService.js';

export class CalendarController {
  /**
   * Get all events for the logged-in user
   */
  static async getUserEvents(req: any, res: Response) {
    try {
      const events = await CalendarService.getUserEvents(req.user.id);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get events within a date range
   */
  static async getEventsByDateRange(req: any, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate and endDate are required' });
      }

      const events = await CalendarService.getEventsByDateRange(
        req.user.id,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get case deadlines
   */
  static async getCaseDeadlines(req: any, res: Response) {
    try {
      const deadlines = await CalendarService.getCaseDeadlines(req.user.id);
      res.json(deadlines);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get upcoming events (next 7 days)
   */
  static async getUpcomingEvents(req: any, res: Response) {
    try {
      const events = await CalendarService.getUpcomingEvents(req.user.id);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Create a new event
   */
  static async createEvent(req: any, res: Response) {
    try {
      const event = await CalendarService.createEvent({
        ...req.body,
        createdById: req.user.id
      });

      res.status(201).json(event);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update an event
   */
  static async updateEvent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const event = await CalendarService.updateEvent(id, req.body);
      res.json(event);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Delete an event
   */
  static async deleteEvent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await CalendarService.deleteEvent(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Add attendee to event
   */
  static async addAttendee(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const attendee = await CalendarService.addAttendee(id, userId);
      res.status(201).json(attendee);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Remove attendee from event
   */
  static async removeAttendee(req: Request, res: Response) {
    try {
      const { id, userId } = req.params;
      await CalendarService.removeAttendee(id, userId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
