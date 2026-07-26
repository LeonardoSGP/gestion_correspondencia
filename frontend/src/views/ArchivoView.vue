<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../services/api';
import Swal from 'sweetalert2';

const expedientes = ref<any[]>([]);
const loading = ref(true);

const loadExpedientes = async () => {
  try {
    const { data } = await api.get('/archivo/expedientes');
    expedientes.value = data;
  } catch (error) {
    console.error('Error fetching expedientes', error);
  } finally {
    loading.value = false;
  }
};

const notificarOrigen = async (id: number) => {
  if (confirm('¿Deseas enviar la notificación de archivo al área de origen?')) {
    try {
      await api.patch(`/archivo/expedientes/${id}/notificar`);
      loadExpedientes();
    } catch (error) {
      console.error('Error al notificar', error);
    }
  }
};

const exportarCSV = () => {
  if (expedientes.value.length === 0) {
    Swal.fire('Vacío', 'No hay datos para exportar.', 'info');
    return;
  }
  
  const headers = ['Folio', 'Asunto', 'Tipo', 'Área Generadora', 'Fecha Cierre'];
  const rows = expedientes.value.map(e => [
    e.correspondencia?.folio || '',
    `"${(e.correspondencia?.asunto || '').replace(/"/g, '""')}"`,
    e.correspondencia?.tipo || '',
    `"${(e.areaGeneradora?.nombre || 'UCC').replace(/"/g, '""')}"`,
    new Date(e.fechaCierre).toLocaleString()
  ]);
  
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `reporte_archivo_${new Date().getTime()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

onMounted(() => {
  loadExpedientes();
});
</script>

<template>
  <div>
    <div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1>Archivo Central (HU-10)</h1>
        <p>Resguardo de acuses de recibo y expedientes cerrados.</p>
      </div>
      <button @click="exportarCSV" class="btn btn-primary" style="background-color: #28a745; border-color: #28a745;">
        Exportar a CSV
      </button>
    </div>

    <div class="glass-panel" style="padding: 1.5rem;">
      <table class="data-table">
        <thead>
          <tr>
            <th>Folio</th>
            <th>Asunto</th>
            <th>Tipo</th>
            <th>Acuse (ID)</th>
            <th>Fecha de Cierre</th>
            <th>Notificado a Origen</th>
          </tr>
        </thead>
        <tbody v-if="!loading">
          <tr v-for="exp in expedientes" :key="exp.id">
            <td><strong>{{ exp.correspondencia?.folio }}</strong></td>
            <td>{{ exp.correspondencia?.asunto }}</td>
            <td>{{ exp.correspondencia?.tipo }}</td>
            <td>{{ exp.acuse?.id ? `Acuse #${exp.acuse.id}` : 'N/A' }}</td>
            <td>{{ new Date(exp.fechaCierre).toLocaleString() }}</td>
            <td>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span class="badge" :class="exp.notificado ? 'badge-success' : ''">
                  {{ exp.notificado ? 'Sí' : 'No' }}
                </span>
                <button 
                  v-if="!exp.notificado" 
                  @click="notificarOrigen(exp.id)" 
                  class="btn btn-primary" 
                  style="padding: 0.2rem 0.5rem; font-size: 0.7rem;">
                  Notificar
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="expedientes.length === 0">
            <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">
              No hay expedientes en el archivo.
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
.badge { background-color: #f1f5f9; color: #475569; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
.badge-success { background-color: #dcfce7; color: #166534; }
</style>
