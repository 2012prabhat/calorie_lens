import { Tabs } from 'expo-router';
import React from 'react';
import { LayoutDashboard, History, Target, User } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform } from 'react-native';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: isDark ? Colors.dark.subtext : Colors.light.subtext,
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
          paddingBottom: 8,
          backgroundColor: isDark ? 'rgba(3, 7, 18, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        },
        tabBarBackground: () => (
          <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <History size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plan',
          tabBarIcon: ({ color }) => <Target size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
