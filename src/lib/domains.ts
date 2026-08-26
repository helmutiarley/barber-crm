const DEFAULT_BASE_DOMAIN = 'barbearia360.app';

export function shopsBaseDomain(): string {
  const host = window.location.hostname;
  if (host.startsWith('crm.')) return host.slice('crm.'.length);
  return DEFAULT_BASE_DOMAIN;
}
