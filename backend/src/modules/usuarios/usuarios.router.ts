import { Router } from 'express';
import { usuariosService } from './usuarios.service';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import {
  createUsuarioSchema,
  updateUsuarioSchema,
  asignarRolSchema,
  createRolSchema,
  asignarPermisosSchema
} from './usuarios.schema';
import { UsuarioFilter } from './usuarios.types';

const router = Router();

router.use(authMiddleware);


// Static routes for roles and permisos
router.get('/roles', requireRole(['ADMIN', 'OPERADOR_UCC']), async (req, res, next) => {
  try {
    const roles = await usuariosService.listarRoles();
    res.json(roles);
  } catch (error) {
    next(error);
  }
});

router.post('/roles', requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const validated = createRolSchema.parse(req.body);
    const rol = await usuariosService.crearRol(validated);
    res.status(201).json(rol);
  } catch (error) {
    next(error);
  }
});

router.get('/roles/:id', requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const rol = await usuariosService.obtenerRol(id);
    res.json(rol);
  } catch (error) {
    next(error);
  }
});

router.put('/roles/:id/permisos', requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const validated = asignarPermisosSchema.parse(req.body);
    await usuariosService.asignarPermisos(id, validated.permisoIds);
    res.json({ message: 'Permisos asignados exitosamente' });
  } catch (error) {
    next(error);
  }
});

router.get('/permisos', requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const permisos = await usuariosService.listarPermisos();
    res.json(permisos);
  } catch (error) {
    next(error);
  }
});

// Dynamic routes for users
router.get('/', requireRole(['ADMIN', 'OPERADOR_UCC']), async (req, res, next) => {
  try {
    const filter: UsuarioFilter = {
      nombre: req.query.nombre as string,
      email: req.query.email as string,
      rolId: req.query.rolId ? parseInt(req.query.rolId as string, 10) : undefined,
      activo: req.query.activo ? req.query.activo === 'true' : undefined,
    };
    const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : undefined;
    const take = req.query.take ? parseInt(req.query.take as string, 10) : undefined;

    const result = await usuariosService.listarUsuarios(filter, skip, take);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/', requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const validated = createUsuarioSchema.parse(req.body);
    const user = await usuariosService.crearUsuario(validated);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', requireRole(['ADMIN', 'OPERADOR_UCC']), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const user = await usuariosService.obtenerUsuario(id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const validated = updateUsuarioSchema.parse(req.body);
    const user = await usuariosService.actualizarUsuario(id, validated);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/deshabilitar', requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const user = await usuariosService.deshabilitarUsuario(id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/rol', requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const validated = asignarRolSchema.parse(req.body);
    const user = await usuariosService.asignarRol(id, validated.rolId);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

export { router as usuariosRouter };
