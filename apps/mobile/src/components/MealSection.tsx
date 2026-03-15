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
  draggingItemId,
  activeDropTarget,
  onDragStart,
  onDragMove,
  onDragEnd,
  onReportDropZone,
}: {
  group: MealGroup;
  items: LoggedMealItem[];
  onAddPress: (group: MealGroup) => void;
  onItemPress: (item: LoggedMealItem) => void;
  onDragStart: (item: LoggedMealItem, pageX: number, pageY: number) => void;
  onDragMove: (pageX: number, pageY: number) => void;
  onDragEnd: () => void;
  onReportDropZone: (zone: { x: number; y: number; width: number; height: number }) => void;
  draggingItemId?: string | null;
  activeDropTarget?: MealGroup | null;
}) {
  const [expanded, setExpanded] = useState(true);
  const isDropTarget = activeDropTarget === group;

  return (
    <View
      style={[styles.container, isDropTarget && styles.dropTargetContainer]}
      onLayout={(event) => {
        event.currentTarget.measureInWindow((x, y, width, height) => {
          onReportDropZone({ x, y, width, height });
        });
      }}
    >
      <View style={styles.header}>
        <Pressable style={styles.groupToggle} onPress={() => setExpanded((prev) => !prev)}>
          <Text style={styles.title}>{expanded ? '▾' : '▸'} {group}</Text>
        </Pressable>
        <View style={styles.headerActions}>
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
            onPress={() => {
              if (draggingItemId === item.id) {
                return;
              }

              onItemPress(item);
            }}
            onLongPress={(event) => {
              onDragStart(item, event.nativeEvent.pageX, event.nativeEvent.pageY);
            }}
            onTouchMove={(event) => {
              if (draggingItemId !== item.id) {
                return;
              }

              onDragMove(event.nativeEvent.pageX, event.nativeEvent.pageY);
            }}
            onTouchEnd={() => {
              if (draggingItemId !== item.id) {
                return;
              }

              onDragEnd();
            }}
            delayLongPress={180}
          >
            <Text style={styles.itemLabel}>
              • {item.foodName} ({item.amount} {item.servingUnit})
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
  draggingRow: {
    borderColor: colors.accent,
    opacity: 0.55,
  },
  dropTargetContainer: {
    borderColor: colors.accent,
  },
  emptyState: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});
