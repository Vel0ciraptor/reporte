import { Response } from 'express';
import db from '../db/database';
import { AuthRequest } from '../types';

export const createClient = async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, email, vehicle, notes, appointment_date } = req.body;

    if (!name || !phone || !vehicle) {
      return res.status(400).json({ error: 'Nombre, teléfono y vehículo son requeridos' });
    }

    const client = await db.clients.create({
      name,
      phone,
      email: email || null,
      vehicle,
      notes: notes || null,
      promotor_id: req.user!.id,
      appointment_date: appointment_date || null,
    });

    res.status(201).json(client);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getMyClients = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const clients = await db.clients.findByPromotor(req.user!.id, status as string);
    res.json(clients);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getAllClients = async (req: AuthRequest, res: Response) => {
  try {
    const { status, promotor_id } = req.query;
    const clients = await db.clients.findAll({
      status: status as string,
      promotor_id: promotor_id ? parseInt(promotor_id as string) : undefined,
    });
    res.json(clients);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateClientStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['sin_contacto', 'interesado', 'en_proceso', 'citado', 'cerrado', 'no_interesa'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const client = await db.clients.update(parseInt(id), {
      status,
      last_contact_at: new Date(),
    });

    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(client);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateClient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, email, vehicle, notes } = req.body;

    const client = await db.clients.update(parseInt(id), {
      name, phone, email, vehicle, notes,
    });

    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(client);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteClient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await db.clients.delete(parseInt(id));

    if (!deleted) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json({ message: 'Cliente eliminado' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const clients = await db.clients.findByPromotor(req.user!.id);
    const appointments = clients
      .filter((c: any) => c.appointment_date)
      .sort((a: any, b: any) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());
    res.json(appointments);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getAllAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const allClients = await db.clients.findAll();
    const appointments = allClients
      .filter((c: any) => c.appointment_date)
      .sort((a: any, b: any) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());
    res.json(appointments);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getClientStats = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await db.clients.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
