export interface CreateDespachoInput {
  asunto: string;
  descripcion?: string;
  numDocumento?: string;
  fechaDocumento?: Date;
  cantidadAnexos?: number;
  observaciones?: string;
  prioridad?: string;
  clasificacion?: string;
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
