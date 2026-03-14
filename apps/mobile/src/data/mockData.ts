import { FoodSearchItem, MacroGoals, MacroTotals } from '../types/app';

// Mock values support Milestone 1 shell behavior before backend integration.
export const diaryTotals: MacroTotals = {
  calories: 1285,
  protein: 91,
  carbs: 126,
  fat: 42,
};

export const diaryGoals: MacroGoals = {
  calories: 2200,
  protein: 170,
  carbs: 220,
  fat: 70,
};

// Fallback lists used by search/favorites UI when query is empty or for local testing.
export const recentFoods: FoodSearchItem[] = [];

export const favoriteFoods: FoodSearchItem[] = [];