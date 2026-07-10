import prisma from '../../prisma.config';
import { ArchivoFilter } from './archivo.types';

export class ArchivoRepository {
  async buscar(filter: ArchivoFilter) {
    const where: any = {};
    if (filter.folio) where.folio = { contains: filter.folio };
    if (filter.tipo) where.tipo = filter.tipo;
    if (filter.estado) where.estado = filter.estado;
    if (filter.areaOrigenId) where.areaOrigenId = filter.areaOrigenId;
    if (filter.areaDestinoId) where.areaDestinoId = filter.areaDestinoId;
    
    if (filter.fechaInicio || filter.fechaFin) {
      where.createdAt = {};
      if (filter.fechaInicio) where.createdAt.gte = new Date(filter.fechaInicio);
      if (filter.fechaFin) where.createdAt.lte = new Date(filter.fechaFin);
    }

    return prisma.correspondencia.findMany({
      where,
      include: {
        areaOrigen: { select: { nombre: true, clave: true } },
        areaDestino: { select: { nombre: true, clave: true } },
        registradoPor: { select: { nombre: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // Limitar resultados de busqueda general
    });
  }

  async getHistorial(correspondenciaId: number) {
    return prisma.historialCorrespondencia.findMany({
      where: { correspondenciaId },
      include: {
        usuario: { select: { nombre: true, role: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  async cargarAcuse(correspondenciaId: number, usuarioId: number, archivoUrl: string, observaciones?: string) {
    return prisma.$transaction(async (tx) => {
      const acuse = await tx.acuse.create({
        data: {
          correspondenciaId,
          tipo: 'DIGITALIZADO',
          rutaArchivo: archivoUrl,
          observaciones
        }
      });

      await tx.correspondencia.update({
        where: { id: correspondenciaId },
        data: { estado: 'CERRADA' }
      });

      await tx.historialCorrespondencia.create({
        data: {
          correspondenciaId,
          usuarioId,
          accion: 'ACUSE_CARGADO',
          estadoNuevo: 'CERRADA',
          detalle: observaciones || 'Acuse fisico digitalizado cargado en el sistema'
        }
      });

      return acuse;
    });
  }
}
