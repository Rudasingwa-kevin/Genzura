import { CalendarService } from '../services/calendarService.js';
export class CalendarController {
    /**
     * Get all events for the logged-in user
     */
    static async getUserEvents(req, res) {
        try {
            const events = await CalendarService.getUserEvents(req.user.id);
            res.json(events);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Get events within a date range
     */
    static async getEventsByDateRange(req, res) {
        try {
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                return res.status(400).json({ error: 'startDate and endDate are required' });
            }
            const events = await CalendarService.getEventsByDateRange(req.user.id, new Date(startDate), new Date(endDate));
            res.json(events);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Get case deadlines
     */
    static async getCaseDeadlines(req, res) {
        try {
            const deadlines = await CalendarService.getCaseDeadlines(req.user.id);
            res.json(deadlines);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Get upcoming events (next 7 days)
     */
    static async getUpcomingEvents(req, res) {
        try {
            const events = await CalendarService.getUpcomingEvents(req.user.id);
            res.json(events);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Create a new event
     */
    static async createEvent(req, res) {
        try {
            const event = await CalendarService.createEvent({
                ...req.body,
                createdById: req.user.id
            });
            res.status(201).json(event);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Update an event
     */
    static async updateEvent(req, res) {
        try {
            const { id } = req.params;
            const event = await CalendarService.updateEvent(id, req.body);
            res.json(event);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Delete an event
     */
    static async deleteEvent(req, res) {
        try {
            const { id } = req.params;
            await CalendarService.deleteEvent(id);
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Add attendee to event
     */
    static async addAttendee(req, res) {
        try {
            const { id } = req.params;
            const { userId } = req.body;
            if (!userId) {
                return res.status(400).json({ error: 'userId is required' });
            }
            const attendee = await CalendarService.addAttendee(id, userId);
            res.status(201).json(attendee);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Remove attendee from event
     */
    static async removeAttendee(req, res) {
        try {
            const { id, userId } = req.params;
            await CalendarService.removeAttendee(id, userId);
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
//# sourceMappingURL=calendarController.js.map