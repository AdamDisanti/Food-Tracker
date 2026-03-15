export interface FavoriteFoodDto {
  id: string;
  foodId: string;
  sourceId: string;
  name: string;
  brand: string | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  lastUsedAmount: number | null;
  lastUsedServingUnit: string | null;
  createdAt: string;
}
