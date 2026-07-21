<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../services/api';

const distribuciones = ref([]);
const loading = ref(true);

const loadDistribuciones = async () => {
  try {
    const { data } = await api.get('/distribucion');
    distribuciones.value = data.data;
  } catch (error) {
    console.error('Error fetching distribucion', error);
  } finally {
    loading.value = false;
  }
};

const confirmarEntrega = async (id: number) => {
  if (confirm('¿Confirmar entrega a esta área?')) {
    try {
      await api.patch(`/distribucion/${id}/confirmar`, { observaciones: 'Entregado conforme' });
      loadDistribuciones();
    } catch (error) {
      console.error('Error al confirmar', error);
    }
  }
};

onMounted(() => {
  loadDistribuciones();
});
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1>Distribución Interna (HU-07)</h1>
        <p>Control de entrega de correspondencia a áreas receptoras.</p>
      </div>
    </div>

    <div class="glass-panel" style="padding: 1.5rem;">
      <table class="data-table">
        <thead>
          <tr>
            <th>Folio / Asunto</th>
            <th>Área Destino</th>
            <th>Entregado Por</th>
            <th>Estado</th>
            <th>Fecha Confirmación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody v-if="!loading">
          <tr v-for="item in distribuciones" :key="item.id">
            <td>
              <strong>{{ item.correspondencia?.folio }}</strong><br>
              <span style="font-size: 0.8rem; color: var(--text-muted);">{{ item.correspondencia?.asunto }}</span>
            </td>
            <td>{{ item.areaDestino?.nombre }}</td>
            <td>{{ item.entregadoPor?.nombre }}</td>
            <td>
              <span class="badge" :class="{'badge-success': item.estado === 'ENTREGADA'}">{{ item.estado }}</span>
            </td>
            <td>{{ item.fechaConfirmacion ? new Date(item.fechaConfirmacion).toLocaleString() : 'Pendiente' }}</td>
            <td>
              <button 
                v-if="item.estado === 'PENDIENTE' || item.estado === 'EN_TRANSITO'" 
                @click="confirmarEntrega(item.id)" 
                class="btn btn-primary" 
                style="padding: 0.25rem 0.75rem; font-size: 0.75rem;">
                Confirmar
              </button>
            </td>
          </tr>
          <tr v-if="distribuciones.length === 0">
            <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">
              No hay distribuciones registradas.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.875rem;
  margin-bottom: 0.25rem;
}

.page-header p {
  color: var(--text-muted);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.data-table th {
  font-weight: 600;
  color: var(--text-muted);
  font-size: 0.875rem;
  text-transform: uppercase;
}

.badge {
  background-color: #fef08a;
  color: #854d0e;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-success {
  background-color: #dcfce7;
  color: #166534;
}
</style>
