import { AppError } from '../../errors';
import prisma from '../../prisma.config';
import { ArchivoRepository } from './archivo.repository';
import { ArchivoFilter } from './archivo.types';

export class ArchivoService {
  private repository: ArchivoRepository;

  constructor() {
    this.repository = new ArchivoRepository();
  }

  async cargarAcuse(correspondenciaId: string | number, rutaArchivo: string, observaciones?: string) {
    const parsedId = typeof correspondenciaId === 'string' ? parseInt(correspondenciaId) : correspondenciaId;
    const correspondencia = await prisma.correspondencia.findUnique({
      where: { id: parsedId },
    });
    if (!correspondencia) {
      throw new AppError('Correspondencia no encontrada', 404);
    }
    return this.repository.cargarAcuse(parsedId, rutaArchivo, observaciones);
  }

  async cerrarCiclo(correspondenciaId: string | number, usuarioId: string | number, observaciones?: string) {
    const parsedId = typeof correspondenciaId === 'string' ? parseInt(correspondenciaId) : correspondenciaId;
    const parsedUserId = typeof usuarioId === 'string' ? parseInt(usuarioId) : usuarioId;
    const correspondencia = await prisma.correspondencia.findUnique({
      where: { id: parsedId },
      include: { acuses: true },
    });

    if (!correspondencia) {
      throw new AppError('Correspondencia no encontrada', 404);
    }

    const acuseDigitalizado = (correspondencia as any).acuses?.find((a: any) => a.tipo === 'DIGITALIZADO');
    if (!acuseDigitalizado) {
      throw new AppError('La correspondencia debe tener un acuse digitalizado para cerrar el ciclo', 400);
    }

    return this.repository.cerrarCiclo(
      parsedId,
      acuseDigitalizado.id,
      parsedUserId,
      correspondencia.areaOrigenId || undefined,
      observaciones
    );
  }

  async buscar(filtros: ArchivoFilter) {
    return this.repository.buscarCorrespondencias(filtros);
  }

  async obtenerHistorial(correspondenciaId: string | number) {
    const parsedId = typeof correspondenciaId === 'string' ? parseInt(correspondenciaId) : correspondenciaId;
    const correspondencia = await prisma.correspondencia.findUnique({
      where: { id: parsedId },
    });
    if (!correspondencia) {
      throw new AppError('Correspondencia no encontrada', 404);
    }
    return this.repository.getHistorial(parsedId);
  }

  async listarExpedientes() {
    return this.repository.listarExpedientes();
  }

  async notificarAreaGeneradora(expedienteId: string | number) {
    const parsedId = typeof expedienteId === 'string' ? parseInt(expedienteId) : expedienteId;
    const expediente = await prisma.expediente.findUnique({
      where: { id: parsedId }
    });
    if (!expediente) {
      throw new AppError('Expediente no encontrado', 404);
    }
    return this.repository.marcarNotificado(parsedId);
  }
}
