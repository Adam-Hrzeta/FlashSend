import Crud_ProductosScreen from "@/components/negocio/crud_ProductosScreen";
import NotAuthorized from "@/components/ui/NotAuthorized";
import { useState } from "react";

export default function crud_Productos() {
  const [notAuth, setNotAuth] = useState(false);
  return notAuth ? (
    <NotAuthorized message="No autorizado: solo negocios pueden acceder a este panel." />
  ) : (
    <Crud_ProductosScreen setNotAuth={setNotAuth} />
  );
}