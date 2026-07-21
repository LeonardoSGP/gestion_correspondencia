import prisma from '../../prisma.config';
import { CreateDistribucionInput, DistribucionFilter } from './distribucion.types';
import { EstadoDistribucion, EstadoCorrespondencia } from '@prisma/client';

export class DistribucionRepository {
  async create(data: CreateDistribucionInput, entregadoPorId: number) {
    return await prisma.$transaction(async (tx) => {
      const distribucion = await tx.distribucionInterna.create({
        data: {
          correspondenciaId: data.correspondenciaId,
          areaDestinoId: data.areaDestinoId,
          entregadoPorId,
          observaciones: data.observaciones,
          estado: EstadoDistribucion.PENDIENTE,
        },
      });

      await tx.correspondencia.update({
        where: { id: data.correspondenciaId },
        data: { estado: 'ENTREGADA_A_AREA' as EstadoCorrespondencia },
      });

      await tx.historialCorrespondencia.create({
        data: {
          correspondenciaId: data.correspondenciaId,
          usuarioId: entregadoPorId,
          accion: 'DISTRIBUCION_REGISTRADA',
          detalles: `Distribución registrada hacia el área destino ID: ${data.areaDestinoId}`,
        },
      });

      return distribucion;
    });
  }

  async findAll(filter: DistribucionFilter) {
    return await prisma.distribucionInterna.findMany({
      where: {
        correspondenciaId: filter.correspondenciaId,
        areaDestinoId: filter.areaDestinoId,
        estado: filter.estado,
      },
      include: {
        correspondencia: {
          select: {
            folio: true,
            asunto: true,
          },
        },
        areaDestino: true,
        entregadoPor: true,
        recibidoPor: true,
      },
      orderBy: { fechaDistribucion: 'desc' },
    });
  }

  async findById(id: number) {
    return await prisma.distribucionInterna.findUnique({
      where: { id },
      include: {
        correspondencia: true,
        areaDestino: true,
        entregadoPor: true,
        recibidoPor: true,
      },
    });
  }

  async confirmarEntrega(id: number, recibidoPorId: number, observaciones?: string) {
    return await prisma.$transaction(async (tx) => {
      const distribucion = await tx.distribucionInterna.update({
        where: { id },
        data: {
          estado: EstadoDistribucion.ENTREGADA,
          recibidoPorId,
          fechaConfirmacion: new Date(),
          observaciones: observaciones,
        },
      });

      await tx.firmaRecepcion.create({
        data: {
          correspondenciaId: distribucion.correspondenciaId,
          firmadoPorId: recibidoPorId,
          fechaFirma: new Date(),
          valida: true,
        },
      });

      await tx.historialCorrespondencia.create({
        data: {
          correspondenciaId: distribucion.correspondenciaId,
          usuarioId: recibidoPorId,
          accion: 'DISTRIBUCION_CONFIRMADA',
          detalles: `Entrega confirmada. Observaciones: ${observaciones || 'Ninguna'}`,
        },
      });

      return distribucion;
    });
  }
}
