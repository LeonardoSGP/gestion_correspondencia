import { z } from 'zod';

export const createRecepcionSchema = z.object({
  asunto: z.string().min(5, 'Asunto demasiado corto').max(500),
  descripcion: z.string().optional(),
  numDocumento: z.string().max(100).optional(),
  fechaDocumento: z.string().datetime().optional(), // ISO string
  cantidadAnexos: z.number().int().min(0).optional(),
  observaciones: z.string().optional(),
  prioridad: z.enum(['URGENTE', 'ORDINARIA']).optional(),
  clasificacion: z.enum(['NORMAL', 'CONFIDENCIAL', 'CON_VALORES']).optional(),
  remitente: z.string().min(2, 'El remitente es requerido').max(250),
  cargoRemitente: z.string().max(200).optional(),
  instRemitente: z.string().max(250).optional(),
  areaDestinoId: z.number().int().positive('Area de destino requerida'),
});

export const updateEstadoSchema = z.object({
  estado: z.enum([
    'REGISTRADA', 'EN_REVISION', 'EN_DISTRIBUCION', 
    'EN_RUTA', 'ENTREGADA', 'ACUSE_PENDIENTE', 
    'CERRADA', 'RECHAZADA', 'DEVUELTA'
  ]),
  observaciones: z.string().optional()
});

export const firmaRecepcionSchema = z.object({
  observaciones: z.string().optional()
});
