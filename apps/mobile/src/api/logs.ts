import { MealGroup } from '../types/app';
import { apiRequest } from './client';

export interface DayLogData {
  date: string;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  meals: {
    breakfast: Array<{ foodName: string; amount: number; servingUnit: string }>;
    lunch: Array<{ foodName: string; amount: number; servingUnit: string }>;
    dinner: Array<{ foodName: string; amount: number; servingUnit: string }>;
    snacks: Array<{ foodName: string; amount: number; servingUnit: string }>;
  };
}

function toApiMealGroup(group: MealGroup): 'breakfast' | 'lunch' | 'dinner' | 'snacks' {
  return group.toLowerCase() as 'breakfast' | 'lunch' | 'dinner' | 'snacks';
}

export async function createLogItem(input: {
  foodId: string;
  mealGroup: MealGroup;
  amount: number;
  servingUnit: string;
  grams: number;
  loggedAt: string;
  logDate: string;
}): Promise<void> {
  await apiRequest('/logs/items', {
    method: 'POST',
    body: JSON.stringify({
      ...input,
      mealGroup: toApiMealGroup(input.mealGroup),
    }),
  });
}

export async function getDayLog(date: string): Promise<DayLogData> {
  return apiRequest<DayLogData>(`/logs/day?date=${encodeURIComponent(date)}`);
}
