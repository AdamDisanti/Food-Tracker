import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { BottomNav } from './src/components/BottomNav';
import { colors } from './src/theme/colors';
import { FoodSearchItem, MealGroup, TopLevelScreen } from './src/types/app';
import { AddFoodScreen } from './src/screens/AddFoodScreen';
import { DiaryScreen, AddActionMenu } from './src/screens/DiaryScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

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

  const dateLabel = useMemo(
    () => selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
    [selectedDate],
  );

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
        />
      ) : null}

      {activeScreen === 'Search' ? <SearchScreen onPickFood={goToAddFromSearch} /> : null}

      {activeScreen === 'AddFood' ? (
        <AddFoodScreen
          food={selectedFood}
          defaultGroup={selectedMealGroup}
          onBack={() => setActiveScreen('Search')}
          onSave={() => {
            Alert.alert('Saved', 'Food item saved to diary (shell behavior).');
            setActiveScreen('Diary');
          }}
        />
      ) : null}

      {activeScreen === 'Settings' ? <SettingsScreen /> : null}

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
        <BottomNav active={activeScreen} onSelect={setActiveScreen} />
      </View>
    </View>
  );
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
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
  bottomNavShell: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
});
