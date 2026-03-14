import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { BottomNav } from './src/components/BottomNav';
import { colors } from './src/theme/colors';
import {
  AddFoodSaveInput,
  FoodSearchItem,
  MacroGoals,
  MealGroup,
  TopLevelScreen,
} from './src/types/app';
import { AddFoodScreen } from './src/screens/AddFoodScreen';
import { DiaryScreen, AddActionMenu } from './src/screens/DiaryScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { createLogItem, getDayLog } from './src/api/logs';
import { getApiBaseUrl } from './src/api/client';
import { getGoals, saveGoals } from './src/api/goals';
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from './src/api/favorites';
import { getRecentFoods } from './src/api/foods';

const emptyMeals: Record<MealGroup, string[]> = {
  Breakfast: [],
  Lunch: [],
  Dinner: [],
  Snacks: [],
};

const emptyTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

// Milestone 1 app shell with lightweight in-app navigation state.
export default function App() {
  const [activeScreen, setActiveScreen] = useState<TopLevelScreen>('Diary');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [calendarDay, setCalendarDay] = useState(new Date().getDate());
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [addMenuVisible, setAddMenuVisible] = useState(false);
  const [selectedMealGroup, setSelectedMealGroup] = useState<MealGroup>('Lunch');
  const [selectedFood, setSelectedFood] = useState<FoodSearchItem | null>(null);
  const [dayMeals, setDayMeals] = useState<Record<MealGroup, string[]>>(emptyMeals);
  const [dayTotals, setDayTotals] = useState(emptyTotals);
  const [dayError, setDayError] = useState<string | null>(null);
  const [goals, setGoals] = useState<MacroGoals | null>(null);
  const [recentFoods, setRecentFoods] = useState<FoodSearchItem[]>([]);
  const [favoriteFoods, setFavoriteFoods] = useState<FoodSearchItem[]>([]);

  useEffect(() => {
    async function loadSupportingData() {
      try {
        const [savedGoals, recents, favorites] = await Promise.all([
          getGoals(),
          getRecentFoods(),
          getFavorites(),
        ]);

        setGoals(
          savedGoals
            ? {
                calories: savedGoals.calorieGoal,
                protein: savedGoals.proteinGoal,
                carbs: savedGoals.carbGoal,
                fat: savedGoals.fatGoal,
              }
            : null,
        );
        setRecentFoods(recents);
        setFavoriteFoods(favorites);
      } catch {
        // Non-blocking for diary flow; API warnings are shown in existing footer status.
      }
    }

    void loadSupportingData();
  }, []);

  const dateLabel = useMemo(
    () => selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
    [selectedDate],
  );

  useEffect(() => {
    async function loadDay() {
      try {
        const data = await getDayLog(formatDateForApi(selectedDate));
        setDayTotals(data.totals);
        setDayMeals({
          Breakfast: data.meals.breakfast.map((item) => `${item.foodName} (${item.amount} ${item.servingUnit})`),
          Lunch: data.meals.lunch.map((item) => `${item.foodName} (${item.amount} ${item.servingUnit})`),
          Dinner: data.meals.dinner.map((item) => `${item.foodName} (${item.amount} ${item.servingUnit})`),
          Snacks: data.meals.snacks.map((item) => `${item.foodName} (${item.amount} ${item.servingUnit})`),
        });
        setDayError(null);
      } catch (err) {
        setDayError(err instanceof Error ? err.message : 'Failed to load diary data');
        setDayTotals(emptyTotals);
        setDayMeals(emptyMeals);
      }
    }

    void loadDay();
  }, [selectedDate]);

  const monthLabel = useMemo(
    () => calendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
    [calendarMonth],
  );

  const goToAddFromSearch = (food: FoodSearchItem) => {
    setSelectedFood(food);
    setActiveScreen('AddFood');
  };

  const onMealAddPress = (group: MealGroup) => {
    setSelectedMealGroup(group);
    setAddMenuVisible(true);
  };

  return (
    <View style={styles.appRoot}>
      {activeScreen === 'Diary' ? (
        <DiaryScreen
          dateLabel={dateLabel}
          onPrevDay={() => setSelectedDate((prev) => addDays(prev, -1))}
          onNextDay={() => setSelectedDate((prev) => addDays(prev, 1))}
          onOpenCalendar={() => setCalendarVisible(true)}
          onCloseCalendar={() => setCalendarVisible(false)}
          calendarVisible={calendarVisible}
          calendarMonthLabel={monthLabel}
          selectedDay={calendarDay}
          onSelectDay={setCalendarDay}
          onConfirmDay={() => {
            // Apply selected date from the calendar shell controls.
            const nextDate = new Date(calendarMonth);
            nextDate.setDate(calendarDay);
            setSelectedDate(nextDate);
            setCalendarVisible(false);
          }}
          onPrevMonth={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
          onNextMonth={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
          onAddFromGroup={onMealAddPress}
          mealItems={dayMeals}
          totals={dayTotals}
          goals={goals ?? undefined}
        />
      ) : null}

      {activeScreen === 'Search' ? (
        <SearchScreen
          onPickFood={goToAddFromSearch}
          recentFoods={recentFoods}
          favoriteFoods={favoriteFoods}
          onToggleFavorite={async (food, shouldFavorite) => {
            if (shouldFavorite) {
              await addFavorite(food.id);
            } else {
              await removeFavorite(food.id);
            }

            setFavoriteFoods(await getFavorites());
          }}
        />
      ) : null}

      {activeScreen === 'AddFood' ? (
        <AddFoodScreen
          food={selectedFood}
          defaultGroup={selectedMealGroup}
          onBack={() => setActiveScreen('Search')}
          onSave={(input) => {
            void saveFoodToDiary(input, selectedFood, selectedDate)
              .then(() => {
                setActiveScreen('Diary');
                return Promise.all([
                  refreshDay(selectedDate, setDayTotals, setDayMeals, setDayError),
                  getRecentFoods().then(setRecentFoods),
                ]).then(() => undefined);
              })
              .catch((error: Error) => {
                Alert.alert('Save Failed', error.message);
              });
          }}
        />
      ) : null}

      {activeScreen === 'Settings' ? (
        <SettingsScreen
          initialGoals={goals}
          onSaveGoals={async (nextGoals) => {
            const saved = await saveGoals({
              calorieGoal: nextGoals.calories,
              proteinGoal: nextGoals.protein,
              carbGoal: nextGoals.carbs,
              fatGoal: nextGoals.fat,
            });

            setGoals({
              calories: saved.calorieGoal,
              protein: saved.proteinGoal,
              carbs: saved.carbGoal,
              fat: saved.fatGoal,
            });
          }}
        />
      ) : null}

      {/* Global quick-action menu invoked from meal section plus buttons. */}
      <AddActionMenu
        visible={addMenuVisible}
        mealGroup={selectedMealGroup}
        onClose={() => setAddMenuVisible(false)}
        onSearchFood={() => {
          setAddMenuVisible(false);
          setActiveScreen('Search');
        }}
        onScanBarcode={() => {
          setAddMenuVisible(false);
          Alert.alert('Coming Soon', 'Barcode scanning is intentionally deferred for early versions.');
        }}
      />

      {/* Bottom nav is fixed so screen switching stays consistent and predictable. */}
      <View style={styles.bottomNavShell}>
        <Text style={styles.milestoneLabel}>Milestone 1 Shell Navigation</Text>
        {dayError ? <Text style={styles.errorText}>API: {dayError}</Text> : null}
        <Text style={styles.apiLabel}>API base: {getApiBaseUrl()}</Text>
        <BottomNav active={activeScreen} onSelect={setActiveScreen} />
      </View>
    </View>
  );
}

async function saveFoodToDiary(input: AddFoodSaveInput, food: FoodSearchItem | null, selectedDate: Date): Promise<void> {
  if (!food) {
    throw new Error('No food selected');
  }

  await createLogItem({
    foodId: food.id,
    mealGroup: input.mealGroup,
    amount: input.amount,
    servingUnit: input.servingUnit,
    grams: input.grams,
    loggedAt: input.loggedAt,
    logDate: formatDateForApi(selectedDate),
  });
}

async function refreshDay(
  date: Date,
  setTotals: (totals: typeof emptyTotals) => void,
  setMeals: (meals: Record<MealGroup, string[]>) => void,
  setError: (error: string | null) => void,
): Promise<void> {
  const data = await getDayLog(formatDateForApi(date));
  setTotals(data.totals);
  setMeals({
    Breakfast: data.meals.breakfast.map((item) => `${item.foodName} (${item.amount} ${item.servingUnit})`),
    Lunch: data.meals.lunch.map((item) => `${item.foodName} (${item.amount} ${item.servingUnit})`),
    Dinner: data.meals.dinner.map((item) => `${item.foodName} (${item.amount} ${item.servingUnit})`),
    Snacks: data.meals.snacks.map((item) => `${item.foodName} (${item.amount} ${item.servingUnit})`),
  });
  setError(null);
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function formatDateForApi(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  milestoneLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  apiLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  errorText: {
    color: colors.danger,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  bottomNavShell: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
});
