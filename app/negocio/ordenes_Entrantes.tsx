import Ordenes_EntrantesScreen from "@/components/negocio/ordenes_EntrantesScreen";
import NotAuthorized from "@/components/ui/NotAuthorized";
import { useState } from "react";

export default function Ordenes_Entrantes() {
  const [notAuth, setNotAuth] = useState(false);
  return notAuth ? (
    <NotAuthorized message="No autorizado: solo negocios pueden acceder a este panel." />
  ) : (
    <Ordenes_EntrantesScreen setNotAuth={setNotAuth} />
  );
}