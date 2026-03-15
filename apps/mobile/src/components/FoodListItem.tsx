import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FoodSearchItem } from '../types/app';
import { colors } from '../theme/colors';

/**
 * Reusable food row used by list-based food selectors.
 *
 * Why this exists:
 * - Search, Recents, and Favorites should share one visual/interaction primitive.
 * - Future UI updates can happen once here and immediately apply everywhere it is used.
 */
export function FoodListItem({
  item,
  onPress,
  isFavorite,
  onToggleFavorite,
}: {
  item: FoodSearchItem;
  onPress: (item: FoodSearchItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (item: FoodSearchItem, nextFavoriteState: boolean) => void;
}) {
  return (
    <Pressable style={styles.row} onPress={() => onPress(item)}>
      <View>
        <Text style={styles.foodName}>{item.name}</Text>
        {!!item.subtitle && <Text style={styles.subtitle}>{item.subtitle}</Text>}
      </View>

      <View style={styles.rowRight}>
        <Text style={styles.kcalLabel}>{item.caloriesPerServing} kcal</Text>

        <Pressable
          onPress={() => onToggleFavorite(item, !isFavorite)}
          style={styles.favoriteButton}
        >
          <Text style={styles.favoriteText}>{isFavorite ? '★' : '☆'}</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
});
