<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../services/api';
import { Plus, Edit2, Trash2 } from 'lucide-vue-next';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  activo: boolean;
  rol: { nombre: string };
  area: { nombre: string } | null;
}

const usuarios = ref<Usuario[]>([]);
const loading = ref(true);

const fetchUsuarios = async () => {
  try {
    const { data } = await api.get('/usuarios');
    usuarios.value = data.data; // assuming paginated response
  } catch (error) {
    console.error('Error cargando usuarios', error);
  } finally {
    loading.value = false;
  }
};

const deshabilitarUsuario = async (id: number) => {
  if(confirm('¿Seguro que deseas deshabilitar este usuario?')) {
    await api.patch(`/usuarios/${id}/deshabilitar`);
    fetchUsuarios();
  }
};

onMounted(() => {
  fetchUsuarios();
});
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1>Gestión de Usuarios</h1>
        <p>Administra los accesos y roles del sistema.</p>
      </div>
      <button class="btn btn-primary">
        <Plus size="16" /> Nuevo Usuario
      </button>
    </div>

    <div class="glass-panel" style="padding: 1.5rem; overflow-x: auto;">
      <table class="data-table" v-if="!loading">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Área Administrativa</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in usuarios" :key="user.id">
            <td>{{ user.nombre }}</td>
            <td>{{ user.email }}</td>
            <td><span class="badge">{{ user.rol?.nombre }}</span></td>
            <td>{{ user.area?.nombre || 'N/A' }}</td>
            <td>
              <span :class="['status-dot', user.activo ? 'active' : 'inactive']"></span>
              {{ user.activo ? 'Activo' : 'Inactivo' }}
            </td>
            <td>
              <div class="actions">
                <button class="btn-icon" title="Editar"><Edit2 size="16" /></button>
                <button @click="deshabilitarUsuario(user.id)" class="btn-icon text-danger" title="Deshabilitar"><Trash2 size="16" /></button>
              </div>
            </td>
          </tr>
          <tr v-if="usuarios.length === 0">
            <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">
              No hay usuarios registrados.
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else style="text-align: center; padding: 2rem;">
        Cargando usuarios...
      </div>
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
  letter-spacing: 0.05em;
}

.badge {
  background-color: #e0e7ff;
  color: var(--color-primary);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.status-dot.active {
  background-color: var(--color-success);
}

.status-dot.inactive {
  background-color: var(--color-danger);
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  padding: 0.25rem;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.btn-icon:hover {
  background-color: var(--bg-surface-hover);
  color: var(--text-main);
}

.btn-icon.text-danger:hover {
  color: var(--color-danger);
  background-color: #fee2e2;
}
</style>
