// Tipos de autenticacion

export interface RegisterInput {
  nombre: string;
  email: string;
  password: string;
  role?: 'ADMIN' | 'OPERADOR_UCC' | 'MENSAJERO' | 'AREA_ADMINISTRATIVA';
  areaId?: number;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface TokenPayload {
  id: number;
  email: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: number;
      nombre: string;
      email: string;
      role: string;
      area?: { id: number; nombre: string; clave: string } | null;
    };
    accessToken: string;
    refreshToken: string;
  };
}
