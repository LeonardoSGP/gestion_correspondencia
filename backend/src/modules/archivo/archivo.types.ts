export interface CargarAcuseInput {
  observaciones?: string;
}

export interface CerrarCicloInput {
  observaciones?: string;
}

export interface ArchivoFilter {
  folio?: string;
  tipo?: 'ENTRADA' | 'SALIDA';
  estado?: string;
  fechaInicio?: string;
  fechaFin?: string;
}
