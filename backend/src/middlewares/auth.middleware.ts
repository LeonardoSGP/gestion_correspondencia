import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import prisma from '../prisma.config';

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No se proporciono token de autenticacion' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as { id: number };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        rol: { include: { permisos: { include: { permiso: true } } } },
        area: true,
      },
    });

    if (!user || !user.activo) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado o desactivado' });
    }

    // Verificar sesion activa (HU-05: control de inactividad)
    const sesion = await prisma.sesion.findFirst({
      where: { token, activa: true },
    });

    if (!sesion) {
      return res.status(401).json({ success: false, message: 'Sesion invalida o cerrada' });
    }

    // Verificar inactividad
    const ahora = new Date();
    const minutosInactivo = (ahora.getTime() - sesion.ultimaActividad.getTime()) / (1000 * 60);
    if (minutosInactivo > config.sessionInactivityMinutes) {
      await prisma.sesion.update({ where: { id: sesion.id }, data: { activa: false } });
      return res.status(401).json({ success: false, message: 'Sesion expirada por inactividad' });
    }

    // Actualizar ultima actividad
    await prisma.sesion.update({
      where: { id: sesion.id },
      data: { ultimaActividad: ahora },
    });

    // Adjuntar el nombre del rol para facil acceso
    req.user = {
      ...user,
      rolNombre: user.rol.nombre,
      permisos: user.rol.permisos.map((rp: any) => rp.permiso.nombre),
    };

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalido o expirado' });
  }
};
