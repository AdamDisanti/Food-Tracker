import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { favoriteFoods, recentFoods } from '../data/mockData';
import { FoodSearchItem } from '../types/app';
import { colors } from '../theme/colors';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionCard } from '../components/SectionCard';

type SearchTab = 'All' | 'Favorites';

// Search shell screen with tabs and empty-query recents behavior.
export function SearchScreen({
  onPickFood,
}: {
  onPickFood: (item: FoodSearchItem) => void;
}) {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<SearchTab>('All');

  const sourceList = tab === 'All' ? recentFoods : favoriteFoods;

  const displayList = useMemo(() => {
    if (!query.trim()) {
      // MVP behavior: show recents when query is empty.
      return recentFoods;
    }

    const q = query.toLowerCase();
    return sourceList.filter((item) => item.name.toLowerCase().includes(q));
  }, [query, sourceList]);

  return (
    <ScreenContainer>
      <SectionCard title="Search Food">
        <TextInput
          placeholder="Search by food or brand"
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />

        <View style={styles.tabsRow}>
          {(['All', 'Favorites'] as SearchTab[]).map((item) => {
            const active = tab === item;
            return (
              <Pressable
                key={item}
                onPress={() => setTab(item)}
                style={[styles.tab, active && styles.tabActive]}
              >
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{item}</Text>
              </Pressable>
            );
          })}
        </View>
      </SectionCard>

      <SectionCard title={query.trim() ? 'Results' : 'Recent Foods'}>
        {displayList.length > 0 ? (
          displayList.map((item) => (
            <Pressable key={item.id} style={styles.row} onPress={() => onPickFood(item)}>
              <View>
                <Text style={styles.foodName}>{item.name}</Text>
                {!!item.subtitle && <Text style={styles.subtitle}>{item.subtitle}</Text>}
              </View>
              <Text style={styles.kcalLabel}>{item.caloriesPerServing} kcal</Text>
            </Pressable>
          ))
        ) : (
          <Text style={styles.emptyText}>No foods found for this query.</Text>
        )}
      </SectionCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panelMuted,
    borderRadius: 10,
    color: colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panelMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tabActive: {
    borderColor: colors.accent,
  },
  tabLabel: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: colors.textPrimary,
  },
  row: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panelMuted,
    padding: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: 2,
    fontSize: 12,
  },
  kcalLabel: {
    color: colors.warning,
    fontWeight: '700',
    fontSize: 12,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});
