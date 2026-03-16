import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '../theme/colors';

export function GlassSurface({
  children,
  style,
  intensity = 28,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle>; intensity?: number }>) {
  return (
    <View style={[styles.shell, style]}>
      <BlurView tint="dark" intensity={intensity} style={StyleSheet.absoluteFillObject} />
      <View style={styles.gloss} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glassFill,
  },
  gloss: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.glassOverlay,
  },
});
