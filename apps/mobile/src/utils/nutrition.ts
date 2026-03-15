/**
 * Centralized conversion constants keep Add and Edit flows mathematically consistent.
 * We intentionally keep these in one utility to avoid duplicate logic drift.
 */
export const GRAMS_PER_OUNCE = 28.3495;

/**
 * MVP assumption for search-level foods that do not yet expose serving metadata.
 * Until detail-level serving options are wired into selection, one "serving" is 100g.
 */
export const DEFAULT_GRAMS_PER_SERVING = 100;

export type ServingUnit = 'serving' | 'grams' | 'oz';

export interface ServingChoice {
  id: string;
  label: string;
  unitName: string;
  gramsPerUnit: number;
  kind: 'standard' | 'detail';
}

/**
 * Builds selectable serving choices from food detail servings plus standard units.
 *
 * Design notes:
 * - `grams` and `oz` are always present for deterministic manual entry.
 * - Detail options are normalized to "amountLabel" (fallback to unit + grams).
 * - We include fallback `serving` only when detail options are absent.
 */
export function buildServingChoices(params: {
  detailServings?: Array<{
    unitName: string;
    gramEquivalent: number;
    amountLabel: string | null;
  }>;
  defaultServingAmount?: number | null;
}): ServingChoice[] {
  const detailChoices: ServingChoice[] = (params.detailServings ?? [])
    .filter((option) => option.gramEquivalent > 0)
    .map((option, index) => ({
      id: `detail-${index}`,
      label: option.amountLabel ?? `${option.unitName} (${round2(option.gramEquivalent)}g)`,
      unitName: option.unitName,
      gramsPerUnit: round2(option.gramEquivalent),
      kind: 'detail' as const,
    }));

  const standards: ServingChoice[] = [
    {
      id: 'grams',
      label: 'grams',
      unitName: 'grams',
      gramsPerUnit: 1,
      kind: 'standard',
    },
    {
      id: 'oz',
      label: 'oz',
      unitName: 'oz',
      gramsPerUnit: GRAMS_PER_OUNCE,
      kind: 'standard',
    },
  ];

  if (detailChoices.length > 0) {
    return [...detailChoices, ...standards];
  }

  const servingBase =
    params.defaultServingAmount && params.defaultServingAmount > 0
      ? params.defaultServingAmount
      : DEFAULT_GRAMS_PER_SERVING;

  return [
    {
      id: 'serving',
      label: 'serving',
      unitName: 'serving',
      gramsPerUnit: round2(servingBase),
      kind: 'standard',
    },
    ...standards,
  ];
}

/**
 * Converts amount and selected serving choice into grams.
 * This is the canonical conversion used for both add and edit flows.
 */
export function toGramsFromChoice(params: {
  amount: number;
  choice: ServingChoice;
}): number {
  const safeAmount = Number.isFinite(params.amount) && params.amount > 0 ? params.amount : 0;
  return round2(safeAmount * params.choice.gramsPerUnit);
}

/**
 * Matches persisted serving unit text back to the best available choice id.
 * Falls back to the first available option to keep the UI always selectable.
 */
export function resolveInitialServingChoiceId(params: {
  choices: ServingChoice[];
  persistedUnitName?: string | null;
}): string {
  const unit = params.persistedUnitName?.toLowerCase().trim();
  if (unit) {
    const byUnitName = params.choices.find(
      (choice) => choice.unitName.toLowerCase() === unit,
    );
    if (byUnitName) {
      return byUnitName.id;
    }
  }

  return params.choices[0]?.id ?? 'grams';
}

/**
 * Converts a user-entered amount/unit pair into grams for snapshot persistence.
 * This function is the single source of truth used by Add Food preview and save payloads.
 */
export function toGramsFromUnit(params: {
  amount: number;
  unit: ServingUnit;
  gramsPerServing?: number | null;
}): number {
  const { amount, unit, gramsPerServing } = params;
  const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 0;

  if (unit === 'grams') {
    return round2(safeAmount);
  }

  if (unit === 'oz') {
    return round2(safeAmount * GRAMS_PER_OUNCE);
  }

  const servingBase =
    gramsPerServing && gramsPerServing > 0
      ? gramsPerServing
      : DEFAULT_GRAMS_PER_SERVING;
  return round2(safeAmount * servingBase);
}

/**
 * Produces macro + calorie preview from grams and per-100g nutrition values.
 * This mirrors backend snapshot math so users see values consistent with saved entries.
 */
export function getNutritionPreview(params: {
  grams: number;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
} {
  const factor = (Number.isFinite(params.grams) ? params.grams : 0) / 100;
  return {
    calories: round2(params.caloriesPer100g * factor),
    protein: round2(params.proteinPer100g * factor),
    carbs: round2(params.carbsPer100g * factor),
    fat: round2(params.fatPer100g * factor),
  };
}

/**
 * Shared rounding keeps text display and API payload values stable and predictable.
 */
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
