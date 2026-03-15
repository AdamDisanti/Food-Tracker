import { FoodSearchItem } from '../types/app';
import { apiRequest } from './client';

interface ApiFoodSummary {
  id: string;
  sourceId: string;
  name: string;
  brand: string | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  defaultServingAmount?: number | null;
  defaultServingUnit?: string | null;
}

interface ApiFoodDetail extends ApiFoodSummary {
  servings: Array<{
    unitName: string;
    gramEquivalent: number;
    amountLabel: string | null;
  }>;
}

function mapSummaryToSearchItem(item: ApiFoodSummary): FoodSearchItem {
  return {
    id: item.sourceId,
    name: item.name,
    subtitle: item.brand ? `${item.brand} • per 100g` : 'per 100g',
    caloriesPerServing: item.caloriesPer100g,
    proteinPer100g: item.proteinPer100g,
    carbsPer100g: item.carbsPer100g,
    fatPer100g: item.fatPer100g,
    defaultServingUnit: item.defaultServingUnit ?? null,
    defaultServingAmount: item.defaultServingAmount ?? null,
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

/**
 * Fetches full food detail so Add/Edit can present real serving choices from USDA/cache.
 */
export async function getFoodDetail(foodId: string): Promise<FoodSearchItem> {
  const detail = await apiRequest<ApiFoodDetail>(`/foods/${encodeURIComponent(foodId)}`);
  return {
    ...mapSummaryToSearchItem(detail),
    servings: detail.servings ?? [],
  };
}
