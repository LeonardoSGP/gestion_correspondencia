import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { AppError } from '../../errors';
import { AuthRepository } from './auth.repository';
import { RegisterInput, LoginInput, TokenPayload } from './auth.types';

const authRepo = new AuthRepository();

export class AuthService {
  // -- Registro de usuario --
  async register(input: RegisterInput) {
    const exists = await authRepo.emailExists(input.email);
    if (exists) {
      throw new AppError(409, 'El email ya esta registrado');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await authRepo.createUser({
      nombre: input.nombre,
      email: input.email,
      password: hashedPassword,
      role: input.role,
      areaId: input.areaId,
    });

    const tokens = this.generateTokens({ id: user.id, email: user.email, role: user.role });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  // -- Login --
  async login(input: LoginInput) {
    const user = await authRepo.findUserByEmail(input.email);
    if (!user) {
      throw new AppError(401, 'Credenciales invalidas');
    }

    if (!user.activo) {
      throw new AppError(403, 'La cuenta esta desactivada. Contacta al administrador');
    }

    const validPassword = await bcrypt.compare(input.password, user.password);
    if (!validPassword) {
      throw new AppError(401, 'Credenciales invalidas');
    }

    const tokens = this.generateTokens({ id: user.id, email: user.email, role: user.role });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  // -- Refresh token --
  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as TokenPayload;
      const user = await authRepo.findUserById(decoded.id);

      if (!user || !user.activo) {
        throw new AppError(401, 'Token invalido o usuario desactivado');
      }

      const tokens = this.generateTokens({ id: user.id, email: user.email, role: user.role });

      return {
        user: this.sanitizeUser(user),
        ...tokens,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(401, 'Refresh token invalido o expirado');
    }
  }

  // -- Obtener perfil del usuario autenticado --
  async getProfile(userId: number) {
    const user = await authRepo.findUserById(userId);
    if (!user) {
      throw new AppError(404, 'Usuario no encontrado');
    }
    return this.sanitizeUser(user);
  }

  // -- Helpers privados --

  private generateTokens(payload: TokenPayload) {
    const accessToken = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });
    const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, {
      expiresIn: config.jwtRefreshExpiresIn as any,
    });
    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: any) {
    const { password, ...rest } = user;
    return rest;
  }
}
