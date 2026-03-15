import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
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
  onStartDragItem,
  onDropToGroup,
  onCancelDrag,
  draggingItem,
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
  onStartDragItem: (item: LoggedMealItem) => void;
  onDropToGroup: (group: MealGroup) => void;
  onCancelDrag: () => void;
  draggingItem: LoggedMealItem | null;
  mealItems: Record<MealGroup, LoggedMealItem[]>;
  totals: { calories: number; protein: number; carbs: number; fat: number };
  goals?: MacroGoals;
}) {
  return (
    <ScreenContainer>
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
        {draggingItem ? (
          <View style={styles.dragBanner}>
            <Text style={styles.dragBannerText}>
              Dragging: {draggingItem.foodName}. Drop into another meal section.
            </Text>
            <Pressable onPress={onCancelDrag} style={styles.dragCancelButton}>
              <Text style={styles.dragCancelLabel}>Cancel</Text>
            </Pressable>
          </View>
        ) : null}

        {(['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as MealGroup[]).map((group) => (
          <MealSection
            key={group}
            group={group}
            items={mealItems[group]}
            onAddPress={onAddFromGroup}
            onItemPress={onEditLoggedItem}
            onStartDrag={onStartDragItem}
            onDropToGroup={onDropToGroup}
            draggingItemId={draggingItem?.id}
            draggingFromGroup={draggingItem ? toUiMealGroup(draggingItem.mealGroup) : null}
          />
        ))}
      </SectionCard>

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
  dragBanner: {
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 10,
    backgroundColor: colors.panelMuted,
    padding: 10,
    gap: 8,
  },
  dragBannerText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  dragCancelButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panel,
  },
  dragCancelLabel: {
    color: colors.textSecondary,
    fontWeight: '700',
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
