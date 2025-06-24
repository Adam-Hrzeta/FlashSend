import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getUserRole } from '@/utils/auth';
import { router, Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const role = await getUserRole();
      if (role !== 'administrador') {
        router.replace('/');
      } else {
        setChecking(false);
      }
    })();
  }, []);

  if (checking) {
    return null;
  }

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
        name="gestionUsers"
        options={{
          title: 'Gestión de Usuarios',
        }}
      />
    </Tabs>
  );
}
