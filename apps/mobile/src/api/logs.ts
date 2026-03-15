import { MealGroup } from '../types/app';
import { apiRequest } from './client';

export interface LoggedMealItem {
  id: string;
  foodId: string;
  foodSourceId: string;
  foodName: string;
  mealGroup: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  amount: number;
  servingUnit: string;
  grams: number;
  loggedAt: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  defaultServingAmount: number | null;
}

export interface DayLogData {
  date: string;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  meals: {
    breakfast: LoggedMealItem[];
    lunch: LoggedMealItem[];
    dinner: LoggedMealItem[];
    snacks: LoggedMealItem[];
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

/**
 * Updates an existing log item. Callers can send only changed fields.
 */
export async function updateLogItem(
  id: string,
  input: {
    mealGroup?: MealGroup;
    amount?: number;
    servingUnit?: string;
    grams?: number;
    loggedAt?: string;
  },
): Promise<void> {
  await apiRequest(`/logs/items/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      ...input,
      mealGroup: input.mealGroup ? toApiMealGroup(input.mealGroup) : undefined,
    }),
  });
}

/**
 * Removes a single log item from the selected day.
 */
export async function deleteLogItem(id: string): Promise<void> {
  await apiRequest(`/logs/items/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
