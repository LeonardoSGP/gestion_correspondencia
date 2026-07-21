import prisma from '../../prisma.config';
import { CreateDespachoInput, DespachoFilter } from './despacho.types';
import { Prisma } from '@prisma/client';

export class DespachoRepository {
  async generateFolio(): Promise<string> {
    const year = new Date().getFullYear();
    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

    const count = await prisma.correspondencia.count({
      where: {
        tipo: 'SALIDA',
        createdAt: {
          gte: startOfYear,
          lte: endOfYear
        }
      }
    });

    const number = (count + 1).toString().padStart(5, '0');
    return `SAL-${year}-${number}`;
  }

  async create(data: CreateDespachoInput, registradoPorId: number) {
    return await prisma.$transaction(async (tx) => {
      const folio = await this.generateFolio();

      const correspondencia = await tx.correspondencia.create({
        data: {
          folio,
          tipo: 'SALIDA',
          estado: 'REGISTRADA',
          asunto: data.asunto,
          descripcion: data.descripcion,
          numDocumento: data.numDocumento,
          fechaDocumento: data.fechaDocumento,
          cantidadAnexos: data.cantidadAnexos || 0,
          observaciones: data.observaciones,
          prioridad: data.prioridad as any || 'NORMAL',
          clasificacion: data.clasificacion as any || 'ORDINARIA',
          destinatario: data.destinatario,
          cargoDestinatario: data.cargoDestinatario,
          instDestinatario: data.instDestinatario,
          areaOrigenId: data.areaOrigenId,
          registradoPorId,
        }
      });

      await tx.historialCorrespondencia.create({
        data: {
          correspondenciaId: correspondencia.id,
          estadoNuevo: 'REGISTRADA',
          accion: 'REGISTRO_DESPACHO_SALIDA',
          observacion: 'Registro inicial de correspondencia de salida',
          usuarioId: registradoPorId,
        }
      });

      return correspondencia;
    });
  }

  async findAll(filter: DespachoFilter) {
    const where: Prisma.CorrespondenciaWhereInput = {
      tipo: 'SALIDA',
    };

    if (filter.folio) where.folio = { contains: filter.folio };
    if (filter.estado) where.estado = filter.estado as any;
    if (filter.areaOrigenId) where.areaOrigenId = filter.areaOrigenId;
    
    if (filter.fechaInicio || filter.fechaFin) {
      where.createdAt = {};
      if (filter.fechaInicio) where.createdAt.gte = new Date(filter.fechaInicio);
      if (filter.fechaFin) where.createdAt.lte = new Date(filter.fechaFin);
    }

    return await prisma.correspondencia.findMany({
      where,
      include: {
        areaOrigen: true,
        registradoPor: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: number) {
    return await prisma.correspondencia.findUnique({
      where: { id },
      include: {
        areaOrigen: true,
        registradoPor: true,
        historial: {
          include: { usuario: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }
}
