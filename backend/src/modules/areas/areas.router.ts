import { Router, Request, Response, NextFunction } from 'express';
import { AreasService } from './areas.service';
import { createAreaSchema, updateAreaSchema } from './areas.schema';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';

const router = Router();
const areasService = new AreasService();

router.use(authMiddleware);

// GET /api/areas
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { all } = req.query;
    const onlyActive = all !== 'true';
    const areas = await areasService.getAllAreas(onlyActive);
    res.json({ success: true, data: areas });
  } catch (error) { next(error); }
});

// POST /api/areas (solo ADMIN)
router.post('/', requireRole(['ADMIN']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = createAreaSchema.parse(req.body);
    const area = await areasService.createArea(validated);
    res.status(201).json({ success: true, message: 'Area creada', data: area });
  } catch (error) { next(error); }
});

// PUT /api/areas/:id (solo ADMIN)
router.put('/:id', requireRole(['ADMIN']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    const validated = updateAreaSchema.parse(req.body);
    const area = await areasService.updateArea(id, validated);
    res.json({ success: true, message: 'Area actualizada', data: area });
  } catch (error) { next(error); }
});

// DELETE /api/areas/:id (solo ADMIN) - Baja logica
router.delete('/:id', requireRole(['ADMIN']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    const area = await areasService.deactivateArea(id);
    res.json({ success: true, message: 'Area desactivada', data: area });
  } catch (error) { next(error); }
});

export { router as areasRouter };
