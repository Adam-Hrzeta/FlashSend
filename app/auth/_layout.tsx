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
        // tabBarStyle: {
        //   display: 'none',
        // },
      }}>
      <Tabs.Screen
        name="login"
        options={{
          title: 'Login',
        }}
      />
      <Tabs.Screen
        name="select"
        options={{
          title: 'Selector de Usuario',
        }}
      />
      <Tabs.Screen
        name="registerBusiness"
        options={{
          title: 'Registro de Negocios',
        }}
      />
      <Tabs.Screen
        name="registerClient"
        options={{
          title: 'Registro de Clientes',
        }}
      />
    </Tabs>
  );
}
