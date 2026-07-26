<script setup lang="ts">
import Swal from 'sweetalert2';
import { ref, onMounted, computed } from 'vue';
import api from '../services/api';
import { useAuthStore } from '../stores/auth.store';

const authStore = useAuthStore();
const rutas = ref<any[]>([]);
const despachos = ref<any[]>([]);
const metodosEnvio = ref<any[]>([]);
const mensajeros = ref<any[]>([]);
const loading = ref(true);

// Modal state
const showModal = ref(false);
const formLoading = ref(false);
const form = ref({
  correspondenciaId: '',
  metodoEnvioId: '',
  mensajeroId: '',
  alcance: 'LOCAL',
  direccionDestino: '',
  numeroGuia: '',
  observaciones: ''
});

const loadData = async () => {
  try {
    const promises: Promise<any>[] = [
      api.get('/enrutamiento')
    ];
    
    const canCreate = authStore.userRole === 'ADMIN' || authStore.userRole === 'OPERADOR_UCC';
    
    if (canCreate) {
      promises.push(api.get('/enrutamiento/metodos-envio'));
      promises.push(api.get('/usuarios'));
      promises.push(api.get('/despacho'));
    }

    const results = await Promise.all(promises);
    
    rutas.value = results[0].data;
    
    if (canCreate) {
      metodosEnvio.value = results[1].data;
      
      const resUsuarios = results[2];
      const allUsers = resUsuarios.data?.usuarios || resUsuarios.data?.data || resUsuarios.data || [];
      mensajeros.value = allUsers.filter((u: any) => u.activo && u.rol?.nombre === 'MENSAJERO');
      
      const resDespachos = results[3];
      despachos.value = resDespachos.data?.data || resDespachos.data || [];
    }
    
  } catch (error) {
    console.error('Error fetching enrutamiento data', error);
  } finally {
    loading.value = false;
  }
};

const abrirModal = () => {
  form.value = {
    correspondenciaId: '',
    metodoEnvioId: '',
    mensajeroId: '',
    alcance: 'LOCAL',
    direccionDestino: '',
    numeroGuia: '',
    observaciones: ''
  };
  showModal.value = true;
};

const asignarRuta = async () => {
  formLoading.value = true;
  try {
    const payload: any = {
      correspondenciaId: parseInt(form.value.correspondenciaId),
      metodoEnvioId: parseInt(form.value.metodoEnvioId),
      alcance: form.value.alcance,
      direccionDestino: form.value.direccionDestino || undefined,
      observaciones: form.value.observaciones || undefined
    };

    if (form.value.mensajeroId) {
      payload.mensajeroId = parseInt(form.value.mensajeroId);
    }
    if (form.value.numeroGuia) {
      payload.numeroGuia = form.value.numeroGuia;
    }

    await api.post('/enrutamiento', payload);
    showModal.value = false;
    loadData();
    Swal.fire({ title: 'Éxito', text: 'Ruta asignada exitosamente', icon: 'success' });
  } catch (error: any) {
    console.error('Error al asignar ruta', error);
    Swal.fire({ title: 'Error', text: `Error: ${error.response?.data?.message || error.message}`, icon: 'error' });
  } finally {
    formLoading.value = false;
  }
};

const marcarEntregado = async (id: number) => {
  const result = await Swal.fire({
    title: '¿Marcar como Entregada?',
    text: '¿Marcar ruta externa como ENTREGADA?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, entregada',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      await api.patch(`/enrutamiento/${id}/entregar`, { observaciones: 'Entregado conforme' });
      loadData();
      Swal.fire({ title: 'Éxito', text: 'Ruta marcada como entregada', icon: 'success' });
    } catch (error: any) {
      console.error('Error al confirmar', error);
      Swal.fire({ title: 'Error', text: `No se pudo confirmar: ${error.response?.data?.message || error.message}`, icon: 'error' });
    }
  }
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div>
    <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <div>
        <h1 style="font-size: 1.875rem; margin-bottom: 0.25rem;">Enrutamiento (HU-09)</h1>
        <p style="color: var(--text-muted);">Asignación de rutas y mensajería externa.</p>
      </div>
      <button v-if="authStore.userRole === 'ADMIN' || authStore.userRole === 'OPERADOR_UCC'" class="btn btn-primary" @click="abrirModal">
        Asignar Nueva Ruta
      </button>
    </div>

    <div class="glass-panel" style="padding: 1.5rem; overflow-x: auto;">
      <table class="data-table">
        <thead>
          <tr>
            <th>Folio Despacho</th>
            <th>Método / Guía</th>
            <th>Mensajero Asignado</th>
            <th>Alcance</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody v-if="!loading">
          <tr v-for="ruta in rutas" :key="ruta.id">
            <td><strong>{{ ruta.correspondencia?.folio }}</strong></td>
            <td>
              {{ ruta.metodoEnvio?.nombre }}
              <div v-if="ruta.numeroGuia" style="font-size: 0.8rem; color: var(--text-muted);">Guía: {{ ruta.numeroGuia }}</div>
            </td>
            <td>{{ ruta.mensajero?.nombre || 'N/A' }}</td>
            <td>{{ ruta.alcance }}</td>
            <td><span class="badge">{{ ruta.estado }}</span></td>
            <td>
              <button 
                v-if="(ruta.estado === 'ASIGNADA' || ruta.estado === 'EN_TRANSITO') && (authStore.userRole !== 'MENSAJERO' || authStore.user?.id === ruta.mensajeroId)"
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

    <!-- Modal Asignar Ruta -->
    <div v-if="showModal" class="modal-overlay">
      <div class="glass-panel modal-content">
        <h2 style="margin-bottom: 1.5rem; color: var(--color-primary);">Asignar Nueva Ruta Externa</h2>
        <form @submit.prevent="asignarRuta">
          
          <div class="form-group">
            <label class="form-label">Correspondencia (Despacho)</label>
            <select v-model="form.correspondenciaId" class="form-input" required>
              <option value="" disabled>Seleccione folio de salida...</option>
              <option v-for="desp in despachos" :key="desp.id" :value="desp.id">
                {{ desp.folio }} - {{ desp.destinatario }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Método de Envío</label>
            <select v-model="form.metodoEnvioId" class="form-input" required>
              <option value="" disabled>Seleccione método...</option>
              <option v-for="metodo in metodosEnvio" :key="metodo.id" :value="metodo.id">
                {{ metodo.nombre }} ({{ metodo.tipo }})
              </option>
            </select>
          </div>

          <!-- Si eligen mensajería interna, mostrar lista de mensajeros -->
          <div class="form-group">
            <label class="form-label">Mensajero Asignado (Opcional si es paquete externo)</label>
            <select v-model="form.mensajeroId" class="form-input">
              <option value="">-- Ninguno --</option>
              <option v-for="msj in mensajeros" :key="msj.id" :value="msj.id">
                {{ msj.nombre }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Número de Guía (Solo paquetería externa)</label>
            <input v-model="form.numeroGuia" type="text" class="form-input" placeholder="Ej. DHL-123456789" />
          </div>

          <div class="form-group">
            <label class="form-label">Alcance</label>
            <select v-model="form.alcance" class="form-input" required>
              <option value="LOCAL">Local (Misma Ciudad)</option>
              <option value="NACIONAL">Nacional (Otro Estado)</option>
              <option value="INTERNACIONAL">Internacional</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Observaciones</label>
            <textarea v-model="form.observaciones" class="form-input" rows="2" placeholder="Detalles extra de la ruta..."></textarea>
          </div>

          <div style="display: flex; gap: 1rem; margin-top: 1.5rem; justify-content: flex-end;">
            <button type="button" class="btn" @click="showModal = false" style="background: transparent; color: var(--text-muted);">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="formLoading">
              {{ formLoading ? 'Guardando...' : 'Crear Ruta' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
<style scoped>
.page-header h1 { font-size: 1.875rem; margin-bottom: 0.25rem; }
.page-header p { color: var(--text-muted); }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 1rem; text-align: left; border-bottom: 1px solid var(--border-color); }
.data-table th { font-weight: 600; color: var(--text-muted); font-size: 0.875rem; text-transform: uppercase; }
.badge { background-color: #fce7f3; color: #be185d; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }

.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal-content {
  width: 100%;
  max-width: 600px;
  padding: 2rem;
  max-height: 90vh;
  overflow-y: auto;
  background-color: var(--bg-surface);
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>
