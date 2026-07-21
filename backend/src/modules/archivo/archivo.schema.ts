import { z } from 'zod';

export const CargarAcuseSchema = z.object({
  observaciones: z.string().optional(),
});

export const CerrarCicloSchema = z.object({
  observaciones: z.string().optional(),
});

export const ArchivoFilterSchema = z.object({
  folio: z.string().optional(),
  tipo: z.enum(['ENTRADA', 'SALIDA']).optional(),
  estado: z.string().optional(),
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
});
