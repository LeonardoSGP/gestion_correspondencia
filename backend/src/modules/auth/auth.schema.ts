import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const recuperarContrasenaSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const restablecerContrasenaSchema = z.object({
  token: z.string().min(1, 'El token es requerido'),
  nuevaContrasena: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});
