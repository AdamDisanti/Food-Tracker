import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MealGroup } from '../types/app';
import { colors } from '../theme/colors';
import { ServingChoice } from '../utils/nutrition';

/**
 * Reusable form section for Add + Edit food entry details.
 *
 * Why extracted:
 * - Add flow (from search) and Edit flow share the same fields/interaction model.
 * - Keeping this in one component enforces UI/behavior parity going forward.
 */
export function FoodEntryDetailsForm({
  amount,
  onChangeAmount,
  servingChoices,
  selectedServingChoiceId,
  onSelectServingChoice,
  timestamp,
  onChangeTimestamp,
  group,
  onChangeGroup,
}: {
  amount: string;
  onChangeAmount: (value: string) => void;
  servingChoices: ServingChoice[];
  selectedServingChoiceId: string;
  onSelectServingChoice: (id: string) => void;
  timestamp: string;
  onChangeTimestamp: (value: string) => void;
  group: MealGroup;
  onChangeGroup: (group: MealGroup) => void;
}) {
  return (
    <>
      <LabeledField label="Amount">
        <TextInput
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={onChangeAmount}
          style={styles.input}
        />
      </LabeledField>

      <LabeledField label="Serving Size">
        <View style={styles.chipRow}>
          {servingChoices.map((option) => {
            const active = selectedServingChoiceId === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => onSelectServingChoice(option.id)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </LabeledField>

      <LabeledField label="Timestamp">
        <TextInput value={timestamp} onChangeText={onChangeTimestamp} style={styles.input} />
      </LabeledField>

      <LabeledField label="Group">
        <View style={styles.chipRow}>
          {(['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as MealGroup[]).map((item) => {
            const active = group === item;
            return (
              <Pressable
                key={item}
                onPress={() => onChangeGroup(item)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{item}</Text>
              </Pressable>
            );
          })}
        </View>
      </LabeledField>
    </>
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
});
