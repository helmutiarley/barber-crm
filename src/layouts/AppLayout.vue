<script setup lang="ts">
import { BButton, BIcon, BText } from '@barber/bcomponents';
import { RouterLink, RouterView, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();

async function onLogout(): Promise<void> {
  await auth.logout();
  await router.replace('/login');
}
</script>

<template>
  <div class="shell">
    <header class="shell__header">
      <RouterLink to="/shops" class="shell__brand">
        <BIcon name="ic-shop-24" dimensions="24px" />
        <BText as="span" variant="heading-3">Barber CRM</BText>
      </RouterLink>

      <div class="shell__user">
        <BText as="span" variant="body-3" color="b-fg-neutral-secondary">
          {{ auth.user?.email }}
        </BText>
        <BButton size="small" variant="outline" color="neutral" @click="onLogout">Sair</BButton>
      </div>
    </header>

    <main class="shell__content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.shell {
  display: flex;
  flex-direction: column;
  height: 100dvh;
}

.shell__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--b-spacing-sm);
  height: var(--header-height);
  padding: 0 var(--b-spacing-md);
  border-bottom: 1px solid var(--b-stroke-default);
  background: var(--b-bg-neutral-default);
  flex-shrink: 0;
}

.shell__brand {
  display: flex;
  align-items: center;
  gap: var(--b-spacing-2xs);
  color: inherit;
  text-decoration: none;
  letter-spacing: -0.02em;
}

.shell__user {
  display: flex;
  align-items: center;
  gap: var(--b-spacing-xs);
}

.shell__content {
  flex: 1;
  overflow-y: auto;
  padding: var(--b-spacing-md);
  background: var(--b-bg-neutral-secondary);
}
</style>
