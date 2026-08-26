export type UserDto = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'BARBER' | 'CLIENT';
  active: boolean;
  createdAt: string;
};

export type AuthResult = {
  user: UserDto;
  accessToken: string;
  refreshToken: string;
};

export type ShopDto = {
  id: string;
  name: string;
  slug: string;
  domain: string;
  customDomain: string | null;
  active: boolean;
  createdAt: string;
};

export type ShopWithStatsDto = ShopDto & {
  users: number;
  appointments: number;
};

export type DnsRecordStatus = 'created' | 'exists' | 'failed' | 'skipped';

export type CreatedShopDto = ShopDto & {
  dnsRecord: DnsRecordStatus;
};

export type DomainCheckResult = {
  domain: string;
  kind: 'default' | 'custom';
  dns: {
    ips: string[];
    expectedIps: string[];
    pointsToServer: boolean | null;
  };
  https: {
    ok: boolean;
    status: number | null;
    error: string | null;
  };
};

export type DomainCheckDto = {
  active: boolean;
  results: DomainCheckResult[];
};
