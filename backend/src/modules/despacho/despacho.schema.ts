import { z } from 'zod';

export const createDespachoSchema = z.object({
  asunto: z.string().min(1),
  descripcion: z.string().optional(),
  numDocumento: z.string().optional(),
  fechaDocumento: z.coerce.date().optional(),
  cantidadAnexos: z.number().int().min(0).optional(),
  observaciones: z.string().optional(),
  prioridad: z.string().optional(),
  clasificacion: z.string().optional(),
  destinatario: z.string().min(1),
  cargoDestinatario: z.string().optional(),
  instDestinatario: z.string().optional(),
  areaOrigenId: z.number().int().positive()
});

export const despachoFilterSchema = z.object({
  folio: z.string().optional(),
  estado: z.string().optional(),
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
  areaOrigenId: z.string().transform((val) => parseInt(val, 10)).optional()
});
