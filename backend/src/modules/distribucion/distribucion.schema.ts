import { z } from 'zod';
import { EstadoDistribucion } from '@prisma/client';

export const createDistribucionSchema = z.object({
  correspondenciaId: z.number().int().positive(),
  areaDestinoId: z.number().int().positive(),
  observaciones: z.string().optional(),
});

export const confirmarEntregaSchema = z.object({
  observaciones: z.string().optional(),
});

export const distribucionFilterSchema = z.object({
  correspondenciaId: z.coerce.number().int().positive().optional(),
  areaDestinoId: z.coerce.number().int().positive().optional(),
  estado: z.nativeEnum(EstadoDistribucion).optional(),
});
