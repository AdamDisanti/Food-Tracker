// Normalized summary shape consumed by search/list style clients.
export interface FoodSummaryDto {
  id: string;
  source: 'usda';
  sourceId: string;
  name: string;
  brand: string | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}
