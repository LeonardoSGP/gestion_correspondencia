export interface AsignarRutaInput {
  correspondenciaId: number;
  metodoEnvioId: number;
  mensajeroId?: number;
  alcance: 'LOCAL' | 'NACIONAL' | 'INTERNACIONAL';
  direccionDestino?: string;
  numeroGuia?: string;
  observaciones?: string;
}

export interface RutaFilter {
  correspondenciaId?: number;
  mensajeroId?: number;
  estado?: string;
  alcance?: string;
}
