import React from 'react';
import { View, StyleSheet, Platform, useColorScheme } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, BorderRadius } from '../../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: any;
  intensity?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style, intensity = 20 }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, style]}>
      <BlurView
        intensity={intensity}
        tint={isDark ? 'dark' : 'light'}
        style={styles.blur}
      >
        <View style={[
          styles.content,
          { 
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
          }
        ]}>
          {children}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  blur: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
  },
});
