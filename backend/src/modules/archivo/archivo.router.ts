import { Router } from 'express';
import { ArchivoService } from './archivo.service';
import { authMiddleware, AuthRequest } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { CargarAcuseSchema, CerrarCicloSchema, ArchivoFilterSchema } from './archivo.schema';
import { uploadMiddleware } from '../../middlewares/upload.middleware';

const router = Router();
const service = new ArchivoService();

router.use(authMiddleware);

router.get('/buscar', async (req: AuthRequest, res, next) => {
  try {
    const filtros = ArchivoFilterSchema.parse(req.query);
    const resultados = await service.buscar(filtros);
    res.json(resultados);
  } catch (error) {
    next(error);
  }
});

router.get('/expedientes', async (req: AuthRequest, res, next) => {
  try {
    const expedientes = await service.listarExpedientes();
    res.json(expedientes);
  } catch (error) {
    next(error);
  }
});

router.patch('/expedientes/:id/notificar', requireRole(['ADMIN', 'OPERADOR_UCC']), async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id as string;
    const result = await service.notificarAreaGeneradora(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/historial', async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id as string;
    const historial = await service.obtenerHistorial(id);
    res.json(historial);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/acuse', requireRole(['ADMIN', 'OPERADOR_UCC']), uploadMiddleware.single('acuse'), async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id as string;
    const data = CargarAcuseSchema.parse(req.body);
    const rutaArchivo = req.file?.path || '';
    const result = await service.cargarAcuse(id, rutaArchivo, data.observaciones);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/cerrar', requireRole(['ADMIN', 'OPERADOR_UCC']), async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id as string;
    const data = CerrarCicloSchema.parse(req.body);
    const userId = req.user?.id as string;
    const result = await service.cerrarCiclo(id, userId, data.observaciones);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export { router as archivoRouter };
