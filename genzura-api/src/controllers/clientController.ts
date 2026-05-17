import { Request, Response } from 'express';
import { ClientService } from '../services/clientService.js';

export class ClientController {
  static async getAll(req: Request, res: Response) {
    try {
      const clients = await ClientService.getAllClients();
      res.json(clients);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const client = await ClientService.getClientById(id);
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
      res.json(client);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const client = await ClientService.createClient(req.body);
      res.status(201).json(client);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const client = await ClientService.updateClient(id, req.body);
      res.json(client);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await ClientService.deleteClient(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
