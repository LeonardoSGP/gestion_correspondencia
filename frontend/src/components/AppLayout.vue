<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth.store';
import { useRouter } from 'vue-router';
import { LogOut, Search } from 'lucide-vue-next';
import Swal from 'sweetalert2';
import api from '../services/api';

const authStore = useAuthStore();
const router = useRouter();
const searchQuery = ref('');

const logout = async () => {
  await authStore.logout();
  router.push('/login');
};

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return;
  try {
    const response = await api.get(`/archivo/buscar?folio=${searchQuery.value.trim()}`);
    const results = response.data;
    
    if (results.length === 0) {
      Swal.fire('No encontrado', 'No se encontró correspondencia con ese folio.', 'info');
      return;
    }
    
    const doc = results[0];
    
    // Fetch historial
    const histResponse = await api.get(`/archivo/${doc.id}/historial`);
    const historial = histResponse.data;
    
    let timelineHtml = '<div style="text-align: left; font-size: 0.9em; max-height: 300px; overflow-y: auto;">';
    historial.forEach((h: any) => {
      const date = new Date(h.createdAt).toLocaleString();
      timelineHtml += `
        <div style="margin-bottom: 10px; border-left: 3px solid #0056b3; padding-left: 10px;">
          <strong>${date}</strong><br>
          <span style="color: #666;">${h.accion} (${h.estadoNuevo})</span><br>
          <em>${h.detalle}</em>
        </div>
      `;
    });
    timelineHtml += '</div>';

    Swal.fire({
      title: `Folio: ${doc.folio}`,
      html: `
        <p><strong>Asunto:</strong> ${doc.asunto}</p>
        <p><strong>Estado Actual:</strong> ${doc.estado}</p>
        <hr>
        <h4 style="text-align: left; margin-bottom: 10px;">Trazabilidad:</h4>
        ${timelineHtml}
      `,
      width: '600px',
      confirmButtonText: 'Cerrar'
    });
    
    searchQuery.value = '';
  } catch (error) {
    Swal.fire('Error', 'No se pudo realizar la búsqueda.', 'error');
  }
};
</script>

<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2 style="color: var(--color-primary);">SGC</h2>
        <p style="font-size: 0.75rem; color: var(--text-muted);">{{ authStore.userRole }}</p>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-link">Inicio</router-link>
        
        <!-- Recepción y Despacho -->
        <div class="nav-section">Operación</div>
        <router-link to="/recepcion" class="nav-link">1. Recepción (Entrada Externa)</router-link>
        <router-link to="/distribucion" class="nav-link">2. Distribución (Interna)</router-link>
        <router-link to="/despacho" class="nav-link">3. Despacho (Salida Externa)</router-link>
        <router-link to="/enrutamiento" class="nav-link">4. Enrutamiento (Rutas Externas)</router-link>
        
        <!-- Archivo Central -->
        <div class="nav-section">Gestión Documental</div>
        <router-link to="/archivo" class="nav-link">Archivo y Acuses</router-link>
        
        <!-- Administración -->
        <div v-if="authStore.userRole === 'ADMIN'" class="nav-section">Administración</div>
        <router-link v-if="authStore.userRole === 'ADMIN'" to="/usuarios" class="nav-link">Usuarios y Roles</router-link>
      </nav>
      
      <div class="sidebar-footer">
        <button @click="logout" class="btn btn-secondary" style="width: 100%;">
            <LogOut :size="18" style="margin-right: 0.5rem;" /> Cerrar Sesión    </button>
      </div>
    </aside>

    <main class="main-content">
      <header class="topbar">
        <div class="search-container">
          <Search class="search-icon" :size="18" />
          <input 
            type="text" 
            v-model="searchQuery" 
            @keyup.enter="handleSearch"
            placeholder="Buscar por folio y presiona Enter..." 
            class="search-input"
          />
        </div>
      </header>
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-main);
}

.sidebar {
  width: 260px;
  background-color: var(--bg-surface);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
}

.nav-section {
  padding: 1rem 1.5rem 0.5rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  font-weight: 600;
}

.nav-link {
  display: block;
  padding: 0.75rem 1.5rem;
  color: var(--text-main);
  transition: all 0.2s;
  font-size: 0.875rem;
}

.nav-link:hover, .nav-link.router-link-active {
  background-color: var(--bg-surface-hover);
  color: var(--color-primary);
  border-right: 3px solid var(--color-primary);
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.topbar {
  padding: 1rem 2rem;
  background-color: var(--bg-surface);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
}

.search-container {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.search-input {
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.875rem;
  background-color: var(--bg-main);
  color: var(--text-main);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0,86,179, 0.1);
}

.main-content > div {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}
</style>
