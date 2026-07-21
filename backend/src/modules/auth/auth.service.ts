import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../../config';
import { AppError } from '../../errors';
import { authRepository } from './auth.repository';
import { enviarCorreo } from '../../services/email.service';
import { LoginInput, RestablecerContrasenaInput } from './auth.types';

export const authService = {
  login: async (input: LoginInput, ipAddress: string, userAgent: string) => {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user || !user.activo) {
      throw new AppError('Credenciales inválidas o usuario inactivo', 401);
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      throw new AppError('Credenciales inválidas o usuario inactivo', 401);
    }

    const payload = {
      id: user.id,
      email: user.email,
      rolNombre: user.rol?.nombre || '',
    };

    const accessToken = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn as any });
    const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: config.jwtRefreshExpiresIn as any });

    const decoded = jwt.decode(accessToken) as jwt.JwtPayload;
    const fechaExpiracion = new Date((decoded.exp || 0) * 1000);

    await authRepository.createSesion(user.id, accessToken, ipAddress, userAgent, fechaExpiracion);

    const { password, ...userWithoutPassword } = user as any;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken
    };
  },

  logout: async (token: string) => {
    await authRepository.invalidarSesion(token);
  },

  recuperarContrasena: async (email: string) => {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await authRepository.crearSolicitudRecuperacion(user.id, token, expires);

    const resetLink = `${config.frontendUrl}/reset-password?token=${token}`;
    const html = `<p>Has solicitado restablecer tu contraseña. Haz clic en el enlace de abajo:</p>
                  <p><a href="${resetLink}">Restablecer contraseña</a></p>
                  <p>Este enlace expirará en 1 hora.</p>`;
    
    await enviarCorreo(email, 'Recuperación de contraseña', html);
  },

  restablecerContrasena: async (input: RestablecerContrasenaInput) => {
    const solicitud = await authRepository.findSolicitudByToken(input.token);
    if (!solicitud || solicitud.usado || new Date() > solicitud.fechaExpiracion) {
      throw new AppError('El token es inválido o ha expirado', 400);
    }

    const hashedPassword = await bcrypt.hash(input.nuevaContrasena, 10);
    await authRepository.updatePassword(parseInt(solicitud.userId as any), hashedPassword);
    await authRepository.marcarSolicitudUsada(parseInt(solicitud.id as any));
    
    await authRepository.invalidarTodasSesiones(parseInt(solicitud.userId as any));
  },

  getProfile: async (userId: string | number) => {
    const user = await authRepository.findUserById(typeof userId === 'string' ? parseInt(userId) : userId);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }
    const { password, ...userWithoutPassword } = user as any;
    return userWithoutPassword;
  }
};
