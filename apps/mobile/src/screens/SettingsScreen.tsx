import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionCard } from '../components/SectionCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { MacroGoals } from '../types/app';

// Settings shell for manual macro goal entry in Milestone 1.
export function SettingsScreen({
  initialGoals,
  onSaveGoals,
}: {
  initialGoals: MacroGoals | null;
  onSaveGoals: (goals: MacroGoals) => Promise<void>;
}) {
  const [calories, setCalories] = useState(String(initialGoals?.calories ?? 2200));
  const [protein, setProtein] = useState(String(initialGoals?.protein ?? 170));
  const [carbs, setCarbs] = useState(String(initialGoals?.carbs ?? 220));
  const [fat, setFat] = useState(String(initialGoals?.fat ?? 70));
  const [status, setStatus] = useState<string | null>(null);

  return (
    <ScreenContainer>
      <SectionCard title="Daily Goals">
        <GoalInput label="Calories" value={calories} onChangeText={setCalories} />
        <GoalInput label="Protein (g)" value={protein} onChangeText={setProtein} />
        <GoalInput label="Carbs (g)" value={carbs} onChangeText={setCarbs} />
        <GoalInput label="Fat (g)" value={fat} onChangeText={setFat} />

        <PrimaryButton
          label="Save Goals"
          onPress={() => {
            const payload: MacroGoals = {
              calories: Math.max(0, Number(calories) || 0),
              protein: Math.max(0, Number(protein) || 0),
              carbs: Math.max(0, Number(carbs) || 0),
              fat: Math.max(0, Number(fat) || 0),
            };

            setStatus('Saving...');
            void onSaveGoals(payload)
              .then(() => setStatus('Saved.'))
              .catch((err: Error) => setStatus(err.message || 'Save failed'));
          }}
        />
        <Text style={styles.helper}>{status ?? 'Update daily nutrition goals used in diary progress bars.'}</Text>
      </SectionCard>
    </ScreenContainer>
  );
}

function GoalInput({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        keyboardType="number-pad"
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panelMuted,
    color: colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  helper: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});
