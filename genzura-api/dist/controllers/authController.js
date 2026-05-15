import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/userService.js';
export class AuthController {
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }
            const user = await UserService.getUserByEmail(email);
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
            if (!isPasswordValid) {
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
            const initials = name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase();
            const user = await UserService.createUser({
                email,
                password,
                name,
                role: role || 'Attorney',
                initials
            });
            const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
            const { passwordHash, ...userWithoutPassword } = user;
            res.status(201).json({ user: userWithoutPassword, token });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
//# sourceMappingURL=authController.js.map