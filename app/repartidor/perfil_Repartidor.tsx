import Perfil_RepartidorScreen from "@/components/repartidor/perfil_RepartidorScreen";
import NotAuthorized from "@/components/ui/NotAuthorized";
import { useState } from "react";

export default function Perfil_Repartidor() {
  const [notAuth, setNotAuth] = useState(false);
  return notAuth ? (
    <NotAuthorized message="No autorizado: solo repartidores pueden acceder a este panel." />
  ) : (
    <Perfil_RepartidorScreen setNotAuth={setNotAuth} />
  );
}