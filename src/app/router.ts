import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { installGuards } from '@/app/guards';

declare module 'vue-router' {
  interface RouteMeta {
    title: string;
    guest?: boolean;
    public?: boolean;
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/LoginPage.vue'),
    meta: { title: 'Entrar', guest: true },
  },
  {
    path: '/',
    redirect: '/shops',
  },
  {
    path: '/shops',
    name: 'shops',
    component: () => import('@/pages/shops/ShopsListPage.vue'),
    meta: { title: 'Barbearias' },
  },
  {
    path: '/shops/new',
    name: 'shops-new',
    component: () => import('@/pages/shops/ShopCreatePage.vue'),
    meta: { title: 'Nova barbearia' },
  },
  {
    path: '/shops/:id',
    name: 'shops-detail',
    component: () => import('@/pages/shops/ShopDetailPage.vue'),
    meta: { title: 'Barbearia' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/NotFoundPage.vue'),
    meta: { title: 'Não encontrado', public: true },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

installGuards(router);

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · Barber CRM` : 'Barber CRM';
});
