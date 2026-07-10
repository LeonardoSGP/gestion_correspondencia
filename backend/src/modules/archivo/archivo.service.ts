import { AppError } from '../../errors';
import { ArchivoRepository } from './archivo.repository';
import { ArchivoFilter } from './archivo.types';
import prisma from '../../prisma.config';

const archivoRepo = new ArchivoRepository();

export class ArchivoService {
  async buscar(filtros: ArchivoFilter) {
    return archivoRepo.buscar(filtros);
  }

  async obtenerHistorial(id: number) {
    const correspondencia = await prisma.correspondencia.findUnique({ where: { id } });
    if (!correspondencia) throw new AppError(404, 'Correspondencia no encontrada');
    
    return archivoRepo.getHistorial(id);
  }

  async cargarAcuse(id: number, usuarioId: number, archivoUrl: string, observaciones?: string) {
    const correspondencia = await prisma.correspondencia.findUnique({ where: { id } });
    if (!correspondencia) throw new AppError(404, 'Correspondencia no encontrada');
    
    return archivoRepo.cargarAcuse(id, usuarioId, archivoUrl, observaciones);
  }
}
