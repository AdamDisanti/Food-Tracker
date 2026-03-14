import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MealGroup } from '../types/app';
import { colors } from '../theme/colors';

// Meal section card used on the diary screen for each meal group bucket.
export function MealSection({
  group,
  items,
  onAddPress,
}: {
  group: MealGroup;
  items: string[];
  onAddPress: (group: MealGroup) => void;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{group}</Text>
        <Pressable onPress={() => onAddPress(group)} style={styles.addButton}>
          <Text style={styles.addButtonLabel}>＋ Add</Text>
        </Pressable>
      </View>

      {items.length > 0 ? (
        items.map((item) => (
          <Text key={item} style={styles.itemLabel}>
            • {item}
          </Text>
        ))
      ) : (
        <Text style={styles.emptyState}>No foods logged yet.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.panel,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  addButton: {
    borderRadius: 8,
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addButtonLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  itemLabel: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  emptyState: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});
