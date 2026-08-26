import { apiRequest } from '@/api/client';
import type {
  CreatedShopDto,
  DeletedShopDto,
  DomainCheckDto,
  ShopDto,
  ShopWithStatsDto,
} from '@/api/types';

export type CreateShopInput = {
  name: string;
  slug: string;
  customDomain?: string;
  owner: {
    name: string;
    email: string;
    password: string;
  };
};

export type UpdateShopInput = {
  name?: string;
  customDomain?: string | null;
  active?: boolean;
};

export function listShops(): Promise<ShopWithStatsDto[]> {
  return apiRequest<ShopWithStatsDto[]>('/platform/shops');
}

export function getShop(id: string): Promise<ShopWithStatsDto> {
  return apiRequest<ShopWithStatsDto>(`/platform/shops/${id}`);
}

export function createShop(input: CreateShopInput): Promise<CreatedShopDto> {
  return apiRequest<CreatedShopDto>('/platform/shops', { method: 'POST', body: input });
}

export function updateShop(id: string, input: UpdateShopInput): Promise<ShopDto> {
  return apiRequest<ShopDto>(`/platform/shops/${id}`, { method: 'PATCH', body: input });
}

export function deleteShop(id: string): Promise<DeletedShopDto> {
  return apiRequest<DeletedShopDto>(`/platform/shops/${id}`, { method: 'DELETE' });
}

export function checkShopDomains(id: string): Promise<DomainCheckDto> {
  return apiRequest<DomainCheckDto>(`/platform/shops/${id}/domain-check`);
}
