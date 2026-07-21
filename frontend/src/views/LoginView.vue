<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');

const handleLogin = async () => {
  const success = await authStore.login(email.value, password.value);
  if (success) {
    router.push('/dashboard');
  }
};
</script>

<template>
  <div class="login-container">
    <div class="glass-panel login-card">
      <div class="login-header">
        <h1 style="text-align: center; margin-bottom: 0.5rem; color: var(--color-primary);">SIGC</h1>
        <p style="text-align: center; color: var(--text-muted); margin-bottom: 2rem;">Sistema Institucional de Gestión de Correspondencia</p>
      </div>

      <div v-if="authStore.error" class="error-message">
        {{ authStore.error }}
      </div>

      <form @submit.prevent="handleLogin">
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

        <div class="form-group">
          <label class="form-label" for="password">Contraseña</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-input"
            required
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          style="width: 100%; margin-top: 1rem;"
          :disabled="authStore.loading"
        >
          {{ authStore.loading ? 'Iniciando...' : 'Iniciar Sesión' }}
        </button>
      </form>

      <div style="text-align: center; margin-top: 1.5rem;">
        <router-link to="/recuperar" style="font-size: 0.875rem;">¿Olvidaste tu contraseña?</router-link>
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
</style>
