import prisma from '../../prisma.config';
import { MensajeriaFilter } from './mensajeria.types';

export class MensajeriaRepository {
  async findAsignacionesByMensajero(mensajeroId: number, filter: MensajeriaFilter) {
    const where: any = { mensajeroId };
    if (filter.estado) where.estado = filter.estado;
    if (filter.alcance) where.alcance = filter.alcance;

    return prisma.asignacionMensajeria.findMany({
      where,
      include: {
        correspondencia: {
          select: { folio: true, asunto: true, destinatario: true, instDestinatario: true }
        }
      },
      orderBy: { fechaAsignacion: 'desc' }
    });
  }

  async findAsignacionById(id: number) {
    return prisma.asignacionMensajeria.findUnique({
      where: { id },
      include: { correspondencia: true }
    });
  }

  async marcarComoEntregada(id: number, correspondenciaId: number, usuarioId: number, observaciones?: string) {
    return prisma.$transaction(async (tx) => {
      const asignacion = await tx.asignacionMensajeria.update({
        where: { id },
        data: { estado: 'ENTREGADA', fechaEntrega: new Date(), observaciones }
      });

      await tx.correspondencia.update({
        where: { id: correspondenciaId },
        data: { estado: 'ENTREGADA', fechaEntrega: new Date() }
      });

      await tx.historialCorrespondencia.create({
        data: {
          correspondenciaId,
          usuarioId,
          accion: 'ENTREGA_MENSAJERIA',
          estadoNuevo: 'ENTREGADA',
          detalle: observaciones || 'Documento entregado por mensajeria'
        }
      });

      return asignacion;
    });
  }

  async marcarComoFallida(id: number, correspondenciaId: number, usuarioId: number, observaciones: string) {
    return prisma.$transaction(async (tx) => {
      const asignacion = await tx.asignacionMensajeria.update({
        where: { id },
        data: { estado: 'FALLIDA', observaciones }
      });

      // Se devuelve a EN_DISTRIBUCION para poder reasignarse, o a DEVUELTA dependiendo del caso.
      // Por defecto la dejamos EN_DISTRIBUCION para reasignar
      await tx.correspondencia.update({
        where: { id: correspondenciaId },
        data: { estado: 'EN_DISTRIBUCION' }
      });

      await tx.historialCorrespondencia.create({
        data: {
          correspondenciaId,
          usuarioId,
          accion: 'FALLO_ENTREGA',
          estadoNuevo: 'EN_DISTRIBUCION',
          detalle: `Fallo en entrega: ${observaciones}`
        }
      });

      return asignacion;
    });
  }
}
