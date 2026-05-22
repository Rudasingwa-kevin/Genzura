import { ClientService } from '../services/clientService.js';
export class ClientController {
    static async getAll(req, res) {
        try {
            const userId = req.user?.id;
            const clients = await ClientService.getAllClients(userId);
            res.json(clients);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getOne(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            const client = await ClientService.getClientById(id, userId);
            if (!client) {
                return res.status(404).json({ error: 'Client not found' });
            }
            res.json(client);
        }
        catch (error) {
            // Handle permission errors with 403
            if (error.message.includes('permission')) {
                return res.status(403).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    }
    static async create(req, res) {
        try {
            const client = await ClientService.createClient(req.body);
            res.status(201).json(client);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const client = await ClientService.updateClient(id, req.body);
            res.json(client);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async delete(req, res) {
        try {
            const { id } = req.params;
            await ClientService.deleteClient(id);
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
//# sourceMappingURL=clientController.js.map