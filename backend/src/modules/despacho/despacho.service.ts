import { DespachoRepository } from './despacho.repository';
import { CreateDespachoInput, DespachoFilter } from './despacho.types';
import { AppError } from '../../errors';

const repository = new DespachoRepository();

export class DespachoService {
  async registrar(input: CreateDespachoInput, usuarioId: number | string) {
    return await repository.create(input, typeof usuarioId === 'string' ? parseInt(usuarioId) : usuarioId);
  }

  async obtenerTodas(filtros: DespachoFilter) {
    return await repository.findAll(filtros);
  }

  async obtenerPorId(id: number | string) {
    const parsedId = typeof id === 'string' ? parseInt(id) : id;
    const correspondencia = await repository.findById(parsedId);
    if (!correspondencia) {
      throw new AppError('Correspondencia no encontrada', 404);
    }
    if (correspondencia.tipo !== 'SALIDA') {
      throw new AppError('La correspondencia no es de tipo SALIDA', 400);
    }
    return correspondencia;
  }
}
