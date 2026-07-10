import { AppError } from '../../errors';
import { MensajeriaRepository } from './mensajeria.repository';
import { MensajeriaFilter } from './mensajeria.types';

const mensajeriaRepo = new MensajeriaRepository();

export class MensajeriaService {
  async obtenerAsignaciones(mensajeroId: number, filtros: MensajeriaFilter) {
    return mensajeriaRepo.findAsignacionesByMensajero(mensajeroId, filtros);
  }

  async entregar(asignacionId: number, mensajeroId: number, observaciones?: string) {
    const asignacion = await mensajeriaRepo.findAsignacionById(asignacionId);
    if (!asignacion) throw new AppError(404, 'Asignacion no encontrada');
    if (asignacion.mensajeroId !== mensajeroId) throw new AppError(403, 'No tienes permiso para modificar esta asignacion');
    if (asignacion.estado !== 'ASIGNADA' && asignacion.estado !== 'EN_RUTA') {
      throw new AppError(400, `La asignacion no se puede entregar porque esta en estado ${asignacion.estado}`);
    }

    return mensajeriaRepo.marcarComoEntregada(asignacionId, asignacion.correspondenciaId, mensajeroId, observaciones);
  }

  async reportarFallo(asignacionId: number, mensajeroId: number, observaciones: string) {
    const asignacion = await mensajeriaRepo.findAsignacionById(asignacionId);
    if (!asignacion) throw new AppError(404, 'Asignacion no encontrada');
    if (asignacion.mensajeroId !== mensajeroId) throw new AppError(403, 'No tienes permiso para modificar esta asignacion');

    return mensajeriaRepo.marcarComoFallida(asignacionId, asignacion.correspondenciaId, mensajeroId, observaciones);
  }
}
