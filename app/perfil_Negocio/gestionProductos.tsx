import CrudProducts from "@/components/perfil_Negocio/crudProducts";
import { useState } from "react";
import { Text } from "react-native";

export default function GestionProductos() {
  const [notAuth, setNotAuth] = useState(false);
  return notAuth ? (
    <Text style={{ color: "red", margin: 40, fontSize: 18, textAlign: "center" }}>
      No autorizado: solo negocios pueden acceder a este panel.
    </Text>
  ) : (
    <CrudProducts setNotAuth={setNotAuth} />
  );
}