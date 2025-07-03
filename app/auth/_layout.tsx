import { Tabs } from 'expo-router';
import React from 'react';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';

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
        name="login"
        options={{
          title: 'Login',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="login" color={color} size={size} />
          ), // Optional: Add an icon for the tab
        }}
      />
      <Tabs.Screen
        name="seleccionar_Registro"
        options={{
          title: 'Selector de Usuario',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="group" color={color} size={size} />
          ), // Optional: Add an icon for the tab
        }}
      />
      <Tabs.Screen
        name="registro_Negocio"
        options={{
          title: 'Registro de Negocios',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="store" color={color} size={size} />
          ), // Optional: Add an icon for the tab
        }}
      />
      <Tabs.Screen
        name="registro_Cliente"
        options={{
          title: 'Registro de Clientes',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" color={color} size={size} />
          ), // Optional: Add an icon for the tab
        }}
      />
      <Tabs.Screen
        name="registro_Repartidor"
        options={{
          title: 'Registro de repartidores',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="delivery-dining" color={color} size={size} />
          ), // Optional: Add an icon for the tab
        }}
      />
    </Tabs>
  );
}
