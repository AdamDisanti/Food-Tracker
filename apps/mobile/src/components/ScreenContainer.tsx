import { PropsWithChildren } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

const DEFAULT_HORIZONTAL_PADDING = 8;

// Reusable page wrapper to enforce consistent safe-area and background handling.
export function ScreenContainer({
  children,
  scroll = true,
  scrollEnabled = true,
  horizontalPadding = DEFAULT_HORIZONTAL_PADDING,
}: PropsWithChildren<{ scroll?: boolean; scrollEnabled?: boolean; horizontalPadding?: number }>) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.bgGradientTop, colors.bgGradientMid, colors.bgGradientBottom]}
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      />
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        {scroll ? (
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingHorizontal: horizontalPadding },
            ]}
            scrollEnabled={scrollEnabled}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.fill, { paddingHorizontal: horizontalPadding }]}>{children}</View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
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
