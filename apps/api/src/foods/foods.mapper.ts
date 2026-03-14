import { Food } from '@prisma/client';
import { FoodDetailDto, FoodServingDto } from './dto/food-detail.dto';
import { FoodSummaryDto } from './dto/food-summary.dto';
import {
  UsdaFoodDetailResponse,
  UsdaFoodPortion,
  UsdaNutrientInDetail,
  UsdaNutrientInSearch,
  UsdaSearchFoodItem,
} from './usda/usda.types';

function clamp2(value: number): number {
  return Math.round(value * 100) / 100;
}

function getNutrientFromSearch(
  nutrients: UsdaNutrientInSearch[] | undefined,
  numbers: string[],
  names: string[],
): number {
  const list = nutrients ?? [];
  const hit = list.find((n) => {
    const number = n.nutrientNumber?.trim();
    const name = n.nutrientName?.toLowerCase().trim();
    return numbers.includes(number ?? '') || names.includes(name ?? '');
  });
  return clamp2(hit?.value ?? 0);
}

function getNutrientFromDetail(
  nutrients: UsdaNutrientInDetail[] | undefined,
  numbers: string[],
  names: string[],
): number {
  const list = nutrients ?? [];
  const hit = list.find((n) => {
    const number = n.nutrient?.number?.trim();
    const name = n.nutrient?.name?.toLowerCase().trim();
    return numbers.includes(number ?? '') || names.includes(name ?? '');
  });
  return clamp2(hit?.amount ?? 0);
}

function mapUsdaPortionToServing(
  portion: UsdaFoodPortion,
): FoodServingDto | null {
  const grams = portion.gramWeight ?? 0;
  if (grams <= 0) {
    return null;
  }

  const amount = portion.amount ?? 1;
  const unit = portion.measureUnit?.name ?? 'serving';
  const modifier = portion.modifier ? ` ${portion.modifier}` : '';

  return {
    unitName: unit,
    gramEquivalent: clamp2(grams),
    amountLabel: `${amount} ${unit}${modifier}`.trim(),
  };
}

export function mapUsdaSearchItemToSummary(
  item: UsdaSearchFoodItem,
): FoodSummaryDto {
  return {
    id: `usda:${item.fdcId}`,
    source: 'usda',
    sourceId: String(item.fdcId),
    name: item.description,
    brand: item.brandOwner ?? null,
    caloriesPer100g: getNutrientFromSearch(
      item.foodNutrients,
      ['1008'],
      ['energy'],
    ),
    proteinPer100g: getNutrientFromSearch(
      item.foodNutrients,
      ['1003'],
      ['protein'],
    ),
    carbsPer100g: getNutrientFromSearch(
      item.foodNutrients,
      ['1005'],
      ['carbohydrate, by difference'],
    ),
    fatPer100g: getNutrientFromSearch(
      item.foodNutrients,
      ['1004'],
      ['total lipid (fat)'],
    ),
  };
}

export function mapUsdaDetailToDto(
  item: UsdaFoodDetailResponse,
): FoodDetailDto {
  const servings = (item.foodPortions ?? [])
    .map(mapUsdaPortionToServing)
    .filter((serving): serving is FoodServingDto => serving !== null);

  return {
    id: `usda:${item.fdcId}`,
    source: 'usda',
    sourceId: String(item.fdcId),
    name: item.description,
    brand: item.brandOwner ?? null,
    caloriesPer100g: getNutrientFromDetail(
      item.foodNutrients,
      ['1008'],
      ['energy'],
    ),
    proteinPer100g: getNutrientFromDetail(
      item.foodNutrients,
      ['1003'],
      ['protein'],
    ),
    carbsPer100g: getNutrientFromDetail(
      item.foodNutrients,
      ['1005'],
      ['carbohydrate, by difference'],
    ),
    fatPer100g: getNutrientFromDetail(
      item.foodNutrients,
      ['1004'],
      ['total lipid (fat)'],
    ),
    defaultServingUnit: servings[0]?.unitName ?? null,
    defaultServingAmount: servings[0]?.gramEquivalent ?? null,
    servings,
  };
}

export function mapCachedFoodToDetail(
  food: Food & {
    servings: {
      unitName: string;
      gramEquivalent: number;
      amountLabel: string | null;
    }[];
  },
): FoodDetailDto {
  return {
    id: food.id,
    source: 'usda',
    sourceId: food.sourceId,
    name: food.name,
    brand: food.brand,
    caloriesPer100g: food.caloriesPer100g,
    proteinPer100g: food.proteinPer100g,
    carbsPer100g: food.carbsPer100g,
    fatPer100g: food.fatPer100g,
    defaultServingUnit: food.defaultServingUnit,
    defaultServingAmount: food.defaultServingAmount,
    servings: food.servings.map((serving) => ({
      unitName: serving.unitName,
      gramEquivalent: serving.gramEquivalent,
      amountLabel: serving.amountLabel,
    })),
  };
}
