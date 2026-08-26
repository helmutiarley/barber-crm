<script setup lang="ts">
import { BButton, BCard, BEmptyState, BLabel, BSkeletonLoader, BText } from '@/ui';
import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { listShops } from '@/api/shops';
import PageLayout from '@/components/PageLayout.vue';

const { data, isPending, isError } = useQuery({
  queryKey: ['shops'],
  queryFn: () => listShops(),
});

const shops = computed(() => data.value ?? []);

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}
</script>

<template>
  <PageLayout title="Barbearias" subtitle="Todos os tenants da plataforma, ativos e suspensos.">
    <template #header-actions>
      <RouterLink to="/shops/new">
        <BButton color="primary" icon-prepend="ic-add-16">Nova barbearia</BButton>
      </RouterLink>
    </template>

    <BSkeletonLoader v-if="isPending" height="240px" />

    <BEmptyState
      v-else-if="isError"
      title="Não foi possível carregar"
      subtitle="Tente novamente em instantes."
    />

    <BEmptyState
      v-else-if="shops.length === 0"
      title="Nenhuma barbearia"
      subtitle="Provisione o primeiro tenant da plataforma."
    >
      <template #actions>
        <RouterLink to="/shops/new">
          <BButton color="primary">Nova barbearia</BButton>
        </RouterLink>
      </template>
    </BEmptyState>

    <BCard v-else padding="0" class="shops__table-card">
      <div class="shops__table-wrap">
        <table class="shops__table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Domínio</th>
              <th>Usuários</th>
              <th>Agendamentos</th>
              <th>Criada em</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in shops" :key="row.id">
              <td>
                <div class="shops__name">
                  <BText as="span" variant="body-2-bold">{{ row.name }}</BText>
                  <BText as="span" variant="body-3" color="b-fg-neutral-secondary">
                    {{ row.slug }}
                  </BText>
                </div>
              </td>
              <td class="shops__domain">
                <a
                  :href="`https://${row.customDomain ?? row.domain}`"
                  target="_blank"
                  rel="noopener"
                >
                  {{ row.customDomain ?? row.domain }}
                </a>
              </td>
              <td class="shops__number">{{ row.users }}</td>
              <td class="shops__number">{{ row.appointments }}</td>
              <td>{{ formatDate(row.createdAt) }}</td>
              <td>
                <BLabel :color="row.active ? 'success' : 'grayLight'">
                  {{ row.active ? 'Ativa' : 'Suspensa' }}
                </BLabel>
              </td>
              <td class="shops__actions">
                <RouterLink :to="`/shops/${row.id}`">
                  <BButton size="small" variant="outline" color="neutral">Gerenciar</BButton>
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </BCard>
  </PageLayout>
</template>

<style scoped>
.shops__table-card {
  min-width: 0;
  overflow: hidden;
}

.shops__table-wrap {
  overflow-x: auto;
}

.shops__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.shops__table th,
.shops__table td {
  padding: var(--b-spacing-xs) var(--b-spacing-sm);
  text-align: left;
  vertical-align: middle;
  border-bottom: 1px solid var(--b-stroke-default);
}

.shops__table th {
  font-weight: 700;
  color: var(--b-fg-neutral-secondary);
  background: var(--b-bg-neutral-surface);
  white-space: nowrap;
}

.shops__table tbody tr:last-child td {
  border-bottom: none;
}

.shops__table tbody tr:hover {
  background: var(--b-bg-neutral-hover);
}

.shops__name {
  display: flex;
  flex-direction: column;
  gap: var(--b-spacing-4xs);
  min-width: 0;
}

.shops__domain a {
  color: var(--b-fg-brand-primary, #1d4ed8);
  text-decoration: underline;
}

.shops__number {
  font-variant-numeric: tabular-nums;
}

.shops__actions {
  text-align: right;
  white-space: nowrap;
}
</style>
