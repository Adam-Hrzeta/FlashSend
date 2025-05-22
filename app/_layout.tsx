import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { AntDesign, FontAwesome5, Fontisto, Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function Layout() {
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          drawerStyle: {
            width: "60%",
            height: "23%",
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
      </Drawer>
    </GestureHandlerRootView>
  );
}