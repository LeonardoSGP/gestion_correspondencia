import { AppError } from '../../errors';
import { AreasRepository } from './areas.repository';
import { CreateAreaInput, UpdateAreaInput } from './areas.types';

const areasRepo = new AreasRepository();

export class AreasService {
  async getAllAreas(onlyActive: boolean = true) {
    return areasRepo.findAll(onlyActive);
  }

  async getAreaById(id: number) {
    const area = await areasRepo.findById(id);
    if (!area) throw new AppError(404, 'Area administrativa no encontrada');
    return area;
  }

  async createArea(input: CreateAreaInput) {
    const existing = await areasRepo.findByClave(input.clave);
    if (existing) throw new AppError(409, `El area con clave ${input.clave} ya existe`);
    return areasRepo.create(input);
  }

  async updateArea(id: number, input: UpdateAreaInput) {
    await this.getAreaById(id); // Verifica si existe
    if (input.clave) {
      const existing = await areasRepo.findByClave(input.clave);
      if (existing && existing.id !== id) {
         throw new AppError(409, `El area con clave ${input.clave} ya existe`);
      }
    }
    return areasRepo.update(id, input);
  }

  async deactivateArea(id: number) {
    await this.getAreaById(id);
    return areasRepo.update(id, { activa: false });
  }
}
