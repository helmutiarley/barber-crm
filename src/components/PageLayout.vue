<script setup lang="ts">
import { BCircleLoader, BText } from '@barber/bcomponents';
import { useSlots } from 'vue';

withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
    isLoading?: boolean;
  }>(),
  { title: undefined, subtitle: undefined, isLoading: false },
);

const slots = useSlots();
</script>

<template>
  <div class="page-layout">
    <div v-if="isLoading" class="page-layout__loader">
      <BCircleLoader />
    </div>

    <template v-else>
      <header
        v-if="title || subtitle || slots['header-actions']"
        class="page-layout__header"
        :class="{ 'page-layout__header--has-actions': !!slots['header-actions'] }"
      >
        <div v-if="title" class="page-layout__header-title">
          <BText as="h1" variant="heading-1">{{ title }}</BText>
        </div>

        <BText
          v-if="subtitle"
          as="p"
          variant="body-2"
          color="b-fg-neutral-secondary"
          class="page-layout__header-subtitle"
        >
          {{ subtitle }}
        </BText>

        <div v-if="slots['header-actions']" class="page-layout__header-actions">
          <slot name="header-actions" />
        </div>
      </header>

      <slot />
    </template>
  </div>
</template>

<style scoped>
.page-layout {
  display: flex;
  flex-direction: column;
  gap: var(--b-spacing-lg);
  width: 100%;
  min-width: 0;
  max-width: var(--page-max-width);
  margin: 0 auto;
}

.page-layout__loader {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
}

.page-layout__header {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--b-spacing-3xs) var(--b-spacing-md);
  align-items: center;
}

.page-layout__header--has-actions {
  grid-template-columns: 1fr auto;
}

.page-layout__header-title {
  grid-column: 1;
  grid-row: 1;
}

.page-layout__header-subtitle {
  grid-column: 1 / -1;
}

.page-layout__header-actions {
  grid-column: 2;
  grid-row: 1;
  display: flex;
  gap: var(--b-spacing-xs);
  flex-shrink: 0;
}

@media (max-width: 599px) {
  .page-layout__header,
  .page-layout__header--has-actions {
    grid-template-columns: 1fr;
  }

  .page-layout__header-actions {
    grid-column: 1;
    grid-row: auto;
  }
}
</style>
