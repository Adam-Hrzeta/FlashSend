import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Tabs } from 'expo-router';
import React from 'react';
import { Feather } from '@expo/vector-icons';

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
        //display: 'none',
        },
      }}>
      <Tabs.Screen
        name="perfil_Negocio"
        options={{
          title: 'Mi Negocio',
          tabBarIcon: ({ color, size }) => <Feather name="box" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="crud_Productos"
        options={{
          title: 'Productos',
          tabBarIcon: ({ color, size }) => <Feather name="grid" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="ordenes_Entrantes"
        options={{
          title: 'Pedidos Entrantes',
          tabBarIcon: ({ color, size }) => <Feather name="shopping-cart" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
