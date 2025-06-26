import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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
          name="dashboardClient"
          options={{
            drawerLabel: "Negocios y Servicios",
            title: "Negocios y Servicios",
            drawerIcon: ({ color }) => <AntDesign name="appstore-o" size={24} color={color} />,
          }}
        />
        <Drawer.Screen
          name="profiles"
          options={{
            drawerLabel: "Mi Perfil",
            title: "Perfiles de Usuario",
            drawerIcon: ({ color }) => <AntDesign name="profile" size={24} color={color} />,
          }}
        />
        <Drawer.Screen
          name="dashboardNegocio"
          options={{
            drawerLabel: "Mis productos",
            title: "Mis productos",
            drawerIcon: ({ color }) => <AntDesign name="shoppingcart" size={24} color={color} />,
          }}
        />
        <Drawer.Screen
          name="dashboardAdmin"
          options={{
            drawerLabel: "Administración",
            title: "Peticiones de usuarios",
            drawerIcon: ({ color }) => <AntDesign name="setting" size={24} color={color} />,
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}