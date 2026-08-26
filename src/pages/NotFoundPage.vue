<script setup lang="ts">
import { BButton, BEmptyState } from '@barber/bcomponents';
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="not-found">
    <BEmptyState title="Página não encontrada" subtitle="O endereço não existe ou mudou de lugar.">
      <template #actions>
        <RouterLink to="/shops">
          <BButton color="primary">Ir para barbearias</BButton>
        </RouterLink>
      </template>
    </BEmptyState>
  </div>
</template>

<style scoped>
.not-found {
  display: grid;
  place-items: center;
  min-height: 200px;
}
</style>
