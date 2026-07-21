import { z } from 'zod';

export const createRecepcionSchema = z.object({
  asunto: z.string().min(1, 'El asunto es requerido'),
  descripcion: z.string().optional(),
  numDocumento: z.string().optional(),
  fechaDocumento: z.string().optional(), // ISO string expected
  cantidadAnexos: z.number().int().min(0).optional(),
  observaciones: z.string().optional(),
  prioridad: z.enum(['URGENTE', 'ORDINARIA']).optional(),
  clasificacion: z.enum(['NORMAL', 'CONFIDENCIAL', 'CON_VALORES']).optional(),
  remitente: z.string().min(1, 'El remitente es requerido'),
  cargoRemitente: z.string().optional(),
  instRemitente: z.string().optional(),
  areaDestinoId: z.number().int().positive('El área de destino es requerida')
});

export const recepcionFilterSchema = z.object({
  folio: z.string().optional(),
  estado: z.string().optional(),
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
  areaDestinoId: z.string().regex(/^\d+$/).transform(Number).optional()
});
