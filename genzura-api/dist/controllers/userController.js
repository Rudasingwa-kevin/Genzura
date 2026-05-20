import { UserService } from '../services/userService.js';
export class UserController {
    static async getAll(req, res) {
        try {
            const users = await UserService.getAllUsers();
            res.json(users);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getActiveUsers(req, res) {
        try {
            const users = await UserService.getActiveUsers();
            res.json(users);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getOne(req, res) {
        try {
            const { id } = req.params;
            const user = await UserService.getUserById(id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(user);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async create(req, res) {
        try {
            const newUser = await UserService.createUser(req.body);
            res.status(201).json(newUser);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const updated = await UserService.updateStatus(id, status);
            res.json(updated);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getAnalytics(req, res) {
        try {
            const analytics = await UserService.getUserAnalytics();
            res.json(analytics);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async updateProfile(req, res) {
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
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async inviteUser(req, res) {
        try {
            const { name, email, role, phone, location, jobTitle } = req.body;
            const invitedBy = req.user.name; // Name of the user sending the invitation
            // Validate required fields
            if (!name || !email || !role) {
                return res.status(400).json({ error: 'Name, email, and role are required' });
            }
            const newUser = await UserService.inviteUser({
                name,
                email,
                role,
                phone,
                location,
                jobTitle,
                invitedBy,
            });
            res.status(201).json({
                message: 'Invitation sent successfully',
                user: newUser
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
//# sourceMappingURL=userController.js.map