import { EstadoDistribucion } from '@prisma/client';

export interface CreateDistribucionInput {
  correspondenciaId: number;
  areaDestinoId: number;
  observaciones?: string;
}

export interface ConfirmarEntregaInput {
  observaciones?: string;
}

export interface DistribucionFilter {
  correspondenciaId?: number;
  areaDestinoId?: number;
  estado?: EstadoDistribucion;
}
