import { AppError } from '../../errors';
import { RecepcionRepository } from './recepcion.repository';
import { CreateRecepcionInput, RecepcionFilter } from './recepcion.types';

const recepcionRepo = new RecepcionRepository();

export class RecepcionService {
  async registrar(input: CreateRecepcionInput, usuarioId: number) {
    return recepcionRepo.create(input, usuarioId);
  }

  async obtenerTodas(filtros: RecepcionFilter) {
    return recepcionRepo.findAll(filtros);
  }

  async obtenerPorId(id: number) {
    const correspondencia = await recepcionRepo.findById(id);
    if (!correspondencia) throw new AppError(404, 'Correspondencia no encontrada');
    if (correspondencia.tipo !== 'ENTRADA') throw new AppError(400, 'El documento no es de tipo ENTRADA');
    return correspondencia;
  }

  async cambiarEstado(id: number, estado: string, usuarioId: number, observaciones?: string) {
    await this.obtenerPorId(id); // Validar que existe
    return recepcionRepo.updateEstado(id, estado, usuarioId, observaciones);
  }

  async generarSello(id: number, usuarioId: number) {
    const correspondencia = await this.obtenerPorId(id);
    if (correspondencia.selloDigital) {
      throw new AppError(400, 'La correspondencia ya cuenta con un sello digital');
    }
    return recepcionRepo.generarSello(id, usuarioId);
  }

  async registrarFirma(id: number, usuarioId: number, observaciones?: string) {
    await this.obtenerPorId(id);
    try {
      return await recepcionRepo.registrarFirma(id, usuarioId, observaciones);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new AppError(400, 'El usuario ya ha firmado esta correspondencia');
      }
      throw error;
    }
  }
}
