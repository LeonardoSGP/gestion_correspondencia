export interface CreateAreaInput {
  nombre: string;
  clave: string;
  responsable?: string;
}

export interface UpdateAreaInput {
  nombre?: string;
  clave?: string;
  responsable?: string;
  activa?: boolean;
}
