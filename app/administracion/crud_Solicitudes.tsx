import Crud_UsuariosScreen from "@/components/administracion/crud_SolicitudesScreen";
import { useState } from "react";
import { Text } from "react-native";

export default function Crud_Solicitudes() {
  const [notAuth, setNotAuth] = useState(false);
  return notAuth ? (
    <Text style={{ color: 'red', margin: 40, fontSize: 18, textAlign: 'center' }}>
      No autorizado: solo administradores pueden acceder a este panel.
    </Text>
  ) : (
    <Crud_UsuariosScreen setNotAuth={setNotAuth} />
  );
}