import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { PrimaryButton } from './PrimaryButton';

// Shell-style calendar modal for Milestone 1: month nav, day pick, confirm/cancel.
export function CalendarModal({
  visible,
  monthLabel,
  selectedDay,
  onSelectDay,
  onClose,
  onConfirm,
  onPrevMonth,
  onNextMonth,
}: {
  visible: boolean;
  monthLabel: string;
  selectedDay: number;
  onSelectDay: (day: number) => void;
  onClose: () => void;
  onConfirm: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.panel}>
          <View style={styles.headerRow}>
            <Pressable onPress={onPrevMonth}>
              <Text style={styles.nav}>‹</Text>
            </Pressable>
            <Text style={styles.monthLabel}>{monthLabel}</Text>
            <Pressable onPress={onNextMonth}>
              <Text style={styles.nav}>›</Text>
            </Pressable>
          </View>

          <View style={styles.grid}>
            {Array.from({ length: 30 }, (_, index) => index + 1).map((day) => {
              const active = selectedDay === day;
              return (
                <Pressable
                  key={day}
                  style={[styles.day, active && styles.dayActive]}
                  onPress={() => onSelectDay(day)}
                >
                  <Text style={[styles.dayLabel, active && styles.dayLabelActive]}>{day}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelLabel}>Cancel</Text>
            </Pressable>
            <PrimaryButton label="Confirm" onPress={onConfirm} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 18,
  },
  panel: {
    backgroundColor: colors.panel,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nav: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    paddingHorizontal: 8,
  },
  monthLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  day: {
    width: '12.8%',
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.panelMuted,
  },
  dayActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  dayLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 12,
  },
  dayLabelActive: {
    color: '#FFFFFF',
  },
  actions: {
    gap: 8,
  },
  cancelBtn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 11,
    alignItems: 'center',
  },
  cancelLabel: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
});
