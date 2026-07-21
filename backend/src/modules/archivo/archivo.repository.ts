import prisma from '../../prisma.config';
import { ArchivoFilter } from './archivo.types';

export class ArchivoRepository {
  async cargarAcuse(correspondenciaId: number, rutaArchivo: string, observaciones?: string) {
    return prisma.acuse.create({
      data: {
        correspondenciaId,
        tipo: 'DIGITALIZADO',
        rutaArchivo,
        observaciones,
      },
    });
  }

  async cerrarCiclo(correspondenciaId: number, acuseId: number, creadoPorId: number, areaGeneradoraId?: number, observaciones?: string) {
    return prisma.$transaction(async (tx) => {
      const expediente = await tx.expediente.create({
        data: {
          correspondenciaId,
          acuseId,
          creadoPorId,
          areaGeneradoraId,
          observaciones,
        },
      });

      await tx.correspondencia.update({
        where: { id: correspondenciaId },
        data: { estado: 'CERRADA' },
      });

      await tx.historialCorrespondencia.create({
        data: {
          correspondenciaId,
          estadoNuevo: 'CERRADA',
          accion: 'CIERRE_CICLO',
          usuarioId: creadoPorId,
          comentarios: observaciones || 'Ciclo documental cerrado',
        },
      });

      return expediente;
    });
  }

  async buscarCorrespondencias(filter: ArchivoFilter) {
    const where: any = {};
    if (filter.folio) where.folio = { contains: filter.folio };
    if (filter.tipo) where.tipo = filter.tipo;
    if (filter.estado) where.estado = filter.estado;
    
    if (filter.fechaInicio || filter.fechaFin) {
      where.fechaRecepcion = {};
      if (filter.fechaInicio) where.fechaRecepcion.gte = new Date(filter.fechaInicio);
      if (filter.fechaFin) where.fechaRecepcion.lte = new Date(filter.fechaFin);
    }

    return prisma.correspondencia.findMany({
      where,
      include: {
        areaOrigen: true,
        areaDestino: true,
        registradoPor: true,
      },
      take: 100,
    });
  }

  async getHistorial(correspondenciaId: number) {
    return prisma.historialCorrespondencia.findMany({
      where: { correspondenciaId },
      orderBy: { createdAt: 'asc' },
      include: { usuario: true },
    });
  }

  async listarExpedientes() {
    return prisma.expediente.findMany({
      orderBy: { fechaCierre: 'desc' },
      include: {
        correspondencia: {
          select: {
            folio: true,
            asunto: true,
            tipo: true,
          }
        },
        acuse: true,
        creadoPor: true,
        areaGeneradora: true,
      },
    });
  }

  async marcarNotificado(expedienteId: number) {
    return prisma.expediente.update({
      where: { id: expedienteId },
      data: { notificado: true },
    });
  }
}
