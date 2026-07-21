import prisma from '../../prisma.config';

export const authRepository = {
  findUserByEmail: async (email: string) => {
    return prisma.user.findUnique({
      where: { email },
      include: { rol: true },
    });
  },

  findUserById: async (id: number) => {
    return prisma.user.findUnique({
      where: { id },
      include: { rol: true, area: true },
    });
  },

  createSesion: async (userId: number, token: string, ipAddress: string, userAgent: string, fechaExpiracion: Date) => {
    return prisma.sesion.create({
      data: {
        userId,
        token,
        ipAddress,
        userAgent,
        fechaExpiracion,
        activa: true,
        ultimaActividad: new Date(),
      },
    });
  },

  invalidarSesion: async (token: string) => {
    return prisma.sesion.updateMany({
      where: { token, activa: true },
      data: { activa: false },
    });
  },

  invalidarTodasSesiones: async (userId: number) => {
    return prisma.sesion.updateMany({
      where: { userId, activa: true },
      data: { activa: false },
    });
  },

  crearSolicitudRecuperacion: async (userId: number, token: string, fechaExpiracion: Date) => {
    return prisma.solicitudRecuperacion.create({
      data: {
        userId,
        token,
        fechaExpiracion,
        usado: false,
      },
    });
  },

  findSolicitudByToken: async (token: string) => {
    return prisma.solicitudRecuperacion.findUnique({
      where: { token },
      include: { usuario: true },
    });
  },

  marcarSolicitudUsada: async (id: number) => {
    return prisma.solicitudRecuperacion.update({
      where: { id },
      data: { usado: true },
    });
  },

  updatePassword: async (userId: number, password: string) => {
    return prisma.user.update({
      where: { id: userId },
      data: { password },
    });
  }
};
