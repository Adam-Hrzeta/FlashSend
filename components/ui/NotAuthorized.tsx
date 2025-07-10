import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface NotAuthorizedProps {
  message?: string;
}

export default function NotAuthorized({ message }: NotAuthorizedProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message || "No autorizado: no tienes permiso para acceder a este panel."}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 24,
  },
  text: {
    color: "#D32F2F",
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
});
