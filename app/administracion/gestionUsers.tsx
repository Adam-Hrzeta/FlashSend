import CrudUsers from "@/components/administracion/crudUsers";
import { useState } from "react";
import { Text } from "react-native";

export default function GestionUsers() {
  const [notAuth, setNotAuth] = useState(false);
  return notAuth ? (
    <Text style={{ color: 'red', margin: 40, fontSize: 18, textAlign: 'center' }}>
      No autorizado: solo administradores pueden acceder a este panel.
    </Text>
  ) : (
    <CrudUsers setNotAuth={setNotAuth} />
  );
}