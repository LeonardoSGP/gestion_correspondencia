import { z } from 'zod';

export const cargarAcuseSchema = z.object({
  observaciones: z.string().optional()
});
