import { FoodSearchItem } from '../types/app';
import { apiRequest } from './client';

interface ApiFoodSummary {
  id: string;
  sourceId: string;
  name: string;
  brand: string | null;
  caloriesPer100g: number;
}

function mapSummaryToSearchItem(item: ApiFoodSummary): FoodSearchItem {
  return {
    id: item.sourceId,
    name: item.name,
    subtitle: item.brand ? `${item.brand} • per 100g` : 'per 100g',
    caloriesPerServing: item.caloriesPer100g,
  };
}

export async function searchFoods(query: string): Promise<FoodSearchItem[]> {
  const data = await apiRequest<ApiFoodSummary[]>(`/foods/search?q=${encodeURIComponent(query)}&limit=20`);

  return data.map(mapSummaryToSearchItem);
}

export async function getRecentFoods(limit = 20): Promise<FoodSearchItem[]> {
  const data = await apiRequest<ApiFoodSummary[]>(`/foods/recent?limit=${limit}`);
  return data.map(mapSummaryToSearchItem);
}
