import { RecepcionRepository } from './recepcion.repository';
import { CreateRecepcionInput, RecepcionFilter } from './recepcion.types';
import { AppError } from '../../errors';

const repository = new RecepcionRepository();

export class RecepcionService {
  async registrar(input: CreateRecepcionInput, usuarioId: number) {
    try {
      return await repository.create(input, usuarioId);
    } catch (error: any) {
      throw new AppError(`Error al registrar correspondencia: ${error.message}`, 500);
    }
  }

  async obtenerTodas(filtros: RecepcionFilter) {
    return repository.findAll(filtros);
  }

  async obtenerPorId(id: number) {
    const correspondencia = await repository.findById(id);
    if (!correspondencia) {
      throw new AppError('Correspondencia no encontrada', 404);
    }
    if (correspondencia.tipo !== 'ENTRADA') {
      throw new AppError('La correspondencia solicitada no es de entrada', 400);
    }
    return correspondencia;
  }
}
