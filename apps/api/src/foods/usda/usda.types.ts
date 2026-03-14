// Lightweight USDA response contracts for the exact fields this module consumes.

export interface UsdaNutrientInSearch {
  nutrientName?: string;
  nutrientNumber?: string;
  value?: number;
}

export interface UsdaSearchFoodItem {
  fdcId: number;
  description: string;
  brandOwner?: string;
  foodNutrients?: UsdaNutrientInSearch[];
}

export interface UsdaSearchResponse {
  foods?: UsdaSearchFoodItem[];
}

export interface UsdaNutrientInDetail {
  amount?: number;
  nutrient?: {
    number?: string;
    name?: string;
    unitName?: string;
  };
}

export interface UsdaMeasureUnit {
  name?: string;
}

export interface UsdaFoodPortion {
  amount?: number;
  gramWeight?: number;
  modifier?: string;
  measureUnit?: UsdaMeasureUnit;
}

export interface UsdaFoodDetailResponse {
  fdcId: number;
  description: string;
  brandOwner?: string;
  foodNutrients?: UsdaNutrientInDetail[];
  foodPortions?: UsdaFoodPortion[];
}
