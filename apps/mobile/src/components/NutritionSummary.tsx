import { StyleSheet, Text, View } from 'react-native';
import { MacroGoals, MacroTotals } from '../types/app';
import { colors } from '../theme/colors';

function ProgressRow({ label, value, goal }: { label: string; value: number; goal: number }) {
  // Guard for zero goals so the progress bar never renders NaN/Infinity widths.
  const ratio = goal > 0 ? Math.min(value / goal, 1) : 0;
  return (
    <View style={styles.progressRow}>
      <View style={styles.progressLabelRow}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{value} / {goal}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
      </View>
    </View>
  );
}

// Displays consumed macros and optional goal-based progress bars.
export function NutritionSummary({ totals, goals }: { totals: MacroTotals; goals?: MacroGoals }) {
  // Milestone 5 compact mode: remove metric tiles and keep concise progress rows only.
  // If goals are absent, we fall back to text totals to avoid rendering empty tracks.
  return (
    <View style={styles.container}>
      {goals ? (
        <View style={styles.progressSection}>
          <ProgressRow label="Calories" value={totals.calories} goal={goals.calories} />
          <ProgressRow label="Protein" value={totals.protein} goal={goals.protein} />
          <ProgressRow label="Carbs" value={totals.carbs} goal={goals.carbs} />
          <ProgressRow label="Fat" value={totals.fat} goal={goals.fat} />
        </View>
      ) : (
        <View style={styles.progressSection}>
          <Text style={styles.metricValue}>Calories: {totals.calories}</Text>
          <Text style={styles.metricValue}>Protein: {totals.protein}g</Text>
          <Text style={styles.metricValue}>Carbs: {totals.carbs}g</Text>
          <Text style={styles.metricValue}>Fat: {totals.fat}g</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  metricValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  progressSection: {
    gap: 6,
  },
  progressRow: {
    gap: 4,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  track: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.panelMuted,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.success,
  },
});
