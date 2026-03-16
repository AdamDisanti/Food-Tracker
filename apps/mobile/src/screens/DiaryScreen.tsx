import { useMemo, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MacroGoals, MealGroup } from '../types/app';
import { colors } from '../theme/colors';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionCard } from '../components/SectionCard';
import { NutritionSummary } from '../components/NutritionSummary';
import { MealSection } from '../components/MealSection';
import { CalendarModal } from '../components/CalendarModal';
import { LoggedMealItem } from '../api/logs';

// Diary shell screen: date header, macro summary, meal sections, and add entry point.
export function DiaryScreen({
  dateLabel,
  onPrevDay,
  onNextDay,
  onOpenCalendar,
  onCloseCalendar,
  calendarVisible,
  calendarMonthLabel,
  selectedDay,
  onSelectDay,
  onConfirmDay,
  onPrevMonth,
  onNextMonth,
  onAddFromGroup,
  onEditLoggedItem,
  onMoveLoggedItem,
  mealItems,
  totals,
  goals,
}: {
  dateLabel: string;
  onPrevDay: () => void;
  onNextDay: () => void;
  onOpenCalendar: () => void;
  onCloseCalendar: () => void;
  calendarVisible: boolean;
  calendarMonthLabel: string;
  selectedDay: number;
  onSelectDay: (day: number) => void;
  onConfirmDay: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onAddFromGroup: (group: MealGroup) => void;
  onEditLoggedItem: (item: LoggedMealItem) => void;
  onMoveLoggedItem: (item: LoggedMealItem, targetGroup: MealGroup) => void;
  mealItems: Record<MealGroup, LoggedMealItem[]>;
  totals: { calories: number; protein: number; carbs: number; fat: number };
  goals?: MacroGoals;
}) {
  const [liftAnim] = useState(() => new Animated.Value(0));
  const [drag, setDrag] = useState<{
    item: LoggedMealItem;
    sourceGroup: MealGroup;
    x: number;
    y: number;
    targetGroup: MealGroup | null;
  } | null>(null);

  const [dropZones, setDropZones] = useState<Partial<Record<MealGroup, { x: number; y: number; width: number; height: number }>>>({});

  const activeDropTarget = drag?.targetGroup ?? null;

  const dragHint = useMemo(() => {
    if (!drag) {
      return null;
    }

    return `${drag.item.foodName} (${drag.item.amount} ${drag.item.servingUnit})`;
  }, [drag]);

  const resolveTargetGroup = (x: number, y: number): MealGroup | null => {
    const groups: MealGroup[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
    for (const group of groups) {
      const zone = dropZones[group];
      if (!zone) {
        continue;
      }

      const withinX = x >= zone.x && x <= zone.x + zone.width;
      const withinY = y >= zone.y && y <= zone.y + zone.height;
      if (withinX && withinY) {
        return group;
      }
    }

    return null;
  };

  const startDrag = (item: LoggedMealItem, pageX: number, pageY: number) => {
    const sourceGroup = toUiMealGroup(item.mealGroup);
    void Haptics.selectionAsync();
    Animated.spring(liftAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 7,
      tension: 120,
    }).start();

    setDrag({
      item,
      sourceGroup,
      x: pageX,
      y: pageY,
      targetGroup: null,
    });
  };

  const moveDrag = (pageX: number, pageY: number) => {
    setDrag((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        x: pageX,
        y: pageY,
        targetGroup: resolveTargetGroup(pageX, pageY),
      };
    });
  };

  const endDrag = () => {
    setDrag((prev) => {
      if (!prev) {
        return prev;
      }

      const target = prev.targetGroup;
      if (target && target !== prev.sourceGroup) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onMoveLoggedItem(prev.item, target);
      }

      return null;
    });

    Animated.spring(liftAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
      tension: 110,
    }).start();
  };

  return (
    <ScreenContainer scrollEnabled={!drag}>
      {/* Milestone 5: compact date header card by removing redundant title/helper copy. */}
      <SectionCard>
        <View style={styles.headerRow}>
          <Pressable onPress={onPrevDay} style={styles.dateNavButton}>
            <Text style={styles.dateNavLabel}>‹</Text>
          </Pressable>

          <Pressable onPress={onOpenCalendar} style={styles.datePill}>
            <Text style={styles.dateLabel}>{dateLabel}</Text>
          </Pressable>

          <Pressable onPress={onNextDay} style={styles.dateNavButton}>
            <Text style={styles.dateNavLabel}>›</Text>
          </Pressable>
        </View>
      </SectionCard>

      <SectionCard title="Nutrition Summary">
        <NutritionSummary totals={totals} goals={goals} />
      </SectionCard>

      <SectionCard title="Meals">
        {(['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as MealGroup[]).map((group) => (
          <MealSection
            key={group}
            group={group}
            items={mealItems[group]}
            onAddPress={onAddFromGroup}
            onItemPress={onEditLoggedItem}
            draggingItemId={drag?.item.id ?? null}
            activeDropTarget={activeDropTarget}
            onDragStart={startDrag}
            onDragMove={moveDrag}
            onDragEnd={endDrag}
            onReportDropZone={(zone: { x: number; y: number; width: number; height: number }) => {
              setDropZones((prev) => ({
                ...prev,
                [group]: zone,
              }));
            }}
          />
        ))}
      </SectionCard>

      {drag ? (
        <View pointerEvents="none" style={styles.dragGhostWrap}>
          <Animated.View
            style={[
              styles.dragGhost,
              {
                left: 10,
                right: 10,
                top: Math.max(6, drag.y - 24),
                transform: [
                  {
                    scale: liftAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.98, 1.03],
                    }),
                  },
                ],
                opacity: liftAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.92, 1],
                }),
              },
            ]}
          >
            <Text style={styles.dragGhostText} numberOfLines={1}>{dragHint}</Text>
            <Text style={styles.dragGhostTarget}>
              {activeDropTarget ? `Drop into ${activeDropTarget}` : 'Drag over a meal section and release'}
            </Text>
          </Animated.View>
        </View>
      ) : null}

      <CalendarModal
        visible={calendarVisible}
        monthLabel={calendarMonthLabel}
        selectedDay={selectedDay}
        onSelectDay={onSelectDay}
        onClose={onCloseCalendar}
        onConfirm={onConfirmDay}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
      />
    </ScreenContainer>
  );
}

// Menu shown after tapping meal section plus button.
export function AddActionMenu({
  visible,
  mealGroup,
  onClose,
  onSearchFood,
  onScanBarcode,
}: {
  visible: boolean;
  mealGroup: MealGroup | null;
  onClose: () => void;
  onSearchFood: () => void;
  onScanBarcode: () => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.menuOverlay}>
        <View style={styles.menuCard}>
          <Text style={styles.menuTitle}>Add to {mealGroup ?? 'Meal'}</Text>

          <Pressable style={styles.menuPrimaryAction} onPress={onSearchFood}>
            <Text style={styles.menuPrimaryLabel}>Search Food</Text>
          </Pressable>

          <Pressable style={styles.menuSecondaryAction} onPress={onScanBarcode}>
            <Text style={styles.menuSecondaryLabel}>Scan Barcode (Coming Soon)</Text>
          </Pressable>

          <Pressable style={styles.menuCancelAction} onPress={onClose}>
            <Text style={styles.menuCancelLabel}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateNavButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panelMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateNavLabel: {
    color: colors.textPrimary,
    fontSize: 22,
    lineHeight: 24,
  },
  datePill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 999,
    backgroundColor: colors.panelMuted,
  },
  dateLabel: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  dragGhostWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  dragGhost: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.panel,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.34,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  dragGhostText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
  dragGhostTarget: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 18,
  },
  menuCard: {
    backgroundColor: colors.panel,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 10,
  },
  menuTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  menuPrimaryAction: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  menuPrimaryLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  menuSecondaryAction: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panelMuted,
    paddingVertical: 12,
    alignItems: 'center',
  },
  menuSecondaryLabel: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
  menuCancelAction: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  menuCancelLabel: {
    color: colors.textSecondary,
  },
});

function toUiMealGroup(group: 'breakfast' | 'lunch' | 'dinner' | 'snacks'): MealGroup {
  return `${group[0].toUpperCase()}${group.slice(1)}` as MealGroup;
}
