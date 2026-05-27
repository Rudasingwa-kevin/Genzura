import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/login', authLimiter, AuthController.login);
router.post('/register', authLimiter, AuthController.register);
router.post('/send-otp', authLimiter, AuthController.sendOtp);
router.post('/verify-otp', authLimiter, AuthController.verifyOtp);
router.post('/forgot-password', passwordResetLimiter, AuthController.forgotPassword);
router.post('/reset-password', passwordResetLimiter, AuthController.resetPassword);
router.get('/verify-invitation/:token', AuthController.verifyInvitation);
router.post('/accept-invitation', AuthController.acceptInvitation);
router.get('/me', authenticate, AuthController.me);
router.post('/change-password', authenticate, AuthController.changePassword);
router.post('/delete-account', authenticate, AuthController.deleteAccount);


export default router;
