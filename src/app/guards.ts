import type { RouteLocationNormalized, Router } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

export function installGuards(router: Router): void {
  router.beforeEach((to) => {
    const auth = useAuthStore();

    return resolveNavigation({
      to,
      isAuthenticated: auth.isAuthenticated,
    });
  });
}

export function resolveNavigation(input: {
  to: Pick<RouteLocationNormalized, 'fullPath' | 'meta'>;
  isAuthenticated: boolean;
}): string | true | { path: string; query?: Record<string, string> } {
  if (input.to.meta.public) {
    return true;
  }

  if (input.to.meta.guest) {
    return input.isAuthenticated ? '/shops' : true;
  }

  if (!input.isAuthenticated) {
    return {
      path: '/login',
      query: { redirect: input.to.fullPath },
    };
  }

  return true;
}
