<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../services/api';
import { useAuthStore } from '../stores/auth.store';

const authStore = useAuthStore();
const correspondencias = ref([]);
const loading = ref(true);

const form = ref({
  asunto: '',
  remitente: '',
  areaDestinoId: '',
  prioridad: 'NORMAL',
  clasificacion: 'ORDINARIA',
  cantidadAnexos: 0,
});

const isModalOpen = ref(false);

const loadCorrespondencia = async () => {
  try {
    const { data } = await api.get('/recepcion');
    correspondencias.value = data.data;
  } catch (error) {
    console.error('Error fetching recepcion', error);
  } finally {
    loading.value = false;
  }
};

const registrarRecepcion = async () => {
  try {
    await api.post('/recepcion', {
      ...form.value,
      areaDestinoId: parseInt(form.value.areaDestinoId)
    });
    isModalOpen.value = false;
    form.value = {
      asunto: '', remitente: '', areaDestinoId: '', prioridad: 'NORMAL', clasificacion: 'ORDINARIA', cantidadAnexos: 0
    };
    loadCorrespondencia();
  } catch (error) {
    console.error('Error registrando correspondencia', error);
  }
};

onMounted(() => {
  loadCorrespondencia();
});
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1>Recepción de Correspondencia (HU-06)</h1>
        <p>Registro de correspondencia de entrada externa.</p>
      </div>
      <button v-if="authStore.userRole !== 'MENSAJERO'" @click="isModalOpen = true" class="btn btn-primary">
        + Nueva Recepción
      </button>
    </div>

    <!-- Modal Form -->
    <div v-if="isModalOpen" class="modal-overlay">
      <div class="glass-panel modal-content">
        <h2 style="margin-bottom: 1.5rem;">Registrar Correspondencia de Entrada</h2>
        
        <form @submit.prevent="registrarRecepcion">
          <div class="form-group">
            <label class="form-label">Asunto</label>
            <input v-model="form.asunto" type="text" class="form-input" required />
          </div>
          
          <div class="form-group">
            <label class="form-label">Remitente</label>
            <input v-model="form.remitente" type="text" class="form-input" required />
          </div>
          
          <div class="form-group">
            <label class="form-label">ID Área Destino</label>
            <input v-model="form.areaDestinoId" type="number" class="form-input" required />
          </div>

          <div style="display: flex; gap: 1rem;">
            <div class="form-group" style="flex: 1;">
              <label class="form-label">Prioridad</label>
              <select v-model="form.prioridad" class="form-input">
                <option value="NORMAL">Normal</option>
                <option value="URGENTE">Urgente</option>
              </select>
            </div>
            
            <div class="form-group" style="flex: 1;">
              <label class="form-label">Clasificación</label>
              <select v-model="form.clasificacion" class="form-input">
                <option value="ORDINARIA">Ordinaria</option>
                <option value="CONFIDENCIAL">Confidencial</option>
                <option value="CON_VALORES">Con Valores</option>
              </select>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem;">
            <button type="button" @click="isModalOpen = false" class="btn btn-secondary">Cancelar</button>
            <button type="submit" class="btn btn-primary">Registrar y Generar Acuse</button>
          </div>
        </form>
      </div>
    </div>

    <div class="glass-panel" style="padding: 1.5rem;">
      <table class="data-table">
        <thead>
          <tr>
            <th>Folio</th>
            <th>Asunto</th>
            <th>Remitente</th>
            <th>Estado</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody v-if="!loading">
          <tr v-for="item in correspondencias" :key="item.id">
            <td><strong>{{ item.folio }}</strong></td>
            <td>{{ item.asunto }}</td>
            <td>{{ item.remitente }}</td>
            <td><span class="badge">{{ item.estado }}</span></td>
            <td>{{ new Date(item.fechaRecepcion).toLocaleDateString() }}</td>
          </tr>
          <tr v-if="correspondencias.length === 0">
            <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">
              No hay correspondencias registradas.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  background-color: #e0e7ff;
  color: var(--color-primary);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.modal-content {
  width: 100%;
  max-width: 600px;
  padding: 2rem;
  max-height: 90vh;
  overflow-y: auto;
}
</style>
