export interface LoggedItemDto {
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

export interface DayTotalsDto {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DayLogResponseDto {
  date: string;
  totals: DayTotalsDto;
  meals: {
    breakfast: LoggedItemDto[];
    lunch: LoggedItemDto[];
    dinner: LoggedItemDto[];
    snacks: LoggedItemDto[];
  };
}
