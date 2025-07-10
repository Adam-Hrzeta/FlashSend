import Negocios_DashboardScreen from "@/components/cliente/negocios_DashboardScreen";
import NotAuthorized from "@/components/ui/NotAuthorized";
import { useState } from "react";

export default function Negocios_Dashboard() {
  const [notAuth, setNotAuth] = useState(false);
  return notAuth ? (
    <NotAuthorized message="No autorizado: solo clientes pueden acceder a este panel." />
  ) : (
    <Negocios_DashboardScreen setNotAuth={setNotAuth} />
  );
}
