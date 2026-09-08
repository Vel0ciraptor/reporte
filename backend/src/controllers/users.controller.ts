import { Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/database';
import { AuthRequest } from '../types';

export const getAllPromotores = async (req: AuthRequest, res: Response) => {
  try {
    const promotores = await db.users.findPromotores();
    res.json(promotores);
  } catch (error) {
    console.error('Error al obtener promotores:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createPromotor = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    }

    const existingUser = await db.users.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.users.create({
      name,
      email,
      password: hashedPassword,
      role: 'promotor',
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Error al crear promotor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getVehicleStats = async (req: AuthRequest, res: Response) => {
  try {
    const allClients = await db.clients.findAll();
    const counts: Record<string, number> = {};
    allClients.forEach((c: any) => {
      if (c.vehicle) {
        counts[c.vehicle] = (counts[c.vehicle] || 0) + 1;
      }
    });
    const stats = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    res.json(stats);
  } catch (error) {
    console.error('Error al obtener stats de vehiculos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getPromotorPerformance = async (req: AuthRequest, res: Response) => {
  try {
    const promotores = await db.users.findPromotores();
    const allClients = await db.clients.findAll();

    const performance = promotores.map((p: any) => {
      const clients = allClients.filter((c: any) => c.promotor_id === p.id);
      const byStatus: Record<string, number> = {};
      clients.forEach((c: any) => {
        byStatus[c.status] = (byStatus[c.status] || 0) + 1;
      });
      return {
        id: p.id,
        name: p.name,
        total: clients.length,
        sin_contacto: byStatus['sin_contacto'] || 0,
        interesado: byStatus['interesado'] || 0,
        en_proceso: byStatus['en_proceso'] || 0,
        citado: byStatus['citado'] || 0,
        cerrado: byStatus['cerrado'] || 0,
        no_interesa: byStatus['no_interesa'] || 0,
      };
    });

    res.json(performance);
  } catch (error) {
    console.error('Error al obtener rendimiento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getPromotorClients = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const clients = await db.clients.findByPromotor(parseInt(id));
    res.json(clients);
  } catch (error) {
    console.error('Error al obtener clientes del promotor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
