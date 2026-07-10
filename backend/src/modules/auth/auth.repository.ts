import prisma from '../../prisma.config';

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { area: true },
    });
  }

  async findUserById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: { area: true },
    });
  }

  async createUser(data: {
    nombre: string;
    email: string;
    password: string;
    role?: 'ADMIN' | 'OPERADOR_UCC' | 'MENSAJERO' | 'AREA_ADMINISTRATIVA';
    areaId?: number;
  }) {
    return prisma.user.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        password: data.password,
        role: data.role || 'OPERADOR_UCC',
        areaId: data.areaId || null,
      },
      include: { area: true },
    });
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await prisma.user.count({ where: { email } });
    return count > 0;
  }
}
