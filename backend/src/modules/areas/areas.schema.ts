import { z } from 'zod';

export const createAreaSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(200),
  clave: z.string().min(2, 'La clave debe tener al menos 2 caracteres').max(20),
  responsable: z.string().max(150).optional(),
});

export const updateAreaSchema = z.object({
  nombre: z.string().min(3).max(200).optional(),
  clave: z.string().min(2).max(20).optional(),
  responsable: z.string().max(150).optional(),
  activa: z.boolean().optional(),
});
