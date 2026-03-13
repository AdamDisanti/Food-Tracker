import { StyleSheet, Text, View } from 'react-native';
import { MacroGoals, MacroTotals } from '../types/app';
import { colors } from '../theme/colors';

function ProgressRow({ label, value, goal }: { label: string; value: number; goal: number }) {
  const ratio = Math.min(value / goal, 1);
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
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        <MetricTile label="Calories" value={totals.calories} />
        <MetricTile label="Protein" value={totals.protein} suffix="g" />
        <MetricTile label="Carbs" value={totals.carbs} suffix="g" />
        <MetricTile label="Fat" value={totals.fat} suffix="g" />
      </View>

      {goals ? (
        <View style={styles.progressSection}>
          <ProgressRow label="Calories" value={totals.calories} goal={goals.calories} />
          <ProgressRow label="Protein" value={totals.protein} goal={goals.protein} />
          <ProgressRow label="Carbs" value={totals.carbs} goal={goals.carbs} />
          <ProgressRow label="Fat" value={totals.fat} goal={goals.fat} />
        </View>
      ) : null}
    </View>
  );
}

function MetricTile({ label, value, suffix = '' }: { label: string; value: number; suffix?: string }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}{suffix}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tile: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: colors.panelMuted,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  metricValue: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  progressSection: {
    gap: 8,
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
