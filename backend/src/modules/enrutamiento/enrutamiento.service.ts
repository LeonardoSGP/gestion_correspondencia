import { AppError } from '../../errors';
import { EnrutamientoRepository } from './enrutamiento.repository';
import { AsignarRutaInput, RutaFilter } from './enrutamiento.types';
import prisma from '../../prisma.config';

export class EnrutamientoService {
  private repository = new EnrutamientoRepository();

  async asignarRuta(input: AsignarRutaInput, usuarioId: number) {
    const correspondencia = await prisma.correspondencia.findUnique({
      where: { id: input.correspondenciaId }
    });
    if (!correspondencia) {
      throw new AppError('Correspondencia no encontrada', 404);
    }
    if (correspondencia.tipo !== 'SALIDA') {
      throw new AppError('Solo se puede enrutar correspondencia de salida', 400);
    }

    const metodoEnvio = await prisma.metodoEnvio.findUnique({
      where: { id: input.metodoEnvioId }
    });
    if (!metodoEnvio || !metodoEnvio.activo) {
      throw new AppError('Metodo de envio no valido o inactivo', 400);
    }

    if (input.mensajeroId) {
      const mensajero = await prisma.user.findUnique({
        where: { id: input.mensajeroId }
      });
      if (!mensajero) {
        throw new AppError('Mensajero no encontrado', 404);
      }
    }

    return this.repository.asignarRuta(input, usuarioId);
  }

  async listarRutas(filtros: RutaFilter) {
    return this.repository.findAll(filtros);
  }

  async obtenerRuta(id: number) {
    const ruta = await this.repository.findById(id);
    if (!ruta) {
      throw new AppError('Ruta no encontrada', 404);
    }
    return ruta;
  }

  async marcarEntregada(id: number, usuarioId: number, observaciones?: string) {
    const ruta = await this.obtenerRuta(id);
    if (ruta.estado !== 'ASIGNADA' && ruta.estado !== 'EN_TRANSITO') {
      throw new AppError('Estado no valido para marcar como entregada', 400);
    }
    return this.repository.actualizarEstado(id, 'ENTREGADA', usuarioId, new Date(), observaciones);
  }

  async reportarFallo(id: number, usuarioId: number, observaciones: string) {
    const ruta = await this.obtenerRuta(id);
    return this.repository.actualizarEstado(id, 'FALLIDA', usuarioId, undefined, observaciones);
  }

  async listarMetodosEnvio() {
    return this.repository.findMetodosEnvio();
  }
}
