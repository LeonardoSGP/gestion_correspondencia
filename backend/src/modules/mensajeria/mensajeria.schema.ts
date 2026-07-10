import { z } from 'zod';

export const entregarAsignacionSchema = z.object({
  observaciones: z.string().optional()
});

export const fallarAsignacionSchema = z.object({
  observaciones: z.string().min(5, 'Se requiere especificar el motivo del fallo')
});
