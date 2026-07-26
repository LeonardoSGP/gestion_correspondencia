<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const email = ref('');
const message = ref('');
const error = ref('');
const resetLink = ref('');
const loading = ref(false);

const handleRecover = async () => {
  loading.value = true;
  message.value = '';
  error.value = '';
  resetLink.value = '';
  try {
    const response = await api.post('/auth/recuperar-contrasena', { email: email.value });
    message.value = 'Solicitud procesada correctamente.';
    resetLink.value = response.data.resetLink || '';
    email.value = '';
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al intentar recuperar la contraseña.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-container">
    <div class="glass-panel login-card">
      <div class="login-header">
        <h1 style="text-align: center; margin-bottom: 0.5rem; color: var(--color-primary);">Recuperar Contraseña</h1>
        <p style="text-align: center; color: var(--text-muted); margin-bottom: 2rem;">Ingresa tu correo para recibir instrucciones (HU-02)</p>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      <div v-if="message" class="success-message">
        {{ message }}
      </div>
      <div v-if="resetLink" class="info-message" style="background: #e0f2fe; padding: 1.5rem; border-radius: var(--radius-md); margin-bottom: 1rem; font-size: 0.875rem; text-align: center; border: 1px solid #bae6fd;">
        <p style="color: #0369a1; font-weight: 700; margin-bottom: 0.5rem; font-size: 1rem;">[Buzón de Correo Simulado]</p>
        <p style="color: #0284c7; margin-bottom: 1rem;">El sistema generó el siguiente enlace único y seguro para restablecer tu contraseña. Haz clic en el botón para continuar con el proceso:</p>
        <a :href="resetLink" class="btn btn-primary" style="display: inline-block; text-decoration: none; padding: 0.5rem 1rem; border-radius: var(--radius-md);">Restablecer mi contraseña</a>
      </div>

      <form @submit.prevent="handleRecover">
        <div class="form-group">
          <label class="form-label" for="email">Correo Electrónico</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="form-input"
            required
            placeholder="usuario@institucion.edu"
          />
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          style="width: 100%; margin-top: 1rem;"
          :disabled="loading"
        >
          {{ loading ? 'Enviando...' : 'Enviar Instrucciones' }}
        </button>
      </form>

      <div style="text-align: center; margin-top: 1.5rem;">
        <router-link to="/login" style="font-size: 0.875rem;">Volver al inicio de sesión</router-link>
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
  padding: 0.75rem;
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
  font-size: 0.875rem;
  text-align: center;
}
</style>
