import { StyleSheet, Text, View } from 'react-native';
import { MacroGoals, MacroTotals } from '../types/app';
import { colors } from '../theme/colors';
import { ServingChoice } from '../utils/nutrition';
import { NutritionSummary } from './NutritionSummary';

/**
 * Shared nutrition preview block used by both Add and Edit food workflows.
 *
 * This enforces mirrored look/behavior for the two flows that should feel identical.
 */
export function NutritionPreviewPanel({
  previewTotals,
  goals,
  estimatedGrams,
  ouncesEquivalent,
  selectedServingChoice,
}: {
  previewTotals: MacroTotals;
  goals?: MacroGoals | null;
  estimatedGrams: number;
  ouncesEquivalent: number;
  selectedServingChoice?: ServingChoice;
}) {
  // Always render progress-bar style; fallback goals ensure bars still render when no goals are set.
  const previewGoals: MacroGoals = goals ?? {
    calories: Math.max(previewTotals.calories, 1),
    protein: Math.max(previewTotals.protein, 1),
    carbs: Math.max(previewTotals.carbs, 1),
    fat: Math.max(previewTotals.fat, 1),
  };

  return (
    <View style={styles.container}>
      <NutritionSummary totals={previewTotals} goals={previewGoals} />

      <Text style={styles.metaText}>Grams used for save: {estimatedGrams} g</Text>
      <Text style={styles.metaText}>Ounces equivalent: {ouncesEquivalent} oz</Text>
      <Text style={styles.metaText}>
        Selected unit: {selectedServingChoice?.unitName ?? 'n/a'} ({selectedServingChoice?.gramsPerUnit ?? 0} g each)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});
