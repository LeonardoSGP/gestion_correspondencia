<script setup lang="ts">
import Swal from 'sweetalert2';
import { ref, onMounted } from 'vue';
import api from '../services/api';
import { Plus, Edit2, Trash2 } from 'lucide-vue-next';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  activo: boolean;
  rol: { id: number; nombre: string };
  area: { id: number; nombre: string } | null;
}

const usuarios = ref<Usuario[]>([]);
const roles = ref<{id: number; nombre: string}[]>([]);
const areas = ref<{id: number; nombre: string}[]>([]);
const loading = ref(true);

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref<number | null>(null);
const formLoading = ref(false);
const newUser = ref({ nombre: '', email: '', password: '', rolId: 1, areaId: 1, activo: true });

const fetchUsuarios = async () => {
  try {
    const { data } = await api.get('/usuarios');
    usuarios.value = data.usuarios || data;
  } catch (error) {
    console.error('Error cargando usuarios', error);
  } finally {
    loading.value = false;
  }
};

const fetchDropdowns = async () => {
  try {
    const resRoles = await api.get('/usuarios/roles');
    roles.value = resRoles.data.roles || resRoles.data;
    
    const resAreas = await api.get('/areas');
    areas.value = resAreas.data.data || resAreas.data;
  } catch (error) {
    console.error('Error cargando catálogos', error);
  }
};

const abrirModalNuevo = () => {
  isEditing.value = false;
  editingId.value = null;
  newUser.value = { nombre: '', email: '', password: '', rolId: 1, areaId: 1, activo: true };
  showModal.value = true;
};

const abrirModalEditar = (user: Usuario) => {
  isEditing.value = true;
  editingId.value = user.id;
  newUser.value = {
    nombre: user.nombre,
    email: user.email,
    password: '', // Leave empty for no change
    rolId: (user.rol as any)?.id || 1,
    areaId: user.area?.id || 1,
    activo: user.activo
  };
  showModal.value = true;
};

const guardarUsuario = async () => {
  formLoading.value = true;
  try {
    const payload: any = {
      nombre: newUser.value.nombre,
      email: newUser.value.email,
      rolId: parseInt(newUser.value.rolId as unknown as string),
      areaId: parseInt(newUser.value.areaId as unknown as string),
      activo: newUser.value.activo
    };
    
    if (!isEditing.value) {
      payload.password = newUser.value.password;
      await api.post('/usuarios', payload);
    } else {
      if (newUser.value.password) {
        payload.password = newUser.value.password;
      }
      await api.put(`/usuarios/${editingId.value}`, payload);
    }
    
    showModal.value = false;
    await fetchUsuarios();
    Swal.fire({ title: 'Éxito', text: 'Usuario guardado correctamente', icon: 'success' });
  } catch (error) {
    console.error('Error al guardar usuario', error);
    Swal.fire({ title: 'Error', text: 'Error al guardar el usuario. Revisa la consola.', icon: 'error' });
  } finally {
    formLoading.value = false;
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
  fetchDropdowns();
});
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1>Gestión de Usuarios</h1>
        <p>Administra los accesos y roles del sistema.</p>
      </div>
      <button class="btn btn-primary" @click="abrirModalNuevo">
        <Plus :size="16" /> Nuevo Usuario
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
                <button @click="abrirModalEditar(user)" class="btn-icon" title="Editar"><Edit2 :size="16" /></button>
                <button @click="deshabilitarUsuario(user.id)" class="btn-icon text-danger" title="Deshabilitar"><Trash2 :size="16" /></button>
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

    <!-- Modal Nuevo/Editar Usuario -->
    <div v-if="showModal" class="modal-overlay">
      <div class="glass-panel modal-content">
        <h2>{{ isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario' }}</h2>
        <form @submit.prevent="guardarUsuario">
          <div class="form-group">
            <label class="form-label">Nombre Completo</label>
            <input v-model="newUser.nombre" type="text" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">Correo Electrónico</label>
            <input v-model="newUser.email" type="email" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">Contraseña <span v-if="isEditing" style="font-size: 0.8em; font-weight: normal; color: gray;">(Opcional: Dejar en blanco para mantener actual)</span></label>
            <input v-model="newUser.password" type="password" class="form-input" :required="!isEditing" minlength="6" />
          </div>
          <div class="form-group" v-if="isEditing">
            <label class="form-label">Estado</label>
            <select v-model="newUser.activo" class="form-input" required>
              <option :value="true">Activo</option>
              <option :value="false">Inactivo</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Rol</label>
            <select v-model="newUser.rolId" class="form-input" required>
              <option v-for="rol in roles" :key="rol.id" :value="rol.id">{{ rol.nombre }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Área Administrativa</label>
            <select v-model="newUser.areaId" class="form-input" required>
              <option v-for="area in areas" :key="area.id" :value="area.id">{{ area.nombre }}</option>
            </select>
          </div>
          <div style="display: flex; gap: 1rem; margin-top: 1.5rem; justify-content: flex-end;">
            <button type="button" class="btn" @click="showModal = false" style="background: transparent; color: var(--text-muted);">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="formLoading">{{ formLoading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Usuario') }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  width: 100%;
  max-width: 500px;
  padding: 2rem;
  background-color: var(--bg-surface);
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
.modal-content h2 {
  margin-bottom: 1.5rem;
  color: var(--color-primary);
}
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
