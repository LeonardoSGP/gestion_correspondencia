import prisma from '../../prisma.config';
import { AsignarRutaInput, RutaFilter } from './enrutamiento.types';

export class EnrutamientoRepository {
  async asignarRuta(data: AsignarRutaInput, asignadoPorId: number) {
    return prisma.$transaction(async (tx) => {
      const ruta = await tx.ruta.create({
        data: {
          correspondenciaId: data.correspondenciaId,
          metodoEnvioId: data.metodoEnvioId,
          mensajeroId: data.mensajeroId,
          asignadoPorId,
          alcance: data.alcance as any,
          estado: 'ASIGNADA',
          direccionDestino: data.direccionDestino,
          numeroGuia: data.numeroGuia,
          observaciones: data.observaciones
        }
      });

      await tx.correspondencia.update({
        where: { id: data.correspondenciaId },
        data: {
          estado: 'EN_RUTA',
          fechaDespacho: new Date()
        }
      });

      await tx.historialCorrespondencia.create({
        data: {
          correspondenciaId: data.correspondenciaId,
          estadoNuevo: 'EN_RUTA',
          accion: 'ASIGNACION_RUTA',
          usuarioId: asignadoPorId,
          detalle: 'Ruta asignada'
        }
      });

      return ruta;
    });
  }

  async findAll(filter: RutaFilter) {
    const where: any = {};
    if (filter.correspondenciaId) where.correspondenciaId = filter.correspondenciaId;
    if (filter.mensajeroId) where.mensajeroId = filter.mensajeroId;
    if (filter.estado) where.estado = filter.estado;
    if (filter.alcance) where.alcance = filter.alcance;

    return prisma.ruta.findMany({
      where,
      include: {
        correspondencia: {
          select: {
            folio: true,
            asunto: true,
            destinatario: true
          }
        },
        metodoEnvio: true,
        mensajero: true,
        asignadoPor: true
      },
      orderBy: {
        fechaAsignacion: 'desc'
      }
    });
  }

  async findById(id: number) {
    return prisma.ruta.findUnique({
      where: { id },
      include: {
        correspondencia: true,
        metodoEnvio: true,
        mensajero: true,
        asignadoPor: true
      }
    });
  }

  async actualizarEstado(id: number, estado: string, usuarioId: number, fechaEntrega?: Date, observaciones?: string) {
    return prisma.$transaction(async (tx) => {
      const ruta = await tx.ruta.update({
        where: { id },
        data: {
          estado: estado as any,
          fechaEntrega: fechaEntrega,
          observaciones: observaciones
        }
      });

      if (estado === 'ENTREGADA') {
        await tx.correspondencia.update({
          where: { id: ruta.correspondenciaId },
          data: {
            estado: 'ACUSE_PENDIENTE'
          }
        });

        await tx.historialCorrespondencia.create({
          data: {
            correspondenciaId: ruta.correspondenciaId,
            estadoNuevo: 'ACUSE_PENDIENTE',
            accion: 'ENTREGA_RUTA',
            usuarioId: usuarioId,
            detalle: 'Ruta entregada, acuse pendiente'
          }
        });
      } else if (estado === 'FALLIDA') {
        await tx.historialCorrespondencia.create({
          data: {
            correspondenciaId: ruta.correspondenciaId,
            estadoNuevo: 'EN_RUTA', // Or keeping it EN_RUTA and logging the error
            accion: 'FALLO_RUTA',
            usuarioId: usuarioId,
            detalle: `Fallo en ruta: ${observaciones || ''}`
          }
        });
      }

      return ruta;
    });
  }

  async findMetodosEnvio() {
    return prisma.metodoEnvio.findMany({
      where: { activo: true }
    });
  }
}
