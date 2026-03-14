import { FoodSummaryDto } from './food-summary.dto';

export interface FoodServingDto {
  unitName: string;
  gramEquivalent: number;
  amountLabel: string | null;
}

// Normalized detail shape used by add-food screens and future cache workflows.
export interface FoodDetailDto extends FoodSummaryDto {
  defaultServingUnit: string | null;
  defaultServingAmount: number | null;
  servings: FoodServingDto[];
}
