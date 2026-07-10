import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.schema';
import { authMiddleware, AuthRequest } from '../../middlewares/auth.middleware';

const router = Router();
const authService = new AuthService();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = registerSchema.parse(req.body);
    const result = await authService.register(validated);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = loginSchema.parse(req.body);
    const result = await authService.login(validated);

    res.json({
      success: true,
      message: 'Login exitoso',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/refresh-token
router.post('/refresh-token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    const result = await authService.refreshToken(refreshToken);

    res.json({
      success: true,
      message: 'Token renovado',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/profile (requiere autenticacion)
router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getProfile(req.user.id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

export { router as authRouter };
