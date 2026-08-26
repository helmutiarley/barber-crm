import { describe, expect, it } from 'vitest';
import { resolveNavigation } from '../src/app/guards';

function to(meta: Record<string, unknown>, fullPath = '/shops') {
  return { fullPath, meta } as Parameters<typeof resolveNavigation>[0]['to'];
}

describe('resolveNavigation', () => {
  it('lets public routes through regardless of session', () => {
    expect(resolveNavigation({ to: to({ public: true }), isAuthenticated: false })).toBe(true);
  });

  it('sends an authenticated user away from guest routes', () => {
    expect(resolveNavigation({ to: to({ guest: true }, '/login'), isAuthenticated: true })).toBe(
      '/shops',
    );
  });

  it('keeps an anonymous user on guest routes', () => {
    expect(resolveNavigation({ to: to({ guest: true }, '/login'), isAuthenticated: false })).toBe(
      true,
    );
  });

  it('redirects an anonymous user to login with the intended target', () => {
    expect(resolveNavigation({ to: to({}, '/shops/abc'), isAuthenticated: false })).toEqual({
      path: '/login',
      query: { redirect: '/shops/abc' },
    });
  });

  it('lets an authenticated user into protected routes', () => {
    expect(resolveNavigation({ to: to({}), isAuthenticated: true })).toBe(true);
  });
});
