import { Request } from 'express';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'promotor';
  created_at: Date;
}

export interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  vehicle: string;
  status: string;
  notes: string;
  promotor_id: number;
  last_contact_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface Vehicle {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  pdf_url: string;
  status: string;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}
