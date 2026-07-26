<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth.store';
import api from '../services/api';
import { Users, FileText, Send, Archive, Activity } from 'lucide-vue-next';

const authStore = useAuthStore();
const stats = ref({
  entradas: 0,
  salidas: 0,
  pendientes: 0,
  usuarios: 0
});

const loadStats = async () => {
  try {
    const [resRecepcion, resDespacho, resDistribucion, resUsuarios] = await Promise.all([
      api.get('/recepcion'),
      api.get('/despacho'),
      api.get('/distribucion'),
      api.get('/usuarios')
    ]);
    
    stats.value = {
      entradas: resRecepcion.data?.length || 0,
      salidas: resDespacho.data?.length || 0,
      pendientes: (resDistribucion.data?.data || []).filter((d: any) => d.estado !== 'ENTREGADA').length || 0,
      usuarios: resUsuarios.data?.usuarios?.length || resUsuarios.data?.data?.length || resUsuarios.data?.length || 0
    };
  } catch (error) {
    console.error('Error cargando estadísticas', error);
    stats.value = { entradas: 0, salidas: 0, pendientes: 0, usuarios: 0 };
  }
};

onMounted(() => {
  loadStats();
});
</script>

<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1>Panel de Control</h1>
      <p>Bienvenido al Sistema de Gestión de Correspondencia, {{ authStore.user?.nombre }} ({{ authStore.userRole }})</p>
    </div>

  <div class="stats-grid">
    <div class="stat-card glass-panel">
      <div class="stat-icon" style="background-color: #eff6ff; color: var(--color-primary);">
        <FileText :size="24" />
      </div>
      <div class="stat-details">
        <h3>Entradas Registradas</h3>
        <p class="stat-value">{{ stats.entradas }}</p>
      </div>
    </div>

    <div class="stat-card glass-panel">
      <div class="stat-icon" style="background-color: #f0fdf4; color: var(--color-success);">
        <Send :size="24" />
      </div>
      <div class="stat-details">
        <h3>Salidas Despachadas</h3>
        <p class="stat-value">{{ stats.salidas }}</p>
      </div>
    </div>

    <div class="stat-card glass-panel">
      <div class="stat-icon" style="background-color: #fffbeb; color: var(--color-warning);">
        <Activity :size="24" />
      </div>
      <div class="stat-details">
        <h3>Trámites Pendientes</h3>
        <p class="stat-value">{{ stats.pendientes }}</p>
      </div>
    </div>

    <div class="stat-card glass-panel" v-if="authStore.userRole === 'ADMIN'">
      <div class="stat-icon" style="background-color: #f5f3ff; color: #8b5cf6;">
        <Users :size="24" />
      </div>
      <div class="stat-details">
        <h3>Usuarios Activos</h3>
        <p class="stat-value">{{ stats.usuarios }}</p>
      </div>
    </div>
  </div>

  </div>
</template>

<style scoped>
.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 1.875rem;
  margin-bottom: 0.5rem;
}

.dashboard-header p {
  color: var(--text-muted);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-details h3 {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-main);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.activity-dot {
  width: 12px;
  height: 12px;
  background-color: var(--color-primary);
  border-radius: 50%;
  margin-top: 0.35rem;
}

.activity-time {
  font-size: 0.75rem;
  color: var(--text-muted);
}
</style>
