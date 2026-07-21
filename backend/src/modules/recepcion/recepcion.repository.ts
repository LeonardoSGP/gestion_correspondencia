import prisma from '../../prisma.config';
import { CreateRecepcionInput, RecepcionFilter } from './recepcion.types';
import crypto from 'crypto';

export class RecepcionRepository {
  private async generateFolio(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `EXT-${year}-`;
    
    const lastRecord = await prisma.correspondencia.findFirst({
      where: { folio: { startsWith: prefix } },
      orderBy: { folio: 'desc' }
    });

    let nextNumber = 1;
    if (lastRecord && lastRecord.folio) {
      const parts = lastRecord.folio.split('-');
      const numStr = parts[parts.length - 1];
      nextNumber = parseInt(numStr, 10) + 1;
    }

    const paddedNumber = nextNumber.toString().padStart(5, '0');
    return `${prefix}${paddedNumber}`;
  }

  async create(data: CreateRecepcionInput, registradoPorId: number) {
    return prisma.$transaction(async (tx) => {
      const folio = await this.generateFolio();
      const codigoSello = crypto.randomUUID();
      const cadenaOriginal = `||${folio}|${data.asunto}|${new Date().toISOString()}||`;

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
          selloDigital: {
            create: {
              codigoSello,
              cadenaOriginal
            }
          },
          acuses: {
            create: {
              tipo: 'GENERADO',
              observaciones: 'Acuse generado automáticamente en el registro'
            }
          },
          historial: {
            create: {
              usuarioId: registradoPorId,
              accion: 'REGISTRO',
              detalle: 'Registro inicial de correspondencia de entrada',
              estadoNuevo: 'REGISTRADA'
            }
          }
        },
        include: {
          selloDigital: true,
          acuses: true
        }
      });

      return correspondencia;
    });
  }

  async findAll(filter: RecepcionFilter) {
    const where: any = { tipo: 'ENTRADA' };

    if (filter.folio) where.folio = { contains: filter.folio, mode: 'insensitive' };
    if (filter.estado) where.estado = filter.estado;
    if (filter.areaDestinoId) where.areaDestinoId = filter.areaDestinoId;
    if (filter.fechaInicio || filter.fechaFin) {
      where.fechaRecepcion = {};
      if (filter.fechaInicio) where.fechaRecepcion.gte = new Date(filter.fechaInicio);
      if (filter.fechaFin) {
        const finDate = new Date(filter.fechaFin);
        finDate.setHours(23, 59, 59, 999);
        where.fechaRecepcion.lte = finDate;
      }
    }

    return prisma.correspondencia.findMany({
      where,
      include: {
        areaDestino: true,
        registradoPor: true
      },
      orderBy: { fechaRecepcion: 'desc' }
    });
  }

  async findById(id: number) {
    return prisma.correspondencia.findUnique({
      where: { id },
      include: {
        areaDestino: true,
        registradoPor: true,
        anexos: true,
        acuses: true,
        selloDigital: true,
        firmas: true,
        historial: {
          include: { usuario: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }
}
