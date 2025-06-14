import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          display: 'none',
        },
      }}>
      <Tabs.Screen
        name="busisnessDashboard"
        options={{
          title: 'Pantalla Principal',
        }}
      />
      <Tabs.Screen
        name="publicBusinessProfile"
        options={{
          title: 'Perfil Negocio',
        }}
      />
    </Tabs>
  );
}
