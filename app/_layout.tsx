import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { AntDesign, FontAwesome5, Fontisto, MaterialIcons } from "@expo/vector-icons";

export default function Layout() {
  
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
          drawerIcon: ({ color }) => <MaterialIcons name="dashboard" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="profiles"
        options={{
          drawerLabel: "Perfil de usuario",
          title: "",
          drawerIcon: ({ color }) => <Fontisto name="person" size={24} color={color} />,
        }}
      />
      </Drawer>
    </GestureHandlerRootView>
  );
}