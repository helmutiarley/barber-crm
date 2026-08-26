import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import * as authApi from '@/api/auth';
import type { UserDto } from '@/api/types';

const REFRESH_KEY = 'barber-crm.refreshToken';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserDto | null>(null);
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const bootstrapped = ref(false);

  const isAuthenticated = computed(() => user.value !== null && accessToken.value !== null);

  function readStoredRefresh(): string | null {
    try {
      return localStorage.getItem(REFRESH_KEY);
    } catch {
      return null;
    }
  }

  function persistRefresh(token: string | null): void {
    try {
      if (token) {
        localStorage.setItem(REFRESH_KEY, token);
      } else {
        localStorage.removeItem(REFRESH_KEY);
      }
    } catch {}
  }

  function setTokens(nextAccess: string, nextRefresh: string): void {
    accessToken.value = nextAccess;
    refreshToken.value = nextRefresh;
    persistRefresh(nextRefresh);
  }

  function setSession(result: { accessToken: string; refreshToken: string; user: UserDto }): void {
    setTokens(result.accessToken, result.refreshToken);
    user.value = result.user;
  }

  function clearSession(): void {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    persistRefresh(null);
  }

  async function login(email: string, password: string): Promise<void> {
    const result = await authApi.login(email.trim().toLowerCase(), password);

    if (result.user.role !== 'SUPER_ADMIN') {
      throw new Error('Esta conta não tem acesso ao painel da plataforma.');
    }

    setSession(result);
  }

  async function logout(): Promise<void> {
    const token = refreshToken.value;
    clearSession();
    if (token) {
      try {
        await authApi.logout(token);
      } catch {}
    }
  }

  async function bootstrap(): Promise<void> {
    if (bootstrapped.value) {
      return;
    }

    const stored = readStoredRefresh();
    if (!stored) {
      bootstrapped.value = true;
      return;
    }

    refreshToken.value = stored;

    try {
      const result = await authApi.refresh(stored);
      if (result.user.role !== 'SUPER_ADMIN') {
        clearSession();
      } else {
        setSession(result);
      }
    } catch {
      clearSession();
    } finally {
      bootstrapped.value = true;
    }
  }

  return {
    user,
    accessToken,
    refreshToken,
    bootstrapped,
    isAuthenticated,
    setTokens,
    setSession,
    clearSession,
    login,
    logout,
    bootstrap,
    getAccessToken: () => accessToken.value,
    getRefreshToken: () => refreshToken.value ?? readStoredRefresh(),
  };
});
