import { API_BASE_URL } from '@/constants/ApiConfig';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProductoPedido {
  producto_id: number;
  nombre?: string;
  cantidad: number;
  precio_unitario?: number;
  descripcion?: string;
  precio?: number;
  imagen?: string;
}

interface Pedido {
  id: number;
  cliente_nombre: string;
  cliente_telefono: string;
  negocio_nombre: string;
  negocio_telefono: string;
  categoria: string;
  estatus: string;
  direccion_entrega?: string;
  total?: number;
  fecha?: string;
  productos?: ProductoPedido[];
}

const Pedidos_AsignadosScreen = ({ setNotAuth }: { setNotAuth?: (v: boolean) => void }) => {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch principal (con spinner)
  const fetchPedidos = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('access_token');
    if (!token) {
      setNotAuth && setNotAuth(true);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/pedidos/pedidos_asignados`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 403) {
        setNotAuth && setNotAuth(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setPedidos(data.pedidos || []);
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  // Polling discreto (sin spinner)
  const fetchPedidosSilent = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        setNotAuth && setNotAuth(true);
        return;
      }
      const res = await fetch(`${API_BASE_URL}/api/pedidos/pedidos_asignados`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 403) {
        setNotAuth && setNotAuth(true);
        return;
      }
      const data = await res.json();
      setPedidos(data.pedidos || []);
    } catch { }
  };

  useEffect(() => {
    fetchPedidos();
    intervalRef.current = setInterval(fetchPedidosSilent, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleAceptar = async (pedidoId: number) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/pedidos/aceptar_pedido/${pedidoId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Éxito', data.mensaje || 'Pedido aceptado');
        fetchPedidos();
      } else {
        Alert.alert('Error', data.error || 'No se pudo aceptar el pedido');
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo aceptar el pedido');
    }
  };

  const handleEntregar = async (pedidoId: number) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/pedidos/entregar_pedido/${pedidoId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Éxito', data.mensaje || 'Pedido entregado');
        fetchPedidos();
      } else {
        Alert.alert('Error', data.error || 'No se pudo entregar el pedido');
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo entregar el pedido');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>📦 Pedidos Asignados</Text>
      {loading ? <ActivityIndicator color="#7B1FA2" /> : (
        <FlatList
          data={pedidos}
          keyExtractor={(item) => item.id.toString()}
          refreshing={loading}
          onRefresh={async () => {
            setLoading(true);
            await fetchPedidos();
            setLoading(false);
          }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.subtitulo}>👤 Cliente</Text>
              <Text style={styles.text}>Nombre: {item.cliente_nombre}</Text>
              <Text style={styles.text}>Teléfono: {item.cliente_telefono}</Text>
              <Text style={styles.text}>Dirección: {item.direccion_entrega || 'No disponible'}</Text>
              <Text style={styles.subtitulo}>🏪 Negocio</Text>
              <Text style={styles.text}>Nombre: {item.negocio_nombre}</Text>
              <Text style={styles.text}>Teléfono: {item.negocio_telefono}</Text>
              <Text style={styles.text}>Categoría: {item.categoria}</Text>
              <Text style={styles.subtitulo}>🗓️ Pedido</Text>
              <Text style={styles.text}>Fecha: {item.fecha ? new Date(item.fecha).toLocaleString('es-MX') : 'No disponible'}</Text>
              <Text style={styles.text}>
                Total: ${item.total !== undefined && !isNaN(Number(item.total)) ? Number(item.total).toFixed(2) : 'N/A'}
              </Text>
              <Text style={styles.text}>
                Estatus: {item.estatus === 'enviado' ? 'Asignando repartidor' : item.estatus === 'en_camino' ? 'En camino' : item.estatus}
              </Text>
              <Text style={styles.subtitulo}>🛒 Productos</Text>
              {item.productos && item.productos.length > 0 ? (
                item.productos.map((prod, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2, marginLeft: 8 }}>
                    <MaterialIcons name="check-circle" size={16} color="#7E57C2" />
                    <Text style={{ color: '#7E57C2', marginLeft: 6, fontSize: 14 }}>
                      {prod.nombre ? prod.nombre : `Producto ${prod.producto_id}`} <Text style={{ fontWeight: 'bold' }}>x{prod.cantidad}</Text> <Text style={{ color: '#5E35B1' }}>@ ${prod.precio_unitario ?? prod.precio ?? 'N/A'}</Text>
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={{ color: '#7E57C2', fontStyle: 'italic', marginLeft: 8 }}>
                  No hay productos asociados a este pedido.
                </Text>
              )}
              {item.estatus === 'enviado' && (
                <TouchableOpacity style={styles.botonVolver} onPress={() => handleAceptar(item.id)}>
                  <MaterialIcons name="check" size={22} color="#fff" />
                  <Text style={styles.textoBoton}>Aceptar pedido</Text>
                </TouchableOpacity>
              )}
              {item.estatus === 'en_camino' && (
                <TouchableOpacity style={[styles.botonVolver, { backgroundColor: '#43A047' }]} onPress={() => handleEntregar(item.id)}>
                  <MaterialIcons name="local-shipping" size={22} color="#fff" />
                  <Text style={styles.textoBoton}>Entregar pedido</Text>
                </TouchableOpacity>
              )}
              {item.estatus === 'entregado' && (
                <TouchableOpacity style={[styles.botonVolver, { backgroundColor: '#BDBDBD' }]} disabled>
                  <MaterialIcons name="check" size={22} color="#fff" />
                  <Text style={styles.textoBoton}>Entregado</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
      <TouchableOpacity style={styles.botonVolver} onPress={() => router.push('/repartidor/perfil_Repartidor')}>
        <MaterialIcons name="arrow-back" size={22} color="#fff" />
        <Text style={styles.textoBoton}>Volver al perfil</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Pedidos_AsignadosScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#7B1FA2',
  },
  card: {
    backgroundColor: '#FFF',
    borderLeftWidth: 6,
    borderLeftColor: '#BA68C8',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  subtitulo: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#8E24AA',
    marginBottom: 4,
    marginTop: 6,
  },
  text: {
    fontSize: 14,
    color: '#4A148C',
    marginBottom: 2,
  },
  botonVolver: {
    flexDirection: 'row',
    backgroundColor: '#AB47BC',
    padding: 12,
    marginVertical: 20,
    marginHorizontal: 60,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    elevation: 4,
  },
  textoBoton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
