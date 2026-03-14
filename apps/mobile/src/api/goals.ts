import { apiRequest } from './client';

export interface GoalsData {
  calorieGoal: number;
  proteinGoal: number;
  carbGoal: number;
  fatGoal: number;
  updatedAt: string;
}

export async function getGoals(): Promise<GoalsData | null> {
  return apiRequest<GoalsData | null>('/goals');
}

export async function saveGoals(input: {
  calorieGoal: number;
  proteinGoal: number;
  carbGoal: number;
  fatGoal: number;
}): Promise<GoalsData> {
  return apiRequest<GoalsData>('/goals', {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}
