<script setup lang="ts">
import { BButton, BCard, BEmptyState, BInput, BLabel, BText, useBToast } from '@/ui';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { checkShopDomains, deleteShop, getShop, updateShop } from '@/api/shops';
import type { DomainCheckDto } from '@/api/types';
import PageLayout from '@/components/PageLayout.vue';
import { ApiError, messageForApiError } from '@/lib/errors';

const route = useRoute();
const router = useRouter();
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
const checkPending = ref(false);
const deletePending = ref(false);
const domainCheck = ref<DomainCheckDto | null>(null);

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

async function onCheckDomains(): Promise<void> {
  checkPending.value = true;
  try {
    domainCheck.value = await checkShopDomains(shopId.value);
  } catch (error) {
    const message =
      error instanceof ApiError ? messageForApiError(error) : 'Não foi possível verificar.';
    toast.add({ message, severity: 'failure' });
  } finally {
    checkPending.value = false;
  }
}

function dnsLabel(pointsToServer: boolean | null, ips: string[]): string {
  if (pointsToServer === true) return 'DNS aponta para o servidor';
  if (pointsToServer === false) return `DNS aponta para outro lugar (${ips.join(', ')})`;
  if (ips.length === 0) return 'DNS não resolve';
  return `DNS resolve para ${ips.join(', ')}`;
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

async function onDelete(): Promise<void> {
  if (!shop.value) return;

  const confirmed = window.confirm(
    `Excluir "${shop.value.name}"? O domínio sai do ar e o slug fica livre para reuso. Os dados são mantidos no banco.`,
  );
  if (!confirmed) return;

  deletePending.value = true;
  try {
    await deleteShop(shopId.value);
    await queryClient.invalidateQueries({ queryKey: ['shops'] });
    toast.add({ message: 'Barbearia excluída.', severity: 'success' });
    await router.push('/shops');
  } catch (error) {
    const message =
      error instanceof ApiError ? messageForApiError(error) : 'Não foi possível excluir.';
    toast.add({ message, severity: 'failure' });
  } finally {
    deletePending.value = false;
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

        <div class="detail__check">
          <BButton
            color="neutral"
            variant="outline"
            :is-loading="checkPending"
            :is-disabled="checkPending"
            @click="onCheckDomains"
          >
            Verificar domínios e SSL
          </BButton>
          <BText v-if="checkPending" as="p" variant="body-3" color="b-fg-neutral-secondary">
            Verificando DNS e HTTPS — isso também dispara a emissão do certificado.
          </BText>
        </div>

        <div v-if="domainCheck" class="detail__check-results">
          <div
            v-for="result in domainCheck.results"
            :key="result.domain"
            class="detail__check-result"
          >
            <div class="detail__check-domain">
              <BText as="span" variant="body-2-bold">{{ result.domain }}</BText>
              <BText as="span" variant="body-3" color="b-fg-neutral-secondary">
                {{ result.kind === 'custom' ? 'domínio próprio' : 'domínio padrão' }}
              </BText>
            </div>
            <div class="detail__check-rows">
              <div class="detail__check-row">
                <BLabel :color="result.dns.pointsToServer === false ? 'danger' : result.dns.ips.length ? 'success' : 'danger'">
                  {{ result.dns.ips.length ? 'DNS' : 'DNS ausente' }}
                </BLabel>
                <BText as="span" variant="body-3">
                  {{ dnsLabel(result.dns.pointsToServer, result.dns.ips) }}
                </BText>
              </div>
              <div class="detail__check-row">
                <BLabel :color="result.https.ok ? 'success' : 'danger'">HTTPS</BLabel>
                <BText as="span" variant="body-3">
                  {{
                    result.https.ok
                      ? 'Certificado válido e site respondendo'
                      : result.https.error
                        ? `Falhou: ${result.https.error}`
                        : `Respondeu com status ${result.https.status}`
                  }}
                </BText>
              </div>
            </div>
          </div>
          <BText
            v-if="!domainCheck.active"
            as="p"
            variant="body-3"
            color="b-fg-danger-default"
          >
            A barbearia está suspensa: certificados não serão emitidos enquanto ela estiver inativa.
          </BText>
        </div>
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

      <BCard>
        <BText as="h2" variant="heading-3" class="detail__section-title">Excluir</BText>
        <BText as="p" variant="body-2" color="b-fg-neutral-secondary" class="detail__danger-text">
          Excluir tira o domínio do ar e libera o slug para reuso. Os dados são mantidos no banco,
          mas a barbearia some do CRM.
        </BText>
        <BButton
          color="danger"
          :is-loading="deletePending"
          :is-disabled="deletePending"
          @click="onDelete"
        >
          Excluir barbearia
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

.detail__check {
  display: flex;
  align-items: center;
  gap: var(--b-spacing-sm);
  margin-top: var(--b-spacing-sm);
}

.detail__check-results {
  display: flex;
  flex-direction: column;
  gap: var(--b-spacing-sm);
  margin-top: var(--b-spacing-sm);
  padding-top: var(--b-spacing-sm);
  border-top: 1px solid var(--b-border-neutral-subtle, #e5e7eb);
}

.detail__check-domain {
  display: flex;
  align-items: baseline;
  gap: var(--b-spacing-xs);
  margin-bottom: var(--b-spacing-3xs);
}

.detail__check-rows {
  display: flex;
  flex-direction: column;
  gap: var(--b-spacing-3xs);
}

.detail__check-row {
  display: flex;
  align-items: center;
  gap: var(--b-spacing-xs);
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
