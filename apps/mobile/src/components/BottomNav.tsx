import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TopLevelScreen } from '../types/app';
import { colors } from '../theme/colors';

const tabs: Array<{ key: TopLevelScreen; label: string }> = [
  { key: 'Diary', label: 'Diary' },
  { key: 'Search', label: 'Search' },
  { key: 'Settings', label: 'Settings' },
];

// Lightweight tab row for Milestone 1 before full navigation package wiring.
export function BottomNav({
  active,
  onSelect,
}: {
  active: TopLevelScreen;
  onSelect: (screen: TopLevelScreen) => void;
}) {
  return (
    <View style={styles.row}>
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <Pressable
            key={tab.key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onSelect(tab.key)}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panel,
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabActive: {
    borderColor: colors.accent,
    backgroundColor: colors.panelMuted,
  },
  label: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  labelActive: {
    color: colors.textPrimary,
  },
});
