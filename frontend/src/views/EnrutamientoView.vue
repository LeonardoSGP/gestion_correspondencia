<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../services/api';

const rutas = ref([]);
const loading = ref(true);

const loadRutas = async () => {
  try {
    const { data } = await api.get('/enrutamiento');
    rutas.value = data.data;
  } catch (error) {
    console.error('Error fetching rutas', error);
  } finally {
    loading.value = false;
  }
};

const marcarEntregado = async (id: number) => {
  if (confirm('¿Marcar ruta externa como ENTREGADA?')) {
    await api.patch(`/enrutamiento/${id}/entregar`);
    loadRutas();
  }
};

onMounted(() => {
  loadRutas();
});
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1>Enrutamiento (HU-09)</h1>
        <p>Asignación de rutas y mensajería externa.</p>
      </div>
    </div>

    <div class="glass-panel" style="padding: 1.5rem;">
      <table class="data-table">
        <thead>
          <tr>
            <th>Folio Correspondencia</th>
            <th>Método de Envío</th>
            <th>Mensajero / Guía</th>
            <th>Alcance</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody v-if="!loading">
          <tr v-for="ruta in rutas" :key="ruta.id">
            <td><strong>{{ ruta.correspondencia?.folio }}</strong></td>
            <td>{{ ruta.metodoEnvio?.nombre }}</td>
            <td>{{ ruta.mensajero?.nombre || ruta.numeroGuia || 'N/A' }}</td>
            <td>{{ ruta.alcance }}</td>
            <td><span class="badge">{{ ruta.estado }}</span></td>
            <td>
              <button 
                v-if="ruta.estado === 'ASIGNADA' || ruta.estado === 'EN_TRANSITO'"
                @click="marcarEntregado(ruta.id)" 
                class="btn btn-primary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                Marcar Entregado
              </button>
            </td>
          </tr>
          <tr v-if="rutas.length === 0">
            <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">
              No hay rutas asignadas.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.page-header { margin-bottom: 2rem; }
.page-header h1 { font-size: 1.875rem; margin-bottom: 0.25rem; }
.page-header p { color: var(--text-muted); }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 1rem; text-align: left; border-bottom: 1px solid var(--border-color); }
.data-table th { font-weight: 600; color: var(--text-muted); font-size: 0.875rem; text-transform: uppercase; }
.badge { background-color: #fce7f3; color: #be185d; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
</style>
