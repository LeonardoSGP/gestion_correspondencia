export interface MensajeriaFilter {
  estado?: 'ASIGNADA' | 'EN_RUTA' | 'ENTREGADA' | 'FALLIDA';
  alcance?: 'LOCAL' | 'NACIONAL' | 'INTERNACIONAL';
}
