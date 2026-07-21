import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

/**
 * Middleware RBAC (HU-04) -- verifica que el usuario tenga uno de los roles permitidos.
 * Los roles se comparan contra el nombre del rol almacenado en la tabla `roles`.
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'No autenticado.' });
    }

    const userRole = req.user.rolNombre;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Roles permitidos: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};

/**
 * Middleware RBAC (HU-04) -- verifica que el usuario tenga un permiso especifico.
 * Los permisos se verifican contra la tabla `permisos` a traves de la relacion rol-permiso.
 */
export const requirePermiso = (permiso: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'No autenticado.' });
    }

    const userPermisos: string[] = req.user.permisos || [];

    if (!userPermisos.includes(permiso)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere el permiso: ${permiso}`,
      });
    }

    next();
  };
};
