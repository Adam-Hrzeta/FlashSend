import Historial_OrdenesScreen from "@/components/negocio/historial_OrdenesScreen";
import NotAuthorized from "@/components/ui/NotAuthorized";
import { useState } from "react";

export default function Historial_Ordenes() {
  const [notAuth, setNotAuth] = useState(false);
  return notAuth ? (
    <NotAuthorized message="No autorizado: solo negocios pueden acceder a este panel." />
  ) : (
    <Historial_OrdenesScreen setNotAuth={setNotAuth} />
  );
}