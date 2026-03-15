import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TopLevelScreen } from '../types/app';
import { colors } from '../theme/colors';

const tabs: Array<{
  key: TopLevelScreen;
  icon: string;
  accessibilityLabel: string;
  isPrimaryAction?: boolean;
}> = [
  { key: 'Diary', icon: '📖', accessibilityLabel: 'Diary' },
  { key: 'Search', icon: '+', accessibilityLabel: 'Search and add food', isPrimaryAction: true },
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
            style={[
              styles.tab,
              tab.isPrimaryAction ? styles.primaryActionTab : styles.iconOnlyTab,
              isActive && !tab.isPrimaryAction && styles.iconOnlyTabActive,
              isActive && tab.isPrimaryAction && styles.primaryActionTabActive,
            ]}
            onPress={() => onSelect(tab.key)}
            accessibilityRole="button"
            accessibilityLabel={tab.accessibilityLabel}
          >
            <Text
              style={[
                styles.icon,
                tab.isPrimaryAction && styles.primaryActionIcon,
                isActive && !tab.isPrimaryAction && styles.iconActive,
              ]}
            >
              {tab.icon}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
    paddingHorizontal: 26,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOnlyTab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'transparent',
  },
  icon: {
    color: colors.textSecondary,
    fontSize: 30,
    lineHeight: 32,
  },
  iconOnlyTabActive: {
    backgroundColor: colors.panelMuted,
  },
  iconActive: {
    color: colors.textPrimary,
  },
  primaryActionTab: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: colors.accent,
    marginTop: -12,
  },
  primaryActionTabActive: {
    opacity: 0.92,
  },
  primaryActionIcon: {
    color: '#FFFFFF',
    fontSize: 42,
    lineHeight: 44,
    marginTop: -2,
  },
});
