import Perfil_Publico_NegocioScreen from "@/components/cliente/perfil_Publico_NegocioScreen";
import NotAuthorized from "@/components/ui/NotAuthorized";
import { useLocalSearchParams } from 'expo-router';
import { useState } from "react";

export default function Perfil_Publico_Negocio() {
  const [notAuth, setNotAuth] = useState(false);
  const { negocioId } = useLocalSearchParams();
  // Si quieres proteger esta pantalla por rol, descomenta y usa setNotAuth
  // return notAuth ? (
  //   <NotAuthorized message="No autorizado: solo clientes pueden acceder a este panel." />
  // ) : (
  //   <Perfil_Publico_NegocioScreen negocioId={negocioId} setNotAuth={setNotAuth} />
  // );
  return <Perfil_Publico_NegocioScreen negocioId={negocioId} />;
}
