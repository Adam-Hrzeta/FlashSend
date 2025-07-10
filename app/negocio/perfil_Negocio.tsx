import Perfil_NegocioScreen from "@/components/negocio/perfil_NegocioScreen";
import NotAuthorized from "@/components/ui/NotAuthorized";
import { useState } from "react";
import { View } from "react-native";

export default function Perfil_Negocio() {
  const [notAuth, setNotAuth] = useState(false);
  return notAuth ? (
    <NotAuthorized message="No autorizado: solo negocios pueden acceder a este panel." />
  ) : (
    <View style={{ flex: 1 }}>
      <Perfil_NegocioScreen setNotAuth={setNotAuth} />
    </View>
  );
}