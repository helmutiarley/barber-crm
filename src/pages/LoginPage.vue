<script setup lang="ts">
import { BButton, BInput, useBToast } from '@barber/bcomponents';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ApiError, messageForApiError } from '@/lib/errors';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const toast = useBToast();

const email = ref('');
const password = ref('');
const pending = ref(false);
const formError = ref<string | null>(null);

async function onSubmit(): Promise<void> {
  formError.value = null;
  pending.value = true;
  try {
    await auth.login(email.value, password.value);
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null;
    const target =
      redirect && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/shops';
    await router.replace(target);
  } catch (error) {
    const message =
      error instanceof ApiError
        ? messageForApiError(error)
        : error instanceof Error
          ? error.message
          : 'Não foi possível entrar.';
    formError.value = message;
    toast.add({ message, severity: 'failure' });
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <form class="login" @submit.prevent="onSubmit">
    <h1 class="login__title">Entrar</h1>
    <p class="login__hint">Acesso restrito à administração da plataforma.</p>

    <BInput
      v-model="email"
      type="email"
      label="Email"
      placeholder="voce@email.com"
      autocomplete="username"
      label-prepend-asterisk
    />
    <BInput
      v-model="password"
      type="password"
      label="Senha"
      placeholder="••••••••"
      autocomplete="current-password"
      label-prepend-asterisk
    />

    <p v-if="formError" class="login__error" role="alert">{{ formError }}</p>

    <BButton type="submit" color="primary" full-width :is-loading="pending" :is-disabled="pending">
      Entrar
    </BButton>
  </form>
</template>

<style scoped>
.login {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.login__title {
  font-size: 1.25rem;
  font-weight: 650;
  margin-bottom: 0.25rem;
}

.login__hint {
  font-size: 0.875rem;
  color: var(--b-fg-neutral-secondary, #666);
  margin-bottom: 1rem;
}

.login__error {
  color: #b91c1c;
  font-size: 0.875rem;
  margin: 0.5rem 0 0.75rem;
}
</style>
