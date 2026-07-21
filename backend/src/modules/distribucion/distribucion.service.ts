import { DistribucionRepository } from './distribucion.repository';
import { CreateDistribucionInput, DistribucionFilter } from './distribucion.types';
import { AppError } from '../../errors';
import prisma from '../../prisma.config';
import { TipoCorrespondencia, EstadoDistribucion } from '@prisma/client';

export class DistribucionService {
  private repository: DistribucionRepository;

  constructor() {
    this.repository = new DistribucionRepository();
  }

  async registrarDistribucion(input: CreateDistribucionInput, usuarioId: number) {
    const correspondencia = await prisma.correspondencia.findUnique({
      where: { id: input.correspondenciaId },
    });

    if (!correspondencia) {
      throw new AppError('Correspondencia no encontrada', 404);
    }

    if (correspondencia.tipo !== TipoCorrespondencia.ENTRADA) {
      throw new AppError('Solo se puede distribuir correspondencia de entrada', 400);
    }

    return await this.repository.create(input, usuarioId);
  }

  async listarDistribuciones(filtros: DistribucionFilter) {
    return await this.repository.findAll(filtros);
  }

  async obtenerDistribucion(id: number) {
    const distribucion = await this.repository.findById(id);
    if (!distribucion) {
      throw new AppError('Distribución no encontrada', 404);
    }
    return distribucion;
  }

  async confirmarEntrega(id: number, usuarioId: number, observaciones?: string) {
    const distribucion = await this.repository.findById(id);
    
    if (!distribucion) {
      throw new AppError('Distribución no encontrada', 404);
    }

    if (distribucion.estado !== EstadoDistribucion.PENDIENTE) {
      throw new AppError('La distribución no está en estado PENDIENTE', 400);
    }

    return await this.repository.confirmarEntrega(id, usuarioId, observaciones);
  }
}
