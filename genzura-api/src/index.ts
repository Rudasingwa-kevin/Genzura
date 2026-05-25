import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/authRoutes.js';
import caseRoutes from './routes/caseRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import adminSubscriptionRoutes from './routes/adminSubscriptionRoutes.js';
import planRoutes from './routes/planRoutes.js';
import invitationRoutes from './routes/invitationRoutes.js';
import notificationPreferenceRoutes from './routes/notificationPreferenceRoutes.js';
import trackingRoutes from './routes/trackingRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { createServer } from 'http';
import { initSocket } from './socket.js';
import { DateService } from './utils/dateUtils.js';
import { CronScheduler } from './utils/cronScheduler.js';
import adminJobsRoutes from './routes/adminJobsRoutes.js';
import { S3Service } from './services/s3Service.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Dynamic S3 or Local disk serving for uploads
app.get('/uploads/avatars/:filename', async (req, res) => {
  const { filename } = req.params;
  const s3Key = `uploads/avatars/${filename}`;

  if (S3Service.isConfigured()) {
    try {
      const presignedUrl = await S3Service.getPresignedUrl(s3Key);
      return res.redirect(302, presignedUrl);
    } catch (err) {
      console.error('[Express Uploads] S3 avatar fetch failed, falling back to local:', err);
    }
  }

  // Fallback to local disk
  const localPath = path.join(process.cwd(), 'uploads/avatars', filename);
  if (fs.existsSync(localPath)) {
    return res.sendFile(localPath);
  }

  return res.status(404).json({ error: 'Avatar file not found' });
});

app.get('/uploads/:filename', async (req, res) => {
  const { filename } = req.params;
  const s3Key = `uploads/${filename}`;

  if (S3Service.isConfigured()) {
    try {
      const presignedUrl = await S3Service.getPresignedUrl(s3Key);
      return res.redirect(302, presignedUrl);
    } catch (err) {
      console.error('[Express Uploads] S3 file fetch failed, falling back to local:', err);
    }
  }

  // Fallback to local disk
  const localPath = path.join(process.cwd(), 'uploads', filename);
  if (fs.existsSync(localPath)) {
    return res.sendFile(localPath);
  }

  return res.status(404).json({ error: 'File not found' });
});

app.use('/public', express.static('public'));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin/subscriptions', adminSubscriptionRoutes);
app.use('/api/admin/plans', planRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/admin/jobs', adminJobsRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/notification-preferences', notificationPreferenceRoutes);
app.use('/api/tracking', trackingRoutes);

// Error Handling
app.use(errorHandler);

// Enhanced health check with system clock validation
app.get('/health', async (req, res) => {
  const clockHealth = DateService.systemClockHealthCheck();

  // Test email connection
  const { EmailService } = await import('./services/emailService.js');
  const emailConnected = await EmailService.testConnection();

  res.json({
    status: clockHealth.healthy && emailConnected ? 'ok' : 'warning',
    timestamp: DateService.now().toISOString(),
    systemClock: clockHealth,
    emailService: emailConnected ? 'connected' : 'disconnected'
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('Genzura API is running');
});

// Start server
const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 Genzura API running on http://localhost:${PORT}`);

  // Initialize and start cron jobs
  CronScheduler.initialize();
  CronScheduler.start();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down gracefully...');
  CronScheduler.stop();
  CronScheduler.destroy();
  await prisma.$disconnect();
  process.exit(0);
});
