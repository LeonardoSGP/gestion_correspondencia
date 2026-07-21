import { z } from 'zod';

export const createUsuarioSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rolId: z.number().int().positive('Rol inválido'),
  areaId: z.number().int().positive().optional(),
});

export const updateUsuarioSchema = z.object({
  nombre: z.string().min(1).optional(),
  email: z.string().email().optional(),
  rolId: z.number().int().positive().optional(),
  areaId: z.number().int().positive().optional(),
  activo: z.boolean().optional(),
});

export const asignarRolSchema = z.object({
  rolId: z.number().int().positive('Rol inválido'),
});

export const createRolSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
});

export const asignarPermisosSchema = z.object({
  permisoIds: z.array(z.number().int().positive('Permiso inválido')),
});
