# barber-crm

Painel administrativo da plataforma (SUPER_ADMIN): provisiona e gerencia as
barbearias (tenants) servidas pelo barber-backend multi-tenant.

## Stack

- Vue 3 + Vite + TypeScript, mesmo esqueleto do barber-frontend
- `@barber/bcomponents` vendorado em `packages/` (workspaces npm)
- TanStack Query + Pinia + vue-router
- Servido por nginx em produção (ver `Dockerfile`), atrás do Caddy em
  `crm.barbearia360.app` (prod) / `crm.barbearia360.dev` (staging)

## Desenvolvimento

```bash
npm install
VITE_API_URL=http://localhost:3000/v1 npm run dev
```

O backend precisa estar rodando com um usuário `SUPER_ADMIN` (o seed cria
`super@barber.local` / `barber123`) e o host de dev listado em `PLATFORM_HOSTS`.

## Scripts

- `npm run dev` — Vite dev server (porta 5174)
- `npm run typecheck` — vue-tsc
- `npm test` — vitest
- `npm run build` — build de produção
- `npm run vendor:bcomponents` — re-vendora os pacotes de UI

## Deploy

CI roda em PRs; push na `main` faz deploy de staging; produção é
`workflow_dispatch`. A imagem é `ghcr.io/<owner>/barber-crm`, aplicada no VPS
via `/opt/barber/update-image.sh <env> crm <image>`.
