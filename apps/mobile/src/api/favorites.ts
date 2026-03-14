import { FoodSearchItem } from '../types/app';
import { apiRequest } from './client';

interface ApiFavoriteFood {
  id: string;
  sourceId: string;
  name: string;
  brand: string | null;
  caloriesPer100g: number;
}

function mapFavoriteToSearchItem(item: ApiFavoriteFood): FoodSearchItem {
  return {
    id: item.sourceId,
    name: item.name,
    subtitle: item.brand ? `${item.brand} • per 100g` : 'per 100g',
    caloriesPerServing: item.caloriesPer100g,
  };
}

export async function getFavorites(): Promise<FoodSearchItem[]> {
  const data = await apiRequest<ApiFavoriteFood[]>('/favorites');
  return data.map(mapFavoriteToSearchItem);
}

export async function addFavorite(foodId: string): Promise<void> {
  await apiRequest('/favorites', {
    method: 'POST',
    body: JSON.stringify({ foodId }),
  });
}

export async function removeFavorite(foodId: string): Promise<void> {
  await apiRequest(`/favorites/${encodeURIComponent(foodId)}`, {
    method: 'DELETE',
  });
}
