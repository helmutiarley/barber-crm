<script setup lang="ts">
import { BButton, BCard, BEmptyState, BInput, BLabel, BText, useBToast } from '@barber/bcomponents';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { getShop, updateShop } from '@/api/shops';
import PageLayout from '@/components/PageLayout.vue';
import { ApiError, messageForApiError } from '@/lib/errors';

const route = useRoute();
const toast = useBToast();
const queryClient = useQueryClient();

const shopId = computed(() => String(route.params.id));

const { data: shop, isPending, isError } = useQuery({
  queryKey: computed(() => ['shops', shopId.value] as const),
  queryFn: () => getShop(shopId.value),
});

const customDomain = ref('');
const domainPending = ref(false);
const togglePending = ref(false);

const currentAddress = computed(() =>
  shop.value ? (shop.value.customDomain ?? shop.value.domain) : '',
);

watch(
  shop,
  (value) => {
    customDomain.value = value?.customDomain ?? '';
  },
  { immediate: true },
);

async function refresh(): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: ['shops'] });
}

async function onSaveDomain(): Promise<void> {
  domainPending.value = true;
  try {
    const trimmed = customDomain.value.trim().toLowerCase();
    await updateShop(shopId.value, { customDomain: trimmed === '' ? null : trimmed });
    await refresh();
    toast.add({ message: 'Domínio atualizado.', severity: 'success' });
  } catch (error) {
    const message =
      error instanceof ApiError ? messageForApiError(error) : 'Não foi possível salvar.';
    toast.add({ message, severity: 'failure' });
  } finally {
    domainPending.value = false;
  }
}

async function onToggleActive(): Promise<void> {
  if (!shop.value) return;

  togglePending.value = true;
  try {
    await updateShop(shopId.value, { active: !shop.value.active });
    await refresh();
    toast.add({
      message: shop.value.active ? 'Barbearia suspensa.' : 'Barbearia reativada.',
      severity: 'success',
    });
  } catch (error) {
    const message =
      error instanceof ApiError ? messageForApiError(error) : 'Não foi possível alterar.';
    toast.add({ message, severity: 'failure' });
  } finally {
    togglePending.value = false;
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}
</script>

<template>
  <PageLayout :is-loading="isPending">
    <BEmptyState
      v-if="isError"
      title="Barbearia não encontrada"
      subtitle="Ela pode ter sido removida."
    >
      <template #actions>
        <RouterLink to="/shops">
          <BButton color="primary">Voltar para a lista</BButton>
        </RouterLink>
      </template>
    </BEmptyState>

    <template v-else-if="shop">
      <header class="detail__header">
        <div class="detail__title">
          <BText as="h1" variant="heading-1">{{ shop.name }}</BText>
          <BLabel :color="shop.active ? 'success' : 'grayLight'">
            {{ shop.active ? 'Ativa' : 'Suspensa' }}
          </BLabel>
        </div>
        <BText as="p" variant="body-2" color="b-fg-neutral-secondary">
          {{ shop.slug }} · criada em {{ formatDate(shop.createdAt) }} · {{ shop.users }} usuários ·
          {{ shop.appointments }} agendamentos
        </BText>
      </header>

      <BCard>
        <BText as="h2" variant="heading-3" class="detail__section-title">Domínios</BText>
        <div class="detail__domain-row">
          <BInput
            v-model="customDomain"
            label="Domínio próprio"
            optional-text="opcional"
            placeholder="barbearia.com.br"
            :helper-text="`Sem domínio próprio, responde em ${shop.domain}.`"
          />
          <BButton
            color="neutral"
            :is-loading="domainPending"
            :is-disabled="domainPending"
            @click="onSaveDomain"
          >
            Salvar domínio
          </BButton>
        </div>
        <BText as="p" variant="body-3" color="b-fg-neutral-secondary">
          Endereço atual:
          <a :href="`https://${currentAddress}`" target="_blank" rel="noopener" class="detail__link">
            {{ currentAddress }}
          </a>
        </BText>
      </BCard>

      <BCard>
        <BText as="h2" variant="heading-3" class="detail__section-title">
          {{ shop.active ? 'Suspender' : 'Reativar' }}
        </BText>
        <BText as="p" variant="body-2" color="b-fg-neutral-secondary" class="detail__danger-text">
          {{
            shop.active
              ? 'Suspender tira o domínio do ar e bloqueia o login de todos os usuários da barbearia. Os dados são mantidos.'
              : 'Reativar volta a servir o domínio e libera o login dos usuários.'
          }}
        </BText>
        <BButton
          :color="shop.active ? 'danger' : 'primary'"
          variant="outline"
          :is-loading="togglePending"
          :is-disabled="togglePending"
          @click="onToggleActive"
        >
          {{ shop.active ? 'Suspender barbearia' : 'Reativar barbearia' }}
        </BButton>
      </BCard>
    </template>
  </PageLayout>
</template>

<style scoped>
.detail__header {
  display: flex;
  flex-direction: column;
  gap: var(--b-spacing-3xs);
}

.detail__title {
  display: flex;
  align-items: center;
  gap: var(--b-spacing-xs);
}

.detail__section-title {
  margin-bottom: var(--b-spacing-xs);
}

.detail__domain-row {
  display: grid;
  grid-template-columns: minmax(220px, 400px) auto;
  gap: var(--b-spacing-sm);
  align-items: end;
  margin-bottom: var(--b-spacing-xs);
}

.detail__danger-text {
  margin-bottom: var(--b-spacing-sm);
}

.detail__link {
  color: var(--b-fg-brand-primary, #1d4ed8);
  text-decoration: underline;
}

@media (max-width: 599px) {
  .detail__domain-row {
    grid-template-columns: 1fr;
    align-items: stretch;
  }
}
</style>
