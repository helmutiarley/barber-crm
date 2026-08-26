<script setup lang="ts">
import { BToast } from '@/ui';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppLayout from '@/layouts/AppLayout.vue';
import GuestLayout from '@/layouts/GuestLayout.vue';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const auth = useAuthStore();

const layout = computed(() => {
  if (route.meta.guest || route.meta.public || !auth.isAuthenticated) {
    return 'guest';
  }

  return 'app';
});
</script>

<template>
  <GuestLayout v-if="layout === 'guest'" />
  <AppLayout v-else />
  <BToast />
</template>
