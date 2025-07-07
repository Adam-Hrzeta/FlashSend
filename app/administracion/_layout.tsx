import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Tabs } from 'expo-router';
import React from 'react';
import { FontAwesome } from '@expo/vector-icons';

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
        //  display: 'none',
        },
      }}>
      <Tabs.Screen
        name="crud_Solicitudes"
        options={{
          tabBarIcon: ({ color, size }) => <FontAwesome name="list" color={color} size={size} />,
          title: 'Solicitudes de Usuarios',
        }}
      />
      <Tabs.Screen
        name="crud_Usuarios"
        options={{
        tabBarIcon: ({ color, size }) => <FontAwesome name="users" color={color} size={size} />,
          title: 'Administración de Usuarios',
        }}
      />
    </Tabs>
  );
}
