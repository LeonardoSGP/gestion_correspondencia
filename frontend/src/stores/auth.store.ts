import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any | null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null as string | null
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.rol?.nombre || ''
  },
  actions: {
    async login(email: string, password: string) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.post('/auth/login', { email, password });
        this.token = data.accessToken;
        this.user = data.user;
        localStorage.setItem('token', this.token as string);
        return true;
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Error al iniciar sesión';
        return false;
      } finally {
        this.loading = false;
      }
    },
    async logout() {
      try {
        if (this.token) await api.post('/auth/logout');
      } catch (e) {
        // ignore error
      } finally {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
      }
    },
    async fetchProfile() {
      if (!this.token) return;
      try {
        const { data } = await api.get('/auth/profile');
        this.user = data;
      } catch (err) {
        this.logout();
      }
    }
  }
});
