import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import { useEffect } from "react";
import { SplashScreen } from "expo-router";
import { useFonts } from "expo-font";

export default function Layout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          drawerStyle: {
            width: "60%",
            height: "50%",
          },
        }}
      >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: "Inicio",
          title: "",
          drawerIcon: ({ color }) => <AntDesign name="home" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="auth"
        options={{
          drawerLabel: "Autenticación",
          title: "Autenticación del tipo de Usuario",
          drawerIcon: ({ color }) => <FontAwesome5 name="user-friends" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="dashboard"
        options={{
          drawerLabel: "Dashboard",
          title: "",
          drawerIcon: ({ color }) => <FontAwesome5 name="user-friends" size={24} color={color} />,
        }}
      />
      </Drawer>
    </GestureHandlerRootView>
  );
}