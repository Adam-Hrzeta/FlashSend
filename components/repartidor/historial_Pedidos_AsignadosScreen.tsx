import { API_BASE_URL } from '@/constants/ApiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';

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
}

export default function Historial_Pedidos_AsignadosScreen() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPedidos = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/pedidos/pedidos_asignados`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPedidos((data.pedidos || []).filter((pedido: Pedido) => pedido.estatus === 'entregado'));
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>📜 Historial de Pedidos Entregados</Text>
      {loading ? <ActivityIndicator color="#7B1FA2" /> : (
        <FlatList
          data={pedidos}
          keyExtractor={(item) => item.id.toString()}
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
              <Text style={styles.text}>Total: ${item.total !== undefined && !isNaN(Number(item.total)) ? Number(item.total).toFixed(2) : 'N/A'}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 16,
    paddingTop: 10,
    marginTop: 35,
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
});
