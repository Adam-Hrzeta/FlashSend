import Historial_PedidosScreen from "@/components/cliente/historial_PedidosScreen";
import { useState } from "react";
import NotAuthorized from "@/components/ui/NotAuthorized";

export default function Historial_Pedidos() {
  const [notAuth, setNotAuth] = useState(false);
  return notAuth ? (
    <NotAuthorized message="No autorizado: solo clientes pueden acceder a este panel." />
  ) : (
    <Historial_PedidosScreen setNotAuth={setNotAuth} />
  );
}