// Shared app-level types for Milestone 1 shell navigation and view models.

export type MealGroup = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';

export type TopLevelScreen = 'Diary' | 'Search' | 'AddFood' | 'Settings';

// Minimal food shape used in shell screens until API integration is wired.
export interface FoodSearchItem {
  id: string;
  name: string;
  subtitle?: string;
  caloriesPerServing: number;
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
