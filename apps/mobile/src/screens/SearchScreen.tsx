import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { FoodSearchItem } from '../types/app';
import { colors } from '../theme/colors';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionCard } from '../components/SectionCard';
import { searchFoods } from '../api/foods';

type SearchTab = 'All' | 'Favorites';

// Search shell screen with tabs and empty-query recents behavior.
export function SearchScreen({
  onPickFood,
  recentFoods,
  favoriteFoods,
  onToggleFavorite,
}: {
  onPickFood: (item: FoodSearchItem) => void;
  recentFoods: FoodSearchItem[];
  favoriteFoods: FoodSearchItem[];
  onToggleFavorite: (food: FoodSearchItem, shouldFavorite: boolean) => Promise<void>;
}) {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<SearchTab>('All');
  const [apiResults, setApiResults] = useState<FoodSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sourceList = tab === 'All' ? recentFoods : favoriteFoods;
  const favoriteIds = useMemo(() => new Set(favoriteFoods.map((item) => item.id)), [favoriteFoods]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (tab !== 'All' || !query.trim()) {
        setApiResults([]);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const foods = await searchFoods(query.trim());
        if (!cancelled) {
          setApiResults(foods);
        }
      } catch (err) {
        if (!cancelled) {
          setApiResults([]);
          setError(err instanceof Error ? err.message : 'Search failed');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [query, tab]);

  const displayList = useMemo(() => {
    if (!query.trim()) {
      // Empty query shows recents for All tab and favorites for Favorites tab.
      return tab === 'All' ? recentFoods : favoriteFoods;
    }

    if (tab === 'All') {
      return apiResults;
    }

    const q = query.toLowerCase();
    return sourceList.filter((item) => item.name.toLowerCase().includes(q));
  }, [query, sourceList, apiResults, tab, recentFoods, favoriteFoods]);

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
        {isLoading ? <Text style={styles.emptyText}>Searching...</Text> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {displayList.length > 0 ? (
          displayList.map((item) => (
            <Pressable key={item.id} style={styles.row} onPress={() => onPickFood(item)}>
              <View>
                <Text style={styles.foodName}>{item.name}</Text>
                {!!item.subtitle && <Text style={styles.subtitle}>{item.subtitle}</Text>}
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.kcalLabel}>{item.caloriesPerServing} kcal</Text>
                <Pressable
                  onPress={() => {
                    const currentlyFavorite = favoriteIds.has(item.id);
                    void onToggleFavorite(item, !currentlyFavorite);
                  }}
                  style={styles.favoriteButton}
                >
                  <Text style={styles.favoriteText}>{favoriteIds.has(item.id) ? '★' : '☆'}</Text>
                </Pressable>
              </View>
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
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  favoriteButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.panel,
  },
  favoriteText: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
  },
});
