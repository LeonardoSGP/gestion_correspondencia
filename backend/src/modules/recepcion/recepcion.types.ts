export interface CreateRecepcionInput {
  asunto: string;
  descripcion?: string;
  numDocumento?: string;
  fechaDocumento?: string;
  cantidadAnexos?: number;
  observaciones?: string;
  prioridad?: 'URGENTE' | 'ORDINARIA';
  clasificacion?: 'NORMAL' | 'CONFIDENCIAL' | 'CON_VALORES';
  remitente: string;
  cargoRemitente?: string;
  instRemitente?: string;
  areaDestinoId: number;
}

export interface RecepcionFilter {
  folio?: string;
  estado?: string;
  fechaInicio?: string;
  fechaFin?: string;
  areaDestinoId?: number;
}
