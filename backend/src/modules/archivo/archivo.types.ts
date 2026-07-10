export interface ArchivoFilter {
  folio?: string;
  tipo?: 'ENTRADA' | 'SALIDA';
  estado?: string;
  fechaInicio?: string;
  fechaFin?: string;
  areaOrigenId?: number;
  areaDestinoId?: number;
}
