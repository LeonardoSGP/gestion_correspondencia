export interface CreateUsuarioInput {
  nombre: string;
  email: string;
  password?: string;
  rolId: number;
  areaId?: number;
}

export interface UpdateUsuarioInput {
  nombre?: string;
  email?: string;
  rolId?: number;
  areaId?: number;
  activo?: boolean;
}

export interface UsuarioFilter {
  nombre?: string;
  email?: string;
  rolId?: number;
  activo?: boolean;
}

export interface CreateRolInput {
  nombre: string;
  descripcion?: string;
}
