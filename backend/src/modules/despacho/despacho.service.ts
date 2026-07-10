import { AppError } from '../../errors';
import { DespachoRepository } from './despacho.repository';
import { CreateDespachoInput, DespachoFilter } from './despacho.types';

const despachoRepo = new DespachoRepository();

export class DespachoService {
  async solicitar(input: CreateDespachoInput, usuarioId: number) {
    return despachoRepo.create(input, usuarioId);
  }

  async obtenerTodas(filtros: DespachoFilter) {
    return despachoRepo.findAll(filtros);
  }

  async obtenerPorId(id: number) {
    const correspondencia = await despachoRepo.findById(id);
    if (!correspondencia) throw new AppError(404, 'Correspondencia no encontrada');
    if (correspondencia.tipo !== 'SALIDA') throw new AppError(400, 'El documento no es de tipo SALIDA');
    return correspondencia;
  }

  async validarSalida(id: number, estado: string, usuarioId: number, observaciones?: string) {
    const correspondencia = await this.obtenerPorId(id);
    if (correspondencia.estado !== 'EN_REVISION') {
      throw new AppError(400, 'La correspondencia debe estar en estado EN_REVISION para ser validada');
    }
    return despachoRepo.updateEstado(id, estado, usuarioId, observaciones);
  }

  async asignarDespacho(id: number, usuarioId: number, data: any) {
    const correspondencia = await this.obtenerPorId(id);
    if (correspondencia.estado !== 'EN_DISTRIBUCION') {
      throw new AppError(400, 'La correspondencia debe estar validada (EN_DISTRIBUCION) antes de asignarla a mensajeria');
    }
    return despachoRepo.asignar(id, usuarioId, data);
  }
}
