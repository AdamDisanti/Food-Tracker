// Shared app-level types for Milestone 1 shell navigation and view models.

export type MealGroup = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';

export type TopLevelScreen = 'Diary' | 'Search' | 'AddFood' | 'Settings';

export interface FoodServingOption {
  unitName: string;
  gramEquivalent: number;
  amountLabel: string | null;
}

// Minimal food shape used in shell screens until API integration is wired.
export interface FoodSearchItem {
  id: string;
  name: string;
  subtitle?: string;
  caloriesPerServing: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  defaultServingUnit?: string | null;
  defaultServingAmount?: number | null;
  servings?: FoodServingOption[];
}

export interface AddFoodSaveInput {
  amount: number;
  servingUnit: string;
  mealGroup: MealGroup;
  grams: number;
  loggedAt: string;
}

export interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MacroGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
