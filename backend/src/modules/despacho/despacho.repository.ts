import prisma from '../../prisma.config';
import { CreateDespachoInput, DespachoFilter } from './despacho.types';

export class DespachoRepository {
  async generateFolio(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const count = await prisma.correspondencia.count({
      where: {
        createdAt: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1)
        }
      }
    });
    return `INT-${year}-${(count + 1).toString().padStart(5, '0')}`;
  }

  async create(data: CreateDespachoInput, registradoPorId: number) {
    const folio = await this.generateFolio();
    
    return prisma.$transaction(async (tx) => {
      const correspondencia = await tx.correspondencia.create({
        data: {
          folio,
          tipo: 'SALIDA',
          estado: 'EN_REVISION', // (F6) Entra en revision para validacion de firmas/anexos
          asunto: data.asunto,
          descripcion: data.descripcion,
          numDocumento: data.numDocumento,
          fechaDocumento: data.fechaDocumento ? new Date(data.fechaDocumento) : null,
          cantidadAnexos: data.cantidadAnexos || 0,
          observaciones: data.observaciones,
          prioridad: data.prioridad || 'ORDINARIA',
          clasificacion: data.clasificacion || 'NORMAL',
          destinatario: data.destinatario,
          cargoDestinatario: data.cargoDestinatario,
          instDestinatario: data.instDestinatario,
          areaOrigenId: data.areaOrigenId,
          registradoPorId,
        },
        include: {
          areaOrigen: true,
          registradoPor: { select: { id: true, nombre: true } }
        }
      });

      await tx.historialCorrespondencia.create({
        data: {
          correspondenciaId: correspondencia.id,
          usuarioId: registradoPorId,
          accion: 'SOLICITUD_DESPACHO',
          estadoNuevo: 'EN_REVISION',
          detalle: 'Solicitud de despacho creada. Pendiente de validacion.'
        }
      });

      return correspondencia;
    });
  }

  async findAll(filter: DespachoFilter) {
    const where: any = { tipo: 'SALIDA' };
    if (filter.folio) where.folio = { contains: filter.folio };
    if (filter.estado) where.estado = filter.estado;
    if (filter.areaOrigenId) where.areaOrigenId = filter.areaOrigenId;
    if (filter.fechaInicio || filter.fechaFin) {
      where.createdAt = {};
      if (filter.fechaInicio) where.createdAt.gte = new Date(filter.fechaInicio);
      if (filter.fechaFin) where.createdAt.lte = new Date(filter.fechaFin);
    }

    return prisma.correspondencia.findMany({
      where,
      include: {
        areaOrigen: true,
        registradoPor: { select: { id: true, nombre: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: number) {
    return prisma.correspondencia.findUnique({
      where: { id },
      include: {
        areaOrigen: true,
        registradoPor: { select: { id: true, nombre: true } },
        anexos: true,
        acuses: true,
        asignaciones: {
          include: { mensajero: { select: { id: true, nombre: true } } }
        },
        historial: {
          include: { usuario: { select: { id: true, nombre: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  async updateEstado(id: number, estado: string, usuarioId: number, observaciones?: string) {
    return prisma.$transaction(async (tx) => {
      const current = await tx.correspondencia.findUnique({ where: { id } });
      if (!current) throw new Error('No encontrada');

      const updated = await tx.correspondencia.update({
        where: { id },
        data: { 
          estado: estado as any,
          fechaDespacho: estado === 'EN_RUTA' ? new Date() : current.fechaDespacho
        }
      });

      await tx.historialCorrespondencia.create({
        data: {
          correspondenciaId: id,
          usuarioId,
          accion: 'VALIDACION_SALIDA',
          estadoAnterior: current.estado,
          estadoNuevo: estado,
          detalle: observaciones || `Estado cambiado a ${estado}`
        }
      });

      return updated;
    });
  }

  async asignar(id: number, usuarioId: number, data: any) {
    return prisma.$transaction(async (tx) => {
      const asignacion = await tx.asignacionMensajeria.create({
        data: {
          correspondenciaId: id,
          mensajeroId: data.mensajeroId,
          alcance: data.alcance || 'LOCAL',
          proveedorPaqueteria: data.proveedorPaqueteria,
          numeroGuia: data.numeroGuia,
          observaciones: data.observaciones
        }
      });

      await tx.correspondencia.update({
        where: { id },
        data: { estado: 'EN_RUTA', fechaDespacho: new Date() }
      });

      await tx.historialCorrespondencia.create({
        data: {
          correspondenciaId: id,
          usuarioId,
          accion: 'ASIGNACION_MENSAJERIA',
          estadoNuevo: 'EN_RUTA',
          detalle: `Asignado a mensajero ID: ${data.mensajeroId}. Guia: ${data.numeroGuia || 'N/A'}`
        }
      });

      return asignacion;
    });
  }
}
