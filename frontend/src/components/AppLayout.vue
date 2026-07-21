<script setup lang="ts">
import { useAuthStore } from '../stores/auth.store';
import { useRouter } from 'vue-router';
import { LogOut } from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();

const logout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2 style="color: var(--color-primary);">SIGC</h2>
        <p style="font-size: 0.75rem; color: var(--text-muted);">{{ authStore.userRole }}</p>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-link">Inicio</router-link>
        
        <!-- Recepción y Despacho -->
        <div class="nav-section">Operación</div>
        <router-link to="/recepcion" class="nav-link">Recepción</router-link>
        <router-link to="/distribucion" class="nav-link">Distribución</router-link>
        <router-link to="/despacho" class="nav-link">Despacho</router-link>
        <router-link to="/enrutamiento" class="nav-link">Enrutamiento</router-link>
        
        <!-- Archivo Central -->
        <div class="nav-section">Gestión Documental</div>
        <router-link to="/archivo" class="nav-link">Archivo y Acuses</router-link>
        
        <!-- Administración -->
        <div v-if="authStore.userRole === 'ADMIN'" class="nav-section">Administración</div>
        <router-link v-if="authStore.userRole === 'ADMIN'" to="/usuarios" class="nav-link">Usuarios y Roles</router-link>
      </nav>
      
      <div class="sidebar-footer">
        <button @click="logout" class="btn btn-secondary" style="width: 100%;">
          <LogOut size="16" /> Salir
        </button>
      </div>
    </aside>

    <main class="main-content">
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
  padding: 2rem;
  overflow-y: auto;
}
</style>
