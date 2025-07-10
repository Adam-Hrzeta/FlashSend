import Repartidores_AliadosScreen from "@/components/negocio/repartidores_AliadosScreen";
import NotAuthorized from "@/components/ui/NotAuthorized";
import { useState } from "react";

export default function Repartidores_aliados() {
  const [notAuth, setNotAuth] = useState(false);
  return notAuth ? (
    <NotAuthorized message="No autorizado: solo negocios pueden acceder a este panel." />
  ) : (
    <Repartidores_AliadosScreen setNotAuth={setNotAuth} />
  );
}