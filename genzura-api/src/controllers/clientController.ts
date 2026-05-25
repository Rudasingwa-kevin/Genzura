import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ClientService } from '../services/clientService.js';

export class ClientController {
  static async getAll(req: any, res: Response) {
    try {
      const userId = req.user?.id;
      const clients = await ClientService.getAllClients(userId);
      res.json(clients);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getOne(req: any, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const client = await ClientService.getClientById(id, userId);
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
      res.json(client);
    } catch (error: any) {
      // Handle permission errors with 403
      if (error.message.includes('permission')) {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const client = await ClientService.createClient(req.body);
      res.status(201).json(client);
    } catch (error: any) {
      // Handle duplicate email gracefully
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return res.status(409).json({
          error:
            'A client with this email address already exists. Please use a different email or select the existing client from the list.',
        });
      }
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
