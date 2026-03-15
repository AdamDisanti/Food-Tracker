import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { FoodSearchItem } from '../types/app';
import { colors } from '../theme/colors';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionCard } from '../components/SectionCard';
import { searchFoods } from '../api/foods';
import { FoodListItem } from '../components/FoodListItem';

type SearchTab = 'All' | 'Favorites';

// Search shell screen with tabs and empty-query recents behavior.
export function SearchScreen({
  onBack,
  onPickFood,
  recentFoods,
  favoriteFoods,
  onToggleFavorite,
}: {
  onBack: () => void;
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
      <View style={styles.headerBar}>
        <Pressable style={styles.backIconButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>

        <View style={styles.titleWrap}>
          <Text style={styles.headerTitle}>Search Foods</Text>
          <Text style={styles.headerSubtitle}>Find and save foods quickly</Text>
        </View>

        <View style={styles.menuDotsButton}>
          <Text style={styles.menuDotsLabel}>⋯</Text>
        </View>
      </View>

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
            <FoodListItem
              key={item.id}
              item={item}
              onPress={onPickFood}
              isFavorite={favoriteIds.has(item.id)}
              onToggleFavorite={(food, nextFavoriteState) => {
                void onToggleFavorite(food, nextFavoriteState);
              }}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>No foods found for this query.</Text>
        )}
      </SectionCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    marginTop: 2,
    marginBottom: 2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panel,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.panelMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '700',
  },
  titleWrap: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 4,
    paddingVertical: 4,
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  menuDotsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.panelMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuDotsLabel: {
    color: colors.textSecondary,
    fontSize: 22,
    lineHeight: 22,
    marginTop: -6,
  },
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
  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
  },
});
