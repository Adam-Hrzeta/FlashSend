import Perfil_ClienteScreen from "@/components/cliente/perfil_ClienteScreen";
import { useState } from "react";
import NotAuthorized from "@/components/ui/NotAuthorized";

export default function Perfil_Cliente() {
  const [notAuth, setNotAuth] = useState(false);
  return notAuth ? (
    <NotAuthorized message="No autorizado: solo clientes pueden acceder a este panel." />
  ) : (
    <Perfil_ClienteScreen setNotAuth={setNotAuth} />
  );
}