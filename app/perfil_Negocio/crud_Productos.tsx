import Crud_ProductosScreen from "@/components/perfil_Negocio/crud_ProductosScreen";
import { useState } from "react";
import { Text } from "react-native";

export default function crud_Productos() {
  const [notAuth, setNotAuth] = useState(false);
  return notAuth ? (
    <Text style={{ color: "red", margin: 40, fontSize: 18, textAlign: "center" }}>
      No autorizado: solo negocios pueden acceder a este panel.
    </Text>
  ) : (
    <Crud_ProductosScreen setNotAuth={setNotAuth} />
  );
}