<script setup lang="ts">
import Swal from 'sweetalert2';
import { ref, onMounted } from 'vue';
import api from '../services/api';
import { useAuthStore } from '../stores/auth.store';
import { imprimirAcuse } from '../utils/print';

const despachos = ref<any[]>([]);
const areas = ref<{id: number; nombre: string}[]>([]);
const loading = ref(true);
const isModalOpen = ref(false);

// Acuse Modal state
const isAcuseModalOpen = ref(false);
const selectedDespachoId = ref<number | null>(null);
const acuseFile = ref<File | null>(null);
const acuseObservaciones = ref('');
const isUploading = ref(false);

const form = ref({
  asunto: '',
  destinatario: '',
  areaOrigenId: '',
  prioridad: 'ORDINARIA',
  clasificacion: 'NORMAL',
});

const loadDespachos = async () => {
  try {
    const { data } = await api.get('/despacho');
    despachos.value = data;
  } catch (error) {
    console.error('Error fetching despacho', error);
  } finally {
    loading.value = false;
  }
};

const fetchAreas = async () => {
  try {
    const resAreas = await api.get('/areas');
    areas.value = resAreas.data.data || resAreas.data;
  } catch (error) {
    console.error('Error fetching areas', error);
  }
};

const registrarDespacho = async () => {
  try {
    await api.post('/despacho', {
      ...form.value,
      areaOrigenId: parseInt(form.value.areaOrigenId as string)
    });
    isModalOpen.value = false;
    form.value = { asunto: '', destinatario: '', areaOrigenId: '', prioridad: 'ORDINARIA', clasificacion: 'NORMAL' };
    loadDespachos();
  } catch (error: any) {
    console.error('Error registrando despacho', error);
    Swal.fire({ title: 'Error', text: `No se pudo registrar: ${error.response?.data?.message || error.message}`, icon: 'error' });
  }
};

const abrirModalAcuse = (id: number) => {
  selectedDespachoId.value = id;
  acuseFile.value = null;
  acuseObservaciones.value = '';
  isAcuseModalOpen.value = true;
};

const handleFileUpload = (event: any) => {
  const file = event.target.files[0];
  if (file && file.type === 'application/pdf') {
    acuseFile.value = file;
  } else {
    Swal.fire({ title: 'Atención', text: 'Por favor, selecciona un archivo PDF.', icon: 'warning' });
    event.target.value = '';
  }
};

const subirAcuseYCerrar = async () => {
  if (!selectedDespachoId.value || !acuseFile.value) return;
  
  isUploading.value = true;
  try {
    // 1. Subida real del Acuse (PDF)
    const formData = new FormData();
    formData.append('acuse', acuseFile.value);
    formData.append('observaciones', acuseObservaciones.value || 'Acuse digitalizado subido por operador');
    
    await api.post(`/archivo/${selectedDespachoId.value}/acuse`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    // 2. Cerrar el ciclo
    await api.post(`/archivo/${selectedDespachoId.value}/cerrar`, { observaciones: acuseObservaciones.value });
    
    isAcuseModalOpen.value = false;
    loadDespachos();
    Swal.fire({ title: 'Éxito', text: '¡Expediente cerrado y archivado correctamente con su acuse real!', icon: 'success' });
  } catch (error: any) {
    console.error('Error al subir acuse', error);
    Swal.fire({ title: 'Error', text: `No se pudo completar: ${error.response?.data?.message || error.message}`, icon: 'error' });
  } finally {
    isUploading.value = false;
  }
};

onMounted(() => {
  loadDespachos();
  fetchAreas();
});
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1>Registro de Despacho (HU-08)</h1>
        <p>Registro de correspondencia de salida hacia el exterior.</p>
      </div>
      <button v-if="['ADMIN', 'OPERADOR_UCC', 'AREA_ADMINISTRATIVA'].includes(useAuthStore().userRole)" @click="isModalOpen = true" class="btn btn-primary">
        + Nuevo Despacho
      </button>
    </div>

    <!-- Modal Form -->
    <div v-if="isModalOpen" class="modal-overlay">
      <div class="glass-panel modal-content">
        <h2 style="margin-bottom: 1.5rem;">Registrar Despacho (Salida)</h2>
        <form @submit.prevent="registrarDespacho">
          <div class="form-group">
            <label class="form-label">Asunto</label>
            <input v-model="form.asunto" type="text" class="form-input" required />
          </div>
          
          <div class="form-group">
            <label class="form-label">Destinatario Externo</label>
            <input v-model="form.destinatario" type="text" class="form-input" required />
          </div>
          
          <div class="form-group">
            <label class="form-label">Área Origen (Institución)</label>
            <select v-model="form.areaOrigenId" class="form-input" required>
              <option value="" disabled>Seleccione un área...</option>
              <option v-for="area in areas" :key="area.id" :value="area.id">{{ area.nombre }}</option>
            </select>
          </div>

          <div style="display: flex; gap: 1rem;">
            <div class="form-group" style="flex: 1;">
              <label class="form-label">Prioridad</label>
              <select v-model="form.prioridad" class="form-input">
                <option value="ORDINARIA">Ordinaria</option>
                <option value="URGENTE">Urgente</option>
              </select>
            </div>
            
            <div class="form-group" style="flex: 1;">
              <label class="form-label">Clasificación</label>
              <select v-model="form.clasificacion" class="form-input">
                <option value="NORMAL">Normal</option>
                <option value="CONFIDENCIAL">Confidencial</option>
                <option value="CON_VALORES">Con Valores</option>
              </select>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem;">
            <button type="button" @click="isModalOpen = false" class="btn btn-secondary">Cancelar</button>
            <button type="submit" class="btn btn-primary">Registrar Salida</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Subir Acuse -->
    <div v-if="isAcuseModalOpen" class="modal-overlay">
      <div class="glass-panel modal-content">
        <h2 style="margin-bottom: 1.5rem; color: #10b981;">Subir Acuse y Cerrar Expediente</h2>
        <p style="margin-bottom: 1.5rem; color: var(--text-muted);">
          Para enviar este despacho al Archivo Central, debes subir una copia escaneada (PDF) de la firma de recibido.
        </p>
        <form @submit.prevent="subirAcuseYCerrar">
          
          <div class="form-group">
            <label class="form-label">Archivo PDF del Acuse</label>
            <input type="file" @change="handleFileUpload" class="form-input" accept="application/pdf" required style="padding: 0.5rem;" />
          </div>
          
          <div class="form-group">
            <label class="form-label">Observaciones Finales (Opcional)</label>
            <textarea v-model="acuseObservaciones" class="form-input" rows="2" placeholder="Ej. Entregado en recepción principal..."></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem;">
            <button type="button" @click="isAcuseModalOpen = false" class="btn btn-secondary" :disabled="isUploading">Cancelar</button>
            <button type="submit" class="btn btn-primary" style="background-color: #10b981; border-color: #10b981;" :disabled="isUploading">
              {{ isUploading ? 'Subiendo...' : 'Subir y Archivar' }}
            </button>
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
            <th>Destinatario</th>
            <th>Estado</th>
            <th>Fecha Registro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody v-if="!loading">
          <tr v-for="item in despachos" :key="item.id">
            <td><strong>{{ item.folio }}</strong></td>
            <td>{{ item.asunto }}</td>
            <td>{{ item.destinatario }}</td>
            <td><span class="badge">{{ item.estado }}</span></td>
            <td>{{ new Date(item.fechaRecepcion).toLocaleDateString() }}</td>
            <td style="display: flex; gap: 0.5rem;">
              <button 
                v-if="item.estado === 'ACUSE_PENDIENTE' && ['ADMIN', 'OPERADOR_UCC'].includes(useAuthStore().userRole)"
                @click="abrirModalAcuse(item.id)" 
                class="btn btn-primary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; background-color: #10b981; border-color: #10b981; color: white;">
                Subir Acuse
              </button>
              <button 
                @click="imprimirAcuse(item, 'DESPACHO')"
                class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                Imprimir
              </button>
            </td>
          </tr>
          <tr v-if="despachos.length === 0">
            <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">
              No hay despachos registrados.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* Resusing standard styles from RecepcionView... */
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.page-header h1 { font-size: 1.875rem; margin-bottom: 0.25rem; }
.page-header p { color: var(--text-muted); }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 1rem; text-align: left; border-bottom: 1px solid var(--border-color); }
.data-table th { font-weight: 600; color: var(--text-muted); font-size: 0.875rem; text-transform: uppercase; }
.badge { background-color: #e0e7ff; color: var(--color-primary); padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(15, 23, 42, 0.5); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 1rem; }
.modal-content { width: 100%; max-width: 600px; padding: 2rem; }
</style>
