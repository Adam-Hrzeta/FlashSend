import NotAuthorized from "@/components/ui/NotAuthorized";
import { API_BASE_URL } from '@/constants/ApiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface SolicitudAliado {
  id: number;
  repartidor_id: number;
  repartidor_nombre: string;
  estatus: string;
}

export default function Repartidores_AliadosScreen({ setNotAuth }: { setNotAuth?: (v: boolean) => void }) {
  const [solicitudes, setSolicitudes] = useState<SolicitudAliado[]>([]);
  const [loading, setLoading] = useState(true);
  const [negocioId, setNegocioId] = useState<number | null>(null);
  const [notAuthState, setNotAuthState] = useState(false);

  const fetchSolicitudes = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        setNotAuth && setNotAuth(true);
        setNotAuthState(true);
        setLoading(false);
        return;
      }
      const res = await fetch(`${API_BASE_URL}/api/negocio/solicitudes_aliados`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 403) {
        setNotAuth && setNotAuth(true);
        setNotAuthState(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setSolicitudes(data.solicitudes || []);
    } catch (e) {
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getNegocioId = async () => {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/api/negocio/perfilNegocio`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setNegocioId(data.negocio?.id ?? null);
    };
    getNegocioId();
    fetchSolicitudes();
  }, []);

  const handleAccion = async (id: number, accion: 'aceptar' | 'rechazar' | 'eliminar') => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/negocio/solicitud_aliado/${id}/${accion}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchSolicitudes();
    } catch { }
  };

  if (notAuthState) {
    return <NotAuthorized message="No autorizado: solo negocios pueden acceder a este panel." />;
  }

  return (
    <View style={styles.mainContainer}>
      <Text style={styles.titulo}>Repartidores de Negocio</Text>
      {loading ? <ActivityIndicator color="#7E57C2" /> : (
        <FlatList
          data={solicitudes}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.info}><MaterialIcons name="person" size={18} color="#7E57C2" /> {item.repartidor_nombre}</Text>
              <Text style={styles.info}><MaterialIcons name="info" size={18} color="#7E57C2" /> Estatus: {item.estatus}</Text>
              {item.estatus === 'pendiente' && (
                <View style={styles.accionRow}>
                  <TouchableOpacity style={[styles.boton, styles.botonAceptar]} onPress={() => handleAccion(item.id, 'aceptar')}>
                    <MaterialIcons name="check" size={18} color="#fff" />
                    <Text style={styles.botonTexto}>Aceptar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.boton, styles.botonRechazar]} onPress={() => handleAccion(item.id, 'rechazar')}>
                    <MaterialIcons name="close" size={18} color="#fff" />
                    <Text style={styles.botonTexto}>Rechazar</Text>
                  </TouchableOpacity>
                </View>
              )}
              {item.estatus === 'aceptado' && (
                <View style={styles.accionRow}>
                  <TouchableOpacity style={[styles.boton, styles.botonEliminar]} onPress={() => handleAccion(item.id, 'eliminar')}>
                    <MaterialIcons name="delete" size={18} color="#fff" />
                    <Text style={styles.botonTexto}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay solicitudes pendientes</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F3EFFF',
    padding: 16,
    marginTop: 25,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#7E57C2',
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
  },
  info: {
    color: '#5E35B1',
    fontSize: 16,
    marginBottom: 4,
  },
  accionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginRight: 8,
    gap: 6,
  },
  botonAceptar: {
    backgroundColor: '#43A047',
  },
  botonRechazar: {
    backgroundColor: '#C62828',
  },
  botonEliminar: {
    backgroundColor: '#E57373',
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 4,
  },
  emptyText: {
    color: '#7E57C2',
    textAlign: 'center',
    marginTop: 40,
  },
});