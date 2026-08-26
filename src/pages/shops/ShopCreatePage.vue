<script setup lang="ts">
import { BButton, BCard, BInput, BText, useBToast } from '@/ui';
import { useQueryClient } from '@tanstack/vue-query';
import { reactive, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { createShop } from '@/api/shops';
import PageLayout from '@/components/PageLayout.vue';
import { shopsBaseDomain } from '@/lib/domains';
import { ApiError, messageForApiError } from '@/lib/errors';

const baseDomain = shopsBaseDomain();
const router = useRouter();
const toast = useBToast();
const queryClient = useQueryClient();

const form = reactive({
  name: '',
  slug: '',
  customDomain: '',
  ownerName: '',
  ownerEmail: '',
  ownerPassword: '',
});
const fieldErrors = ref<Record<string, string>>({});
const formError = ref<string | null>(null);
const pending = ref(false);

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

function validate(): boolean {
  const errors: Record<string, string> = {};

  if (form.name.trim().length < 2) errors.name = 'Informe o nome da barbearia.';
  if (!SLUG_RE.test(form.slug) || form.slug.length < 3) {
    errors.slug = 'Só letras minúsculas, números e hífens (mín. 3).';
  }
  if (form.ownerName.trim().length < 2) errors.ownerName = 'Informe o nome do dono.';
  if (!form.ownerEmail.includes('@')) errors.ownerEmail = 'Email inválido.';
  if (form.ownerPassword.length < 8) errors.ownerPassword = 'Mínimo de 8 caracteres.';

  fieldErrors.value = errors;
  return Object.keys(errors).length === 0;
}

async function onSubmit(): Promise<void> {
  formError.value = null;
  if (!validate()) return;

  pending.value = true;
  try {
    const created = await createShop({
      name: form.name.trim(),
      slug: form.slug,
      ...(form.customDomain.trim() ? { customDomain: form.customDomain.trim().toLowerCase() } : {}),
      owner: {
        name: form.ownerName.trim(),
        email: form.ownerEmail.trim().toLowerCase(),
        password: form.ownerPassword,
      },
    });
    await queryClient.invalidateQueries({ queryKey: ['shops'] });
    toast.add({ message: 'Barbearia criada.', severity: 'success' });
    await router.push(`/shops/${created.id}`);
  } catch (error) {
    const message =
      error instanceof ApiError ? messageForApiError(error) : 'Não foi possível criar.';
    formError.value = message;
    toast.add({ message, severity: 'failure' });
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <PageLayout
    title="Nova barbearia"
    subtitle="Cria o tenant, o dono (ADMIN) e os serviços iniciais em uma transação."
  >
    <form class="create__form" @submit.prevent="onSubmit">
      <BCard>
        <BText as="h2" variant="heading-3" class="create__section-title">Barbearia</BText>
        <div class="create__fields">
          <BInput
            v-model="form.name"
            label="Nome"
            label-prepend-asterisk
            :helper-text="fieldErrors.name"
          />
          <div class="create__row">
            <BInput
              v-model="form.slug"
              label="Slug (subdomínio)"
              label-prepend-asterisk
              placeholder="minha-barbearia"
              :helper-text="fieldErrors.slug || `Vira ${form.slug || 'minha-barbearia'}.${baseDomain}.`"
            />
            <BInput
              v-model="form.customDomain"
              label="Domínio próprio"
              optional-text="opcional"
              placeholder="barbearia.com.br"
              :helper-text="'O DNS do cliente deve apontar para o VPS.'"
            />
          </div>
        </div>
      </BCard>

      <BCard>
        <BText as="h2" variant="heading-3" class="create__section-title">Dono (ADMIN)</BText>
        <div class="create__fields">
          <BInput
            v-model="form.ownerName"
            label="Nome"
            label-prepend-asterisk
            :helper-text="fieldErrors.ownerName"
          />
          <div class="create__row">
            <BInput
              v-model="form.ownerEmail"
              type="email"
              label="Email"
              label-prepend-asterisk
              :helper-text="fieldErrors.ownerEmail"
            />
            <BInput
              v-model="form.ownerPassword"
              type="password"
              label="Senha inicial"
              label-prepend-asterisk
              autocomplete="new-password"
              :helper-text="fieldErrors.ownerPassword || 'O dono troca no primeiro acesso.'"
            />
          </div>
        </div>
      </BCard>

      <p v-if="formError" class="create__error" role="alert">{{ formError }}</p>

      <div class="create__actions">
        <RouterLink to="/shops">
          <BButton type="button" variant="outline" color="neutral">Cancelar</BButton>
        </RouterLink>
        <BButton type="submit" color="primary" :is-loading="pending" :is-disabled="pending">
          Criar barbearia
        </BButton>
      </div>
    </form>
  </PageLayout>
</template>

<style scoped>
.create__form {
  display: flex;
  flex-direction: column;
  gap: var(--b-spacing-md);
}

.create__section-title {
  margin-bottom: var(--b-spacing-xs);
}

.create__fields {
  display: flex;
  flex-direction: column;
  gap: var(--b-spacing-2xs);
}

.create__row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--b-spacing-sm);
}

.create__error {
  color: var(--b-fg-danger-default);
  font-size: 14px;
}

.create__actions {
  display: flex;
  gap: var(--b-spacing-xs);
}
</style>
