import { PrismaClient, CalendarEventType, ReminderMethod } from '@prisma/client';
import { DateService } from '../utils/dateUtils.js';
import { NotificationService } from './notificationService.js';
import { emitToAll } from '../socket.js';

const prisma = new PrismaClient();

export class CalendarService {
  /**
   * Get all events for a user (as creator or attendee)
   */
  static async getUserEvents(userId: string) {
    return prisma.calendarEvent.findMany({
      where: {
        OR: [
          { createdById: userId },
          { attendees: { some: { userId } } }
        ]
      },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
        attendees: { include: { user: { select: { id: true, name: true, email: true } } } },
        reminders: true,
        createdBy: { select: { id: true, name: true } }
      },
      orderBy: { startDate: 'asc' }
    });
  }

  /**
   * Get events within a date range
   */
  static async getEventsByDateRange(userId: string, startDate: Date, endDate: Date) {
    return prisma.calendarEvent.findMany({
      where: {
        AND: [
          {
            OR: [
              { createdById: userId },
              { attendees: { some: { userId } } }
            ]
          },
          {
            startDate: {
              gte: startDate,
              lte: endDate
            }
          }
        ]
      },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
        attendees: { include: { user: { select: { id: true, name: true, email: true } } } },
        reminders: true
      },
      orderBy: { startDate: 'asc' }
    });
  }

  /**
   * Get case deadlines as calendar events
   */
  static async getCaseDeadlines(userId: string) {
    const cases = await prisma.case.findMany({
      where: {
        OR: [
          { attorneyId: userId },
          { team: { some: { userId } } }
        ],
        deadline: { not: null }
      },
      select: {
        id: true,
        caseNumber: true,
        title: true,
        deadline: true,
        priority: true
      }
    });

    // Transform case deadlines into calendar events format
    return cases.map(c => ({
      id: `case-deadline-${c.id}`,
      title: `${c.caseNumber} Deadline`,
      description: c.title,
      eventType: 'Deadline' as CalendarEventType,
      startDate: c.deadline!,
      caseId: c.id,
      priority: c.priority,
      isDeadline: true
    }));
  }

  /**
   * Create a new calendar event
   */
  static async createEvent(data: {
    title: string;
    description?: string;
    eventType: CalendarEventType;
    startDate: Date;
    endDate?: Date;
    location?: string;
    caseId?: string;
    createdById: string;
    attendeeIds?: string[];
    reminders?: Array<{ minutesBefore: number; method: ReminderMethod }>;
  }) {
    const { attendeeIds, reminders, ...eventData } = data;

    const event = await prisma.calendarEvent.create({
      data: {
        ...eventData,
        startDate: DateService.now() > new Date(eventData.startDate)
          ? DateService.now()
          : new Date(eventData.startDate),
        attendees: attendeeIds ? {
          create: attendeeIds.map(userId => ({ userId }))
        } : undefined,
        reminders: reminders ? {
          create: reminders.map(r => ({
            reminderTime: new Date(new Date(eventData.startDate).getTime() - r.minutesBefore * 60000),
            method: r.method
          }))
        } : undefined
      },
      include: {
        case: true,
        attendees: { include: { user: true } },
        reminders: true,
        createdBy: true
      }
    });

    // Notify attendees
    if (attendeeIds && attendeeIds.length > 0) {
      for (const userId of attendeeIds) {
        await NotificationService.createNotification({
          userId,
          type: 'alert',
          title: 'New Event Invitation',
          body: `You've been invited to: ${event.title}`,
          link: `/calendar?event=${event.id}`
        });
      }
    }

    emitToAll('new_calendar_event', event);
    return event;
  }

  /**
   * Update an existing event
   */
  static async updateEvent(eventId: string, data: any) {
    const event = await prisma.calendarEvent.update({
      where: { id: eventId },
      data: {
        ...data,
        updatedAt: DateService.now()
      },
      include: {
        case: true,
        attendees: { include: { user: true } },
        reminders: true
      }
    });

    emitToAll('calendar_event_updated', event);
    return event;
  }

  /**
   * Delete an event
   */
  static async deleteEvent(eventId: string) {
    await prisma.calendarEvent.delete({
      where: { id: eventId }
    });

    emitToAll('calendar_event_deleted', { id: eventId });
  }

  /**
   * Get upcoming events (next 7 days)
   */
  static async getUpcomingEvents(userId: string) {
    const now = DateService.now();
    const sevenDaysLater = DateService.addDays(now, 7);

    return this.getEventsByDateRange(userId, now, sevenDaysLater);
  }

  /**
   * Get events that need reminders sent
   */
  static async getPendingReminders() {
    const now = DateService.now();

    return prisma.eventReminder.findMany({
      where: {
        sent: false,
        reminderTime: { lte: now }
      },
      include: {
        event: {
          include: {
            attendees: { include: { user: true } },
            createdBy: true,
            case: true
          }
        }
      }
    });
  }

  /**
   * Mark reminder as sent
   */
  static async markReminderSent(reminderId: string) {
    return prisma.eventReminder.update({
      where: { id: reminderId },
      data: {
        sent: true,
        sentAt: DateService.now()
      }
    });
  }

  /**
   * Add attendee to event
   */
  static async addAttendee(eventId: string, userId: string) {
    const attendee = await prisma.eventAttendee.create({
      data: { eventId, userId },
      include: {
        user: true,
        event: true
      }
    });

    await NotificationService.createNotification({
      userId,
      type: 'alert',
      title: 'Event Invitation',
      body: `You've been added to: ${attendee.event.title}`,
      link: `/calendar?event=${eventId}`
    });

    return attendee;
  }

  /**
   * Remove attendee from event
   */
  static async removeAttendee(eventId: string, userId: string) {
    return prisma.eventAttendee.delete({
      where: {
        eventId_userId: { eventId, userId }
      }
    });
  }
}
