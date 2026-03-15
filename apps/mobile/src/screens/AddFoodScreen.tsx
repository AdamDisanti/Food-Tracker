import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionCard } from '../components/SectionCard';
import { PrimaryButton } from '../components/PrimaryButton';
import {
  AddFoodSaveInput,
  FoodSearchItem,
  MacroGoals,
  MealGroup,
} from '../types/app';
import { colors } from '../theme/colors';
import { FoodEntryDetailsForm } from '../components/FoodEntryDetailsForm';
import { NutritionPreviewPanel } from '../components/NutritionPreviewPanel';
import {
  DEFAULT_GRAMS_PER_SERVING,
  GRAMS_PER_OUNCE,
  buildServingChoices,
  getNutritionPreview,
  round2,
  resolveInitialServingChoiceId,
  toGramsFromChoice,
} from '../utils/nutrition';

// Add food shell form with default group assignment and simple nutrition preview.
export function AddFoodScreen({
  food,
  defaultGroup,
  initialValues,
  goals,
  mode,
  onSave,
  onDelete,
  onBack,
}: {
  food: FoodSearchItem | null;
  defaultGroup: MealGroup;
  initialValues?: {
    amount: number;
    servingUnit: string;
    mealGroup: MealGroup;
  };
  goals?: MacroGoals | null;
  mode?: 'add' | 'edit';
  onSave: (input: AddFoodSaveInput) => void;
  onDelete?: () => void;
  onBack: () => void;
}) {
  // Prefill from existing log item when editing, otherwise use add defaults.
  const [amount, setAmount] = useState(String(initialValues?.amount ?? 1));
  const [time, setTime] = useState('12:30');
  const [group, setGroup] = useState<MealGroup>(
    initialValues?.mealGroup ?? defaultGroup,
  );

  const numericAmount = Number(amount) || 0;

  // Serving baseline stays explicit so conversion remains deterministic without detail data.
  const gramsPerServing = useMemo(
    () => food?.defaultServingAmount ?? DEFAULT_GRAMS_PER_SERVING,
    [food],
  );

  // Build UI serving chips from real detail servings, with standard fallback units.
  const servingChoices = useMemo(
    () =>
      buildServingChoices({
        detailServings: food?.servings,
        defaultServingAmount: gramsPerServing,
      }),
    [food?.servings, gramsPerServing],
  );

  const [servingChoiceId, setServingChoiceId] = useState<string>(() =>
    resolveInitialServingChoiceId({
      choices: servingChoices,
      persistedUnitName: initialValues?.servingUnit,
    }),
  );

  const selectedServingChoice = useMemo(
    () =>
      servingChoices.find((choice) => choice.id === servingChoiceId) ??
      servingChoices[0],
    [servingChoices, servingChoiceId],
  );

  // Convert once and reuse everywhere to avoid mismatched grams between UI and payload.
  const estimatedGrams = useMemo(
    () =>
      selectedServingChoice
        ? toGramsFromChoice({
            amount: numericAmount,
            choice: selectedServingChoice,
          })
        : 0,
    [numericAmount, selectedServingChoice],
  );

  // Live nutrition preview mirrors backend snapshot math (per-100g scaled by grams factor).
  const preview = useMemo(
    () =>
      getNutritionPreview({
        grams: estimatedGrams,
        caloriesPer100g: food?.caloriesPerServing ?? 0,
        proteinPer100g: food?.proteinPer100g ?? 0,
        carbsPer100g: food?.carbsPer100g ?? 0,
        fatPer100g: food?.fatPer100g ?? 0,
      }),
    [estimatedGrams, food],
  );

  return (
    <ScreenContainer>
      <SectionCard title="Add Food">
        <Text style={styles.foodName}>{food?.name ?? 'Select food from search'}</Text>
        <Text style={styles.subtitle}>
          {mode === 'edit'
            ? 'Edit an existing diary entry.'
            : 'Fast entry flow optimized for meal logging.'}
        </Text>
      </SectionCard>

      <SectionCard title="Entry Details">
        <FoodEntryDetailsForm
          amount={amount}
          onChangeAmount={setAmount}
          servingChoices={servingChoices}
          selectedServingChoiceId={servingChoiceId}
          onSelectServingChoice={setServingChoiceId}
          timestamp={time}
          onChangeTimestamp={setTime}
          group={group}
          onChangeGroup={setGroup}
        />
      </SectionCard>

      <SectionCard title="Nutrition Preview">
        <NutritionPreviewPanel
          previewTotals={{
            calories: preview.calories,
            protein: preview.protein,
            carbs: preview.carbs,
            fat: preview.fat,
          }}
          goals={goals}
          estimatedGrams={estimatedGrams}
          ouncesEquivalent={round2(estimatedGrams / GRAMS_PER_OUNCE)}
          selectedServingChoice={selectedServingChoice}
        />
      </SectionCard>

      <View style={styles.actionRow}>
        {mode === 'edit' && onDelete ? (
          <Pressable style={styles.deleteButton} onPress={onDelete}>
            <Text style={styles.deleteLabel}>Remove from Diary</Text>
          </Pressable>
        ) : null}
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backLabel}>Back</Text>
        </Pressable>
        <PrimaryButton
          label={mode === 'edit' ? 'Save Changes' : 'Save to Diary'}
          onPress={() =>
            onSave({
              amount: numericAmount,
              servingUnit: selectedServingChoice?.unitName ?? 'serving',
              mealGroup: group,
              grams: estimatedGrams,
              loggedAt: new Date().toISOString(),
            })
          }
          disabled={!food || numericAmount <= 0}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  foodName: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  actionRow: {
    gap: 10,
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: colors.panel,
  },
  deleteLabel: {
    color: colors.danger,
    fontWeight: '700',
  },
  backButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: colors.panel,
  },
  backLabel: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
});
