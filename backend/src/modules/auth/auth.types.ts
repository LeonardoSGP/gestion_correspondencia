export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  contrasena: string;
  nombre: string;
  apellidos: string;
  rolId: number;
  areaId?: number;
}

export interface TokenPayload {
  id: number;
  email: string;
  rolNombre: string;
}

export interface RecuperarContrasenaInput {
  email: string;
}

export interface RestablecerContrasenaInput {
  token: string;
  nuevaContrasena: string;
}
