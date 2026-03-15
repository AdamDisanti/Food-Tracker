import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TopLevelScreen } from '../types/app';
import { colors } from '../theme/colors';

const tabs: Array<{ key: TopLevelScreen; icon: string; accessibilityLabel: string }> = [
  { key: 'Diary', icon: '📖', accessibilityLabel: 'Diary' },
  { key: 'Search', icon: '⊕', accessibilityLabel: 'Search and add food' },
  { key: 'Settings', icon: '⚙︎', accessibilityLabel: 'Settings' },
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
            accessibilityRole="button"
            accessibilityLabel={tab.accessibilityLabel}
          >
            <Text style={[styles.icon, isActive && styles.iconActive]}>{tab.icon}</Text>
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
  icon: {
    color: colors.textSecondary,
    fontSize: 20,
    lineHeight: 22,
  },
  iconActive: {
    color: colors.textPrimary,
  },
});
