import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MealGroup } from '../types/app';
import { colors } from '../theme/colors';
import { LoggedMealItem } from '../api/logs';

// Meal section card used on the diary screen for each meal group bucket.
export function MealSection({
  group,
  items,
  onAddPress,
  onItemPress,
  onStartDrag,
  onDropToGroup,
  draggingItemId,
  draggingFromGroup,
}: {
  group: MealGroup;
  items: LoggedMealItem[];
  onAddPress: (group: MealGroup) => void;
  onItemPress: (item: LoggedMealItem) => void;
  onStartDrag: (item: LoggedMealItem) => void;
  onDropToGroup: (group: MealGroup) => void;
  draggingItemId?: string | null;
  draggingFromGroup?: MealGroup | null;
}) {
  const [expanded, setExpanded] = useState(true);
  const canDropHere = Boolean(draggingItemId) && draggingFromGroup !== group;

  return (
    <View style={[styles.container, canDropHere && styles.dropTargetContainer]}>
      <View style={styles.header}>
        <Pressable style={styles.groupToggle} onPress={() => setExpanded((prev) => !prev)}>
          <Text style={styles.title}>{expanded ? '▾' : '▸'} {group}</Text>
        </Pressable>
        <View style={styles.headerActions}>
          {canDropHere ? (
            <Pressable onPress={() => onDropToGroup(group)} style={styles.dropButton}>
              <Text style={styles.dropButtonLabel}>Drop Here</Text>
            </Pressable>
          ) : null}
          <Pressable onPress={() => onAddPress(group)} style={styles.addButton}>
            <Text style={styles.addButtonLabel}>＋</Text>
          </Pressable>
        </View>
      </View>

      {expanded ? (
        items.length > 0 ? (
        items.map((item) => (
          <Pressable
            key={item.id}
            style={[styles.itemRow, draggingItemId === item.id && styles.draggingRow]}
            onPress={() => onItemPress(item)}
            onLongPress={() => onStartDrag(item)}
            delayLongPress={180}
          >
            <Text style={styles.itemLabel}>
              • {item.foodName} ({item.amount} {item.servingUnit})
            </Text>
            <Text style={styles.itemHint}>
              {draggingItemId === item.id ? 'Dragging… choose Drop Here in another meal' : 'Tap to edit • Long press to drag'}
            </Text>
          </Pressable>
        ))
      ) : (
        <Text style={styles.emptyState}>No foods logged yet.</Text>
      )
      ) : null}
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
  groupToggle: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    fontSize: 16,
    lineHeight: 16,
  },
  dropButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.panelMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dropButtonLabel: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
  itemLabel: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  itemRow: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panelMuted,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 4,
  },
  itemHint: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  draggingRow: {
    borderColor: colors.accent,
  },
  dropTargetContainer: {
    borderColor: colors.accent,
  },
  emptyState: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});
