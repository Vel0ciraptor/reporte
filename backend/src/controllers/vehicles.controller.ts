import { Response } from 'express';
import db from '../db/demo-db';
import { AuthRequest } from '../types';

export const createVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const image_url = files?.['image']?.[0]?.filename || null;
    const pdf_url = files?.['pdf']?.[0]?.filename || null;

    if (!name) {
      return res.status(400).json({ error: 'El nombre del vehículo es requerido' });
    }

    const vehicle = db.vehicles.create({
      name,
      description: description || null,
      price: price ? parseFloat(price) : null,
      image_url,
      pdf_url,
      status: 'disponible',
      created_by: req.user!.id,
    });

    res.status(201).json(vehicle);
  } catch (error) {
    console.error('Error al crear vehículo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getAllVehicles = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const vehicles = db.vehicles.findAll(status as string);
    res.json(vehicles);
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getVehicleById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const vehicle = db.vehicles.findById(parseInt(id));

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    res.json(vehicle);
  } catch (error) {
    console.error('Error al obtener vehículo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, status } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const image_url = files?.['image']?.[0]?.filename;
    const pdf_url = files?.['pdf']?.[0]?.filename;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price ? parseFloat(price) : null;
    if (status) updateData.status = status;
    if (image_url) updateData.image_url = image_url;
    if (pdf_url) updateData.pdf_url = pdf_url;

    const vehicle = db.vehicles.update(parseInt(id), updateData);

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    res.json(vehicle);
  } catch (error) {
    console.error('Error al actualizar vehículo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = db.vehicles.delete(parseInt(id));

    if (!deleted) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    res.json({ message: 'Vehículo eliminado' });
  } catch (error) {
    console.error('Error al eliminar vehículo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
