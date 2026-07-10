export interface CreateDespachoInput {
  asunto: string;
  descripcion?: string;
  numDocumento?: string;
  fechaDocumento?: string;
  cantidadAnexos?: number;
  observaciones?: string;
  prioridad?: 'URGENTE' | 'ORDINARIA';
  clasificacion?: 'NORMAL' | 'CONFIDENCIAL' | 'CON_VALORES';
  destinatario: string;
  cargoDestinatario?: string;
  instDestinatario?: string;
  areaOrigenId: number;
}

export interface DespachoFilter {
  folio?: string;
  estado?: string;
  fechaInicio?: string;
  fechaFin?: string;
  areaOrigenId?: number;
}
