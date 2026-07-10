import prisma from '../../prisma.config';
import { CreateAreaInput, UpdateAreaInput } from './areas.types';

export class AreasRepository {
  async findAll(onlyActive: boolean = true) {
    const where = onlyActive ? { activa: true } : {};
    return prisma.areaAdministrativa.findMany({ where, orderBy: { nombre: 'asc' } });
  }

  async findById(id: number) {
    return prisma.areaAdministrativa.findUnique({ where: { id } });
  }

  async findByClave(clave: string) {
    return prisma.areaAdministrativa.findUnique({ where: { clave } });
  }

  async create(data: CreateAreaInput) {
    return prisma.areaAdministrativa.create({ data });
  }

  async update(id: number, data: UpdateAreaInput) {
    return prisma.areaAdministrativa.update({ where: { id }, data });
  }
}
