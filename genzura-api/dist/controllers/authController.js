import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bcrypt = require('bcryptjs');
import jwt from 'jsonwebtoken';
import { UserService } from '../services/userService.js';
import { EmailService } from '../services/emailService.js';
import { EmailValidator, PasswordValidator, Sanitizer, RateLimiter } from '../utils/validation.js';
export class AuthController {
    static async login(req, res) {
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
            const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
            const { passwordHash, ...userWithoutPassword } = user;
            res.json({ user: userWithoutPassword, token });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async me(req, res) {
        try {
            const user = await UserService.getUserById(req.user.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            const { passwordHash, ...userWithoutPassword } = user;
            res.json(userWithoutPassword);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async register(req, res) {
        try {
            const { email, password, name, role } = req.body;
            // Rate limiting by IP address
            const clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
            if (RateLimiter.shouldLimit(`register:${clientIp}`, 5, 15 * 60 * 1000)) {
                return res.status(429).json({ error: 'Too many registration attempts. Please try again in 15 minutes.' });
            }
            // Validate required fields
            if (!email || !password || !name) {
                return res.status(400).json({ error: 'Name, email, and password are required' });
            }
            // Sanitize inputs
            const sanitizedEmail = Sanitizer.sanitizeEmail(email);
            const sanitizedName = Sanitizer.sanitizeName(name);
            // Validate name
            if (sanitizedName.length < 2) {
                return res.status(400).json({ error: 'Name must be at least 2 characters' });
            }
            if (sanitizedName.length > 100) {
                return res.status(400).json({ error: 'Name is too long' });
            }
            if (!/^[a-zA-Z\s'-]+$/.test(sanitizedName)) {
                return res.status(400).json({ error: 'Name contains invalid characters' });
            }
            // Comprehensive email validation
            const emailValidation = EmailValidator.validate(sanitizedEmail, { allowFreeEmail: true });
            if (!emailValidation.valid) {
                return res.status(400).json({ error: emailValidation.error });
            }
            // Comprehensive password validation
            const passwordValidation = PasswordValidator.validate(password);
            if (!passwordValidation.valid) {
                return res.status(400).json({
                    error: passwordValidation.error,
                    passwordStrength: passwordValidation.strength
                });
            }
            // Generate initials (max 3 characters)
            const nameParts = sanitizedName.split(' ').filter(Boolean);
            const initials = nameParts.length >= 2
                ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
                : sanitizedName.substring(0, 2).toUpperCase();
            const user = await UserService.createUser({
                email: sanitizedEmail,
                password,
                name: sanitizedName,
                role: role || 'Attorney',
                initials
            });
            const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
            const { passwordHash, ...userWithoutPassword } = user;
            // Send welcome email (don't wait for it)
            EmailService.sendWelcomeEmail(user.email, user.name).catch(err => console.error('Welcome email failed:', err));
            // Clear rate limit on successful registration
            RateLimiter.clear(`register:${clientIp}`);
            res.status(201).json({
                user: userWithoutPassword,
                token,
                warnings: emailValidation.warnings
            });
        }
        catch (error) {
            console.error('Registration error:', error);
            // Handle specific error cases
            if (error.message.includes('already exists')) {
                return res.status(409).json({ error: error.message });
            }
            res.status(400).json({ error: error.message || 'Failed to create account' });
        }
    }
    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ error: 'Email is required' });
            }
            const user = await UserService.getUserByEmail(email);
            // We return success even if user doesn't exist for security reasons
            if (user) {
                const resetToken = jwt.sign({ id: user.id, purpose: 'password_reset' }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });
                await EmailService.sendPasswordResetEmail(user.email, resetToken);
            }
            res.json({ message: 'If an account with that email exists, we have sent reset instructions.' });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async resetPassword(req, res) {
        try {
            const { token, password } = req.body;
            if (!token || !password) {
                return res.status(400).json({ error: 'Token and password are required' });
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
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
        }
        catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(400).json({ error: 'Reset link has expired' });
            }
            res.status(400).json({ error: 'Invalid token' });
        }
    }
    /**
     * Verify invitation token and return user info
     */
    static async verifyInvitation(req, res) {
        try {
            const { token } = req.params;
            if (!token) {
                return res.status(400).json({ error: 'Invitation token is required' });
            }
            const userInfo = await UserService.verifyInvitationToken(token);
            res.json(userInfo);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    /**
     * Accept invitation and set password
     */
    static async acceptInvitation(req, res) {
        try {
            const { token, password } = req.body;
            if (!token || !password) {
                return res.status(400).json({ error: 'Token and password are required' });
            }
            // Validate password strength
            if (password.length < 8) {
                return res.status(400).json({ error: 'Password must be at least 8 characters' });
            }
            const user = await UserService.acceptInvitation(token, password);
            // Generate JWT token for immediate login
            const authToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
            res.json({
                message: 'Invitation accepted successfully',
                user,
                token: authToken
            });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
//# sourceMappingURL=authController.js.map