import { z } from 'zod';

export const asignarRutaSchema = z.object({
  correspondenciaId: z.number().int().positive(),
  metodoEnvioId: z.number().int().positive(),
  mensajeroId: z.number().int().positive().optional(),
  alcance: z.enum(['LOCAL', 'NACIONAL', 'INTERNACIONAL']),
  direccionDestino: z.string().optional(),
  numeroGuia: z.string().optional(),
  observaciones: z.string().optional()
});

export const actualizarEstadoRutaSchema = z.object({
  estado: z.enum(['ASIGNADA', 'EN_TRANSITO', 'ENTREGADA', 'FALLIDA']),
  fechaEntrega: z.string().datetime().optional(),
  observaciones: z.string().optional()
});

export const marcarEntregadaSchema = z.object({
  observaciones: z.string().optional()
});

export const reportarFalloSchema = z.object({
  observaciones: z.string()
});
