import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TopLevelScreen } from '../types/app';
import { colors } from '../theme/colors';

const tabs: Array<{
  key: TopLevelScreen;
  icon: 'diary' | 'plus' | 'settings';
  accessibilityLabel: string;
  isPrimaryAction?: boolean;
}> = [
  { key: 'Diary', icon: 'diary', accessibilityLabel: 'Diary' },
  { key: 'Search', icon: 'plus', accessibilityLabel: 'Search and add food', isPrimaryAction: true },
  { key: 'Settings', icon: 'settings', accessibilityLabel: 'Settings' },
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
            {tab.icon === 'diary' ? (
              <DiaryIcon active={isActive} />
            ) : (
              <Text
                style={[
                  styles.icon,
                  tab.isPrimaryAction && styles.primaryActionIcon,
                  isActive && !tab.isPrimaryAction && styles.iconActive,
                ]}
              >
                {tab.icon === 'settings' ? '⚙︎' : '+'}
              </Text>
            )}
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
    paddingTop: 6,
    paddingBottom: 4,
    paddingHorizontal: 22,
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
    fontSize: 28,
    lineHeight: 30,
  },
  iconOnlyTabActive: {
    backgroundColor: 'rgba(120, 170, 235, 0.18)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  iconActive: {
    color: colors.textPrimary,
  },
  primaryActionTab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent,
    marginTop: 2,
    shadowColor: colors.accent,
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  primaryActionTabActive: {
    opacity: 0.92,
  },
  primaryActionIcon: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 32,
    marginTop: -1,
  },
  diaryIconWrap: {
    width: 30,
    height: 24,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  diaryPage: {
    width: 13,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    borderRadius: 3,
    backgroundColor: 'transparent',
  },
  diaryPageLeft: {
    borderTopRightRadius: 1,
    borderBottomRightRadius: 1,
  },
  diaryPageRight: {
    borderTopLeftRadius: 1,
    borderBottomLeftRadius: 1,
    marginLeft: -2,
  },
  diarySpine: {
    position: 'absolute',
    left: '50%',
    marginLeft: -1,
    top: 2,
    bottom: 2,
    width: 2,
    backgroundColor: colors.textSecondary,
    borderRadius: 2,
  },
  diaryIconActive: {
    borderColor: colors.textPrimary,
  },
  diarySpineActive: {
    backgroundColor: colors.textPrimary,
  },
});

function DiaryIcon({ active }: { active: boolean }) {
  return (
    <View style={styles.diaryIconWrap}>
      <View style={[styles.diaryPage, styles.diaryPageLeft, active && styles.diaryIconActive]} />
      <View style={[styles.diaryPage, styles.diaryPageRight, active && styles.diaryIconActive]} />
      <View style={[styles.diarySpine, active && styles.diarySpineActive]} />
    </View>
  );
}
