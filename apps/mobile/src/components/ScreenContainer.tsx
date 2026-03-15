import { PropsWithChildren } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

const DEFAULT_HORIZONTAL_PADDING = 8;

// Reusable page wrapper to enforce consistent safe-area and background handling.
export function ScreenContainer({
  children,
  scroll = true,
  horizontalPadding = DEFAULT_HORIZONTAL_PADDING,
}: PropsWithChildren<{ scroll?: boolean; horizontalPadding?: number }>) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      {scroll ? (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: horizontalPadding },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.fill, { paddingHorizontal: horizontalPadding }]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  fill: {
    flex: 1,
    paddingBottom: 20,
  },
  scrollContent: {
    paddingBottom: 24,
    gap: 14,
  },
});
