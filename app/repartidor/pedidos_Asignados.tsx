import Pedidos_AsignadosScreen from "@/components/repartidor/pedidos_AsignadosScreen";
import NotAuthorized from "@/components/ui/NotAuthorized";
import { useState } from "react";

export default function Pedidos_Asignados() {
  const [notAuth, setNotAuth] = useState(false);
  return notAuth ? (
    <NotAuthorized message="No autorizado: solo repartidores pueden acceder a este panel." />
  ) : (
    <Pedidos_AsignadosScreen setNotAuth={setNotAuth} />
  );
}