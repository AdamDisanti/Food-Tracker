import { ReactNode, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionCard } from '../components/SectionCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { AddFoodSaveInput, FoodSearchItem, MealGroup } from '../types/app';
import { colors } from '../theme/colors';

const servingOptions = ['serving', 'grams', 'oz'];

// Add food shell form with default group assignment and simple nutrition preview.
export function AddFoodScreen({
  food,
  defaultGroup,
  onSave,
  onBack,
}: {
  food: FoodSearchItem | null;
  defaultGroup: MealGroup;
  onSave: (input: AddFoodSaveInput) => void;
  onBack: () => void;
}) {
  const [amount, setAmount] = useState('1');
  const [serving, setServing] = useState('serving');
  const [time, setTime] = useState('12:30');
  const [group, setGroup] = useState<MealGroup>(defaultGroup);

  const numericAmount = Number(amount) || 0;
  const calories = useMemo(() => (food?.caloriesPerServing ?? 0) * numericAmount, [food, numericAmount]);
  const estimatedGrams = useMemo(() => {
    // Until serving conversion tables are wired, use a simple grams estimate for snapshot persistence.
    if (serving === 'grams') {
      return numericAmount;
    }
    if (serving === 'oz') {
      return numericAmount * 28.35;
    }
    return numericAmount * 100;
  }, [numericAmount, serving]);

  return (
    <ScreenContainer>
      <SectionCard title="Add Food">
        <Text style={styles.foodName}>{food?.name ?? 'Select food from search'}</Text>
        <Text style={styles.subtitle}>Fast entry flow optimized for meal logging.</Text>
      </SectionCard>

      <SectionCard title="Entry Details">
        <LabeledField label="Amount">
          <TextInput
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            style={styles.input}
          />
        </LabeledField>

        <LabeledField label="Serving Size">
          <View style={styles.chipRow}>
            {servingOptions.map((option) => {
              const active = serving === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => setServing(option)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{option}</Text>
                </Pressable>
              );
            })}
          </View>
        </LabeledField>

        <LabeledField label="Timestamp">
          <TextInput value={time} onChangeText={setTime} style={styles.input} />
        </LabeledField>

        <LabeledField label="Group">
          <View style={styles.chipRow}>
            {(['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as MealGroup[]).map((item) => {
              const active = group === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setGroup(item)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{item}</Text>
                </Pressable>
              );
            })}
          </View>
        </LabeledField>
      </SectionCard>

      <SectionCard title="Nutrition Preview">
        <Text style={styles.previewLine}>Calories: {Math.round(calories)} kcal</Text>
        <Text style={styles.previewSub}>Protein / Carbs / Fat preview will be wired in Milestone 2-3.</Text>
      </SectionCard>

      <View style={styles.actionRow}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backLabel}>Back</Text>
        </Pressable>
        <PrimaryButton
          label="Save to Diary"
          onPress={() =>
            onSave({
              amount: numericAmount,
              servingUnit: serving,
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

function LabeledField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
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
  field: {
    gap: 6,
  },
  fieldLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.panelMuted,
    color: colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.chip,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  chipLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  chipLabelActive: {
    color: '#FFFFFF',
  },
  previewLine: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  previewSub: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  actionRow: {
    gap: 10,
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
