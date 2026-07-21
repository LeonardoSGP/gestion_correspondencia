import { Router, RequestHandler } from 'express';
import { authService } from './auth.service';
import { loginSchema, recuperarContrasenaSchema, restablecerContrasenaSchema } from './auth.schema';
import { authMiddleware, AuthRequest } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/login', (async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const result = await authService.login(data, ipAddress, userAgent);
    res.json(result);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

router.post('/logout', authMiddleware, (async (req: AuthRequest, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await authService.logout(token);
    }
    res.json({ message: 'Logout exitoso' });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

router.post('/recuperar-contrasena', (async (req, res, next) => {
  try {
    const { email } = recuperarContrasenaSchema.parse(req.body);
    await authService.recuperarContrasena(email);
    res.json({ message: 'Si el correo existe, se han enviado las instrucciones.' });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

router.post('/restablecer-contrasena', (async (req, res, next) => {
  try {
    const data = restablecerContrasenaSchema.parse(req.body);
    await authService.restablecerContrasena(data);
    res.json({ message: 'Contraseña restablecida exitosamente.' });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

router.get('/profile', authMiddleware, (async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const profile = await authService.getProfile(userId);
    res.json(profile);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export { router as authRouter };
