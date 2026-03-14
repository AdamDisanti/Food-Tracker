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

export const recentFoods: FoodSearchItem[] = [
  { id: '1', name: 'Greek Yogurt', subtitle: '170 g serving', caloriesPerServing: 100 },
  { id: '2', name: 'Blueberries', subtitle: '80 g serving', caloriesPerServing: 45 },
  { id: '3', name: 'Chicken Breast', subtitle: '120 g serving', caloriesPerServing: 198 },
  { id: '4', name: 'White Rice', subtitle: '1 cup cooked', caloriesPerServing: 205 },
];

export const favoriteFoods: FoodSearchItem[] = [
  { id: '10', name: 'Egg Whites', subtitle: '3/4 cup', caloriesPerServing: 95 },
  { id: '11', name: 'Banana', subtitle: '1 medium', caloriesPerServing: 105 },
];
