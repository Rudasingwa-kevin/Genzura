import { Router } from 'express';
import { CalendarController } from '../controllers/calendarController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

// Event routes
router.get('/', CalendarController.getUserEvents);
router.get('/range', CalendarController.getEventsByDateRange);
router.get('/deadlines', CalendarController.getCaseDeadlines);
router.get('/upcoming', CalendarController.getUpcomingEvents);
router.post('/', CalendarController.createEvent);
router.put('/:id', CalendarController.updateEvent);
router.delete('/:id', CalendarController.deleteEvent);

// Attendee management
router.post('/:id/attendees', CalendarController.addAttendee);
router.delete('/:id/attendees/:userId', CalendarController.removeAttendee);

export default router;
