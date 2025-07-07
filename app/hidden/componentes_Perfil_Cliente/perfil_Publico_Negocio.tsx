import Perfil_Publico_NegocioScreen from "@/components/cliente/perfil_Publico_NegocioScreen";
import { useLocalSearchParams } from 'expo-router';

export default function Perfil_Publico_Negocio() {
  const { negocioId } = useLocalSearchParams();
  return <Perfil_Publico_NegocioScreen negocioId={negocioId} />;
}
