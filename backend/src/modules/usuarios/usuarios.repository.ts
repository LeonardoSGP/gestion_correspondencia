import prisma from '../../prisma.config';
import { CreateUsuarioInput, UpdateUsuarioInput, UsuarioFilter, CreateRolInput } from './usuarios.types';

export class UsuariosRepository {
  async findAll(filter: UsuarioFilter, skip?: number, take?: number) {
    const where: any = {};
    if (filter.nombre) where.nombre = { contains: filter.nombre };
    if (filter.email) where.email = { contains: filter.email };
    if (filter.rolId) where.rolId = filter.rolId;
    if (filter.activo !== undefined) where.activo = filter.activo;

    const [usuarios, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { rol: true, area: true },
        skip,
        take,
      }),
      prisma.user.count({ where }),
    ]);

    return { usuarios, total };
  }

  async findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        rol: {
          include: {
            permisos: {
              include: {
                permiso: true,
              },
            },
          },
        },
        area: true,
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: CreateUsuarioInput) {
    return prisma.user.create({
      data: data as any,
    });
  }

  async update(id: number, data: UpdateUsuarioInput) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async deshabilitar(id: number) {
    return prisma.user.update({
      where: { id },
      data: { activo: false },
    });
  }

  async findAllRoles() {
    return prisma.rol.findMany();
  }

  async findRolById(id: number) {
    return prisma.rol.findUnique({
      where: { id },
      include: {
        permisos: {
          include: {
            permiso: true,
          },
        },
      },
    });
  }

  async createRol(data: CreateRolInput) {
    return prisma.user.create({
      data: data as any,
    });
  }

  async asignarPermisos(rolId: number, permisoIds: number[]) {
    return prisma.$transaction(async (tx) => {
      await tx.rolPermiso.deleteMany({
        where: { rolId },
      });
      if (permisoIds.length > 0) {
        await tx.rolPermiso.createMany({
          data: permisoIds.map((permisoId) => ({ rolId, permisoId })),
        });
      }
    });
  }

  async findAllPermisos() {
    return prisma.permiso.findMany();
  }
}

export const usuariosRepository = new UsuariosRepository();
