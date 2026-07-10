import prisma from '../../prisma.config';
import { CreateRecepcionInput, RecepcionFilter } from './recepcion.types';

export class RecepcionRepository {
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
    return `EXT-${year}-${(count + 1).toString().padStart(5, '0')}`;
  }

  async create(data: CreateRecepcionInput, registradoPorId: number) {
    const folio = await this.generateFolio();
    
    return prisma.$transaction(async (tx) => {
      const correspondencia = await tx.correspondencia.create({
        data: {
          folio,
          tipo: 'ENTRADA',
          estado: 'REGISTRADA',
          asunto: data.asunto,
          descripcion: data.descripcion,
          numDocumento: data.numDocumento,
          fechaDocumento: data.fechaDocumento ? new Date(data.fechaDocumento) : null,
          cantidadAnexos: data.cantidadAnexos || 0,
          observaciones: data.observaciones,
          prioridad: data.prioridad || 'ORDINARIA',
          clasificacion: data.clasificacion || 'NORMAL',
          remitente: data.remitente,
          cargoRemitente: data.cargoRemitente,
          instRemitente: data.instRemitente,
          areaDestinoId: data.areaDestinoId,
          registradoPorId,
          fechaRecepcion: new Date(),
        },
        include: {
          areaDestino: true,
          registradoPor: { select: { id: true, nombre: true } }
        }
      });

      await tx.historialCorrespondencia.create({
        data: {
          correspondenciaId: correspondencia.id,
          usuarioId: registradoPorId,
          accion: 'REGISTRO_INICIAL',
          estadoNuevo: 'REGISTRADA',
          detalle: 'Registro de correspondencia de entrada'
        }
      });

      return correspondencia;
    });
  }

  async findAll(filter: RecepcionFilter) {
    const where: any = { tipo: 'ENTRADA' };
    if (filter.folio) where.folio = { contains: filter.folio };
    if (filter.estado) where.estado = filter.estado;
    if (filter.areaDestinoId) where.areaDestinoId = filter.areaDestinoId;
    if (filter.fechaInicio || filter.fechaFin) {
      where.fechaRecepcion = {};
      if (filter.fechaInicio) where.fechaRecepcion.gte = new Date(filter.fechaInicio);
      if (filter.fechaFin) where.fechaRecepcion.lte = new Date(filter.fechaFin);
    }

    return prisma.correspondencia.findMany({
      where,
      include: {
        areaDestino: true,
        registradoPor: { select: { id: true, nombre: true } }
      },
      orderBy: { fechaRecepcion: 'desc' }
    });
  }

  async findById(id: number) {
    return prisma.correspondencia.findUnique({
      where: { id },
      include: {
        areaDestino: true,
        registradoPor: { select: { id: true, nombre: true } },
        anexos: true,
        acuses: true,
        selloDigital: true,
        firmas: {
          include: { firmadoPor: { select: { id: true, nombre: true } } }
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
        data: { estado: estado as any }
      });

      await tx.historialCorrespondencia.create({
        data: {
          correspondenciaId: id,
          usuarioId,
          accion: 'CAMBIO_ESTADO',
          estadoAnterior: current.estado,
          estadoNuevo: estado,
          detalle: observaciones || `Estado cambiado a ${estado}`
        }
      });

      return updated;
    });
  }

  async generarSello(correspondenciaId: number, usuarioId: number) {
    return prisma.$transaction(async (tx) => {
      const correspondencia = await tx.correspondencia.findUnique({ where: { id: correspondenciaId } });
      if(!correspondencia) throw new Error("No existe");

      const codigoSello = `SELLO-${correspondencia.folio}-${Date.now()}`;
      const sello = await tx.selloDigital.create({
        data: {
          correspondenciaId,
          codigoSello,
          cadenaOriginal: `${correspondencia.folio}|${correspondencia.fechaRecepcion}|${codigoSello}`
        }
      });

      await tx.historialCorrespondencia.create({
         data: {
           correspondenciaId,
           usuarioId,
           accion: 'SELLO_GENERADO',
           detalle: `Sello generado: ${codigoSello}`
         }
      });

      return sello;
    });
  }

  async registrarFirma(correspondenciaId: number, usuarioId: number, observaciones?: string) {
    return prisma.$transaction(async (tx) => {
       const firma = await tx.firmaRecepcion.create({
         data: {
           correspondenciaId,
           firmadoPorId: usuarioId,
           observaciones
         }
       });

       await tx.historialCorrespondencia.create({
         data: {
           correspondenciaId,
           usuarioId,
           accion: 'FIRMA_RECEPCION',
           detalle: 'Firma de recepcion interna (Ficha de Gestion) registrada'
         }
       });

       return firma;
    });
  }
}
