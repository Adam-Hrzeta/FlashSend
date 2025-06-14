import { Tabs } from 'expo-router';
import React from 'react';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

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
      }}
    >
      <Tabs.Screen
        name="busisnessProfile"
        options={{
          title: 'Perfil de Negocio',
        }}
      />
      <Tabs.Screen
        name="clientProfile"
        options={{
          title: 'Perfil de cliente',
        }}
      />
      <Tabs.Screen
        name="dealerProfile"
        options={{
          title: 'Perfil de repartidor',
        }}
      />
    </Tabs>
  );
}
