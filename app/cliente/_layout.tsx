import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Feather } from '@expo/vector-icons';
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
       // display: 'none',
      },
      }}>
      <Tabs.Screen
      name="negocios_Dashboard"
      options={{
        title: 'Pantalla Principal',
        tabBarIcon: ({ color, size }) => <Feather name="home" color={color} size={size} />,
      }}
      />
      <Tabs.Screen
      name="perfil_Cliente"
      options={{
        title: 'Mi Perfil',
        tabBarIcon: ({ color, size }) => <Feather name="user" color={color} size={size} />,
      }}
      />
    </Tabs>
  );
}
