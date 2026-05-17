import apiClient from '../client';

export type CalendarEventType =
  | 'CourtDate'
  | 'Hearing'
  | 'Filing'
  | 'Deadline'
  | 'Meeting'
  | 'ClientMeeting'
  | 'Consultation'
  | 'Other';

export type ReminderMethod = 'Email' | 'SMS' | 'InApp';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  eventType: CalendarEventType;
  startDate: string;
  endDate?: string;
  location?: string;
  caseId?: string;
  case?: {
    id: string;
    caseNumber: string;
    title: string;
  };
  attendees?: Array<{
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  reminders?: Array<{
    id: string;
    reminderTime: string;
    method: ReminderMethod;
    sent: boolean;
  }>;
  createdBy?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const calendarService = {
  /**
   * Get all events for the logged-in user
   */
  getAll: async (): Promise<CalendarEvent[]> => {
    const response = await apiClient.get('/calendar');
    return response.data;
  },

  /**
   * Get events within a date range
   */
  getByDateRange: async (startDate: string, endDate: string): Promise<CalendarEvent[]> => {
    const response = await apiClient.get('/calendar/range', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  /**
   * Get case deadlines as events
   */
  getDeadlines: async (): Promise<any[]> => {
    const response = await apiClient.get('/calendar/deadlines');
    return response.data;
  },

  /**
   * Get upcoming events (next 7 days)
   */
  getUpcoming: async (): Promise<CalendarEvent[]> => {
    const response = await apiClient.get('/calendar/upcoming');
    return response.data;
  },

  /**
   * Create a new event
   */
  create: async (data: {
    title: string;
    description?: string;
    eventType: CalendarEventType;
    startDate: string;
    endDate?: string;
    location?: string;
    caseId?: string;
    attendeeIds?: string[];
    reminders?: Array<{ minutesBefore: number; method: ReminderMethod }>;
  }): Promise<CalendarEvent> => {
    const response = await apiClient.post('/calendar', data);
    return response.data;
  },

  /**
   * Update an event
   */
  update: async (id: string, data: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    const response = await apiClient.put(`/calendar/${id}`, data);
    return response.data;
  },

  /**
   * Delete an event
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/calendar/${id}`);
  },

  /**
   * Add attendee to event
   */
  addAttendee: async (eventId: string, userId: string): Promise<any> => {
    const response = await apiClient.post(`/calendar/${eventId}/attendees`, { userId });
    return response.data;
  },

  /**
   * Remove attendee from event
   */
  removeAttendee: async (eventId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/calendar/${eventId}/attendees/${userId}`);
  },
};
