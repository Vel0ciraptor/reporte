import { Response } from 'express';
import db from '../db/database';
import { AuthRequest } from '../types';
import { convertToWebp, deleteFile } from '../utils/image';

export const createVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    let image_url = files?.['image']?.[0]?.filename || null;
    const pdf_url = files?.['pdf']?.[0]?.filename || null;

    if (!name) {
      return res.status(400).json({ error: 'El nombre del vehículo es requerido' });
    }

    if (image_url) {
      image_url = await convertToWebp(image_url);
    }

    const vehicle = await db.vehicles.create({
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
    const vehicles = await db.vehicles.findAll(status as string);
    res.json(vehicles);
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getVehicleById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const vehicle = await db.vehicles.findById(parseInt(id));

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

    let newImageFilename = files?.['image']?.[0]?.filename;
    let newPdfFilename = files?.['pdf']?.[0]?.filename;

    if (newImageFilename) {
      newImageFilename = await convertToWebp(newImageFilename);
    }

    const existing = await db.vehicles.findById(parseInt(id));
    if (!existing) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price ? parseFloat(price) : null;
    if (status) updateData.status = status;
    if (newImageFilename) {
      deleteFile(existing.image_url);
      updateData.image_url = newImageFilename;
    }
    if (newPdfFilename) {
      deleteFile(existing.pdf_url);
      updateData.pdf_url = newPdfFilename;
    }

    const vehicle = await db.vehicles.update(parseInt(id), updateData);
    res.json(vehicle);
  } catch (error) {
    console.error('Error al actualizar vehículo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const vehicle = await db.vehicles.findById(parseInt(id));

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    deleteFile(vehicle.image_url);
    deleteFile(vehicle.pdf_url);

    await db.vehicles.delete(parseInt(id));
    res.json({ message: 'Vehículo eliminado' });
  } catch (error) {
    console.error('Error al eliminar vehículo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
