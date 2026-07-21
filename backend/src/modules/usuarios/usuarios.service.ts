import bcrypt from 'bcryptjs';
import { AppError } from '../../errors';
import { usuariosRepository } from './usuarios.repository';
import { CreateUsuarioInput, UpdateUsuarioInput, UsuarioFilter, CreateRolInput } from './usuarios.types';

export class UsuariosService {
  async listarUsuarios(filter: UsuarioFilter, skip?: number, take?: number) {
    return usuariosRepository.findAll(filter, skip, take);
  }

  async obtenerUsuario(id: number) {
    const user = await usuariosRepository.findById(id);
    if (!user) {
      throw new AppError(404, 'Usuario no encontrado');
    }
    return user;
  }

  async crearUsuario(input: CreateUsuarioInput) {
    const existing = await usuariosRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError(400, 'El email ya está en uso');
    }
    
    let hashedPassword = '';
    if (input.password) {
      hashedPassword = await bcrypt.hash(input.password, 10);
    } else {
      throw new AppError(400, 'La contraseña es requerida');
    }

    return usuariosRepository.create({
      ...input,
      password: hashedPassword,
    });
  }

  async actualizarUsuario(id: number, input: UpdateUsuarioInput) {
    const user = await usuariosRepository.findById(id);
    if (!user) {
      throw new AppError(404, 'Usuario no encontrado');
    }

    if (input.email && input.email !== user.email) {
      const existing = await usuariosRepository.findByEmail(input.email);
      if (existing) {
        throw new AppError(400, 'El email ya está en uso');
      }
    }

    return usuariosRepository.update(id, input);
  }

  async deshabilitarUsuario(id: number) {
    const user = await usuariosRepository.findById(id);
    if (!user) {
      throw new AppError(404, 'Usuario no encontrado');
    }
    return usuariosRepository.deshabilitar(id);
  }

  async asignarRol(userId: number, rolId: number) {
    const user = await usuariosRepository.findById(userId);
    if (!user) {
      throw new AppError(404, 'Usuario no encontrado');
    }
    const rol = await usuariosRepository.findRolById(rolId);
    if (!rol) {
      throw new AppError(404, 'Rol no encontrado');
    }
    return usuariosRepository.update(userId, { rolId });
  }

  async listarRoles() {
    return usuariosRepository.findAllRoles();
  }

  async crearRol(data: CreateRolInput) {
    return usuariosRepository.createRol(data);
  }

  async obtenerRol(id: number) {
    const rol = await usuariosRepository.findRolById(id);
    if (!rol) {
      throw new AppError(404, 'Rol no encontrado');
    }
    return rol;
  }

  async asignarPermisos(rolId: number, permisoIds: number[]) {
    const rol = await usuariosRepository.findRolById(rolId);
    if (!rol) {
      throw new AppError(404, 'Rol no encontrado');
    }
    await usuariosRepository.asignarPermisos(rolId, permisoIds);
  }

  async listarPermisos() {
    return usuariosRepository.findAllPermisos();
  }
}

export const usuariosService = new UsuariosService();
