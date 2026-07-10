import { z } from 'zod';

export const createDespachoSchema = z.object({
  asunto: z.string().min(5).max(500),
  descripcion: z.string().optional(),
  numDocumento: z.string().max(100).optional(),
  fechaDocumento: z.string().datetime().optional(), // ISO string
  cantidadAnexos: z.number().int().min(0).optional(),
  observaciones: z.string().optional(),
  prioridad: z.enum(['URGENTE', 'ORDINARIA']).optional(),
  clasificacion: z.enum(['NORMAL', 'CONFIDENCIAL', 'CON_VALORES']).optional(),
  destinatario: z.string().min(2).max(250),
  cargoDestinatario: z.string().max(200).optional(),
  instDestinatario: z.string().max(250).optional(),
  areaOrigenId: z.number().int().positive(),
});

export const validarSalidaSchema = z.object({
  estado: z.enum(['EN_DISTRIBUCION', 'RECHAZADA']),
  observaciones: z.string().optional(),
});

export const asignarDespachoSchema = z.object({
  mensajeroId: z.number().int().positive(),
  alcance: z.enum(['LOCAL', 'NACIONAL', 'INTERNACIONAL']).optional(),
  proveedorPaqueteria: z.string().max(100).optional(),
  numeroGuia: z.string().max(100).optional(),
  observaciones: z.string().optional(),
});
