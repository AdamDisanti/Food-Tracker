import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionCard } from '../components/SectionCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';

// Settings shell for manual macro goal entry in Milestone 1.
export function SettingsScreen() {
  const [calories, setCalories] = useState('2200');
  const [protein, setProtein] = useState('170');
  const [carbs, setCarbs] = useState('220');
  const [fat, setFat] = useState('70');

  return (
    <ScreenContainer>
      <SectionCard title="Daily Goals">
        <GoalInput label="Calories" value={calories} onChangeText={setCalories} />
        <GoalInput label="Protein (g)" value={protein} onChangeText={setProtein} />
        <GoalInput label="Carbs (g)" value={carbs} onChangeText={setCarbs} />
        <GoalInput label="Fat (g)" value={fat} onChangeText={setFat} />

        <PrimaryButton label="Save Goals" onPress={() => {}} />
        <Text style={styles.helper}>Backend wiring for settings save will be added in Milestone 4.</Text>
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
