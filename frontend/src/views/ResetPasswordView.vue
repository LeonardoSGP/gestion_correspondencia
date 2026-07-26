<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';

const route = useRoute();
const router = useRouter();

const token = ref('');
const password = ref('');
const confirmPassword = ref('');
const message = ref('');
const error = ref('');
const loading = ref(false);
const success = ref(false);

onMounted(() => {
  if (route.query.token) {
    token.value = route.query.token as string;
  } else {
    error.value = 'Enlace inválido o sin token de seguridad.';
  }
});

const handleReset = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden.';
    return;
  }
  
  if (password.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres.';
    return;
  }

  loading.value = true;
  message.value = '';
  error.value = '';

  try {
    await api.post('/auth/restablecer-contrasena', { 
      token: token.value, 
      nuevaContrasena: password.value 
    });
    
    success.value = true;
    message.value = '¡Tu contraseña ha sido restablecida exitosamente!';
    
    setTimeout(() => {
      router.push('/login');
    }, 3000);
    
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al intentar restablecer la contraseña. El enlace podría haber expirado.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-container">
    <div class="glass-panel login-card">
      <div class="login-header">
        <h1 style="text-align: center; margin-bottom: 0.5rem; color: var(--color-primary);">Nueva Contraseña</h1>
        <p style="text-align: center; color: var(--text-muted); margin-bottom: 2rem;">Ingresa tu nueva contraseña para acceder al sistema</p>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div v-if="success" class="success-message">
        <p style="margin-bottom: 0.5rem; font-weight: bold;">{{ message }}</p>
        <p style="font-size: 0.8rem;">Redirigiendo al inicio de sesión...</p>
      </div>

      <form v-if="!success && token" @submit.prevent="handleReset">
        <div class="form-group">
          <label class="form-label" for="password">Nueva Contraseña</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-input"
            required
            placeholder="••••••••"
            minlength="6"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="confirmPassword">Confirmar Contraseña</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            class="form-input"
            required
            placeholder="••••••••"
            minlength="6"
          />
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          style="width: 100%; margin-top: 1rem;"
          :disabled="loading"
        >
          {{ loading ? 'Guardando...' : 'Guardar Contraseña' }}
        </button>
      </form>

      <div style="text-align: center; margin-top: 1.5rem;" v-if="!success">
        <router-link to="/login" style="font-size: 0.875rem;">Cancelar y volver al inicio</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-main) 0%, #e2e8f0 100%);
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2.5rem;
  background: var(--bg-surface);
}

.error-message {
  background-color: #fee2e2;
  color: var(--color-danger);
  padding: 0.75rem;
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
  font-size: 0.875rem;
  text-align: center;
}

.success-message {
  background-color: #dcfce7;
  color: #166534;
  padding: 1rem;
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
  text-align: center;
}
</style>
