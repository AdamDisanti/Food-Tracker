import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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
    <ScreenContainer scroll={false} horizontalPadding={8}>
      <View style={styles.layout}>
        <View style={styles.headerBar}>
          <Pressable style={styles.backIconButton} onPress={onBack}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>

          <View style={styles.titleWrap}>
            <Text style={styles.headerTitle} numberOfLines={2}>
              {food?.name ?? 'Search and Select Food'}
            </Text>
          </View>

          <View style={styles.menuDotsButton}>
            <Text style={styles.menuDotsLabel}>⋯</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
        </ScrollView>

        <View style={styles.actionRow}>
          {mode === 'edit' && onDelete ? (
            <Pressable style={styles.deleteButton} onPress={onDelete}>
              <Text style={styles.deleteLabel}>Remove from Diary</Text>
            </Pressable>
          ) : null}
          <PrimaryButton
            label="Save"
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
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    paddingBottom: 16,
  },
  headerBar: {
    marginTop: 2,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panel,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.panelMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '700',
  },
  titleWrap: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 4,
    paddingVertical: 4,
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
  },
  menuDotsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.panelMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuDotsLabel: {
    color: colors.textSecondary,
    fontSize: 22,
    lineHeight: 22,
    marginTop: -6,
  },
  scrollContent: {
    gap: 10,
    paddingBottom: 96,
  },
  actionRow: {
    gap: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
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
});
