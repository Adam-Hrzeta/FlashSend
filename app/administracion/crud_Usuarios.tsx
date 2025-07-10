import Crud_UsuariosScreen from "@/components/administracion/crud_UsuariosScreen";
import NotAuthorized from "@/components/ui/NotAuthorized";
import { useState } from "react";

export default function Crud_Usuarios() {
  const [notAuth, setNotAuth] = useState(false);
  return notAuth ? (
    <NotAuthorized message="No autorizado: solo administradores pueden acceder a este panel." />
  ) : (
    <Crud_UsuariosScreen setNotAuth={setNotAuth} />
  );
}