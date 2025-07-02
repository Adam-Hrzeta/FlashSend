import { API_BASE_URL } from '@/constants/ApiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function IncomingOrdersScreen() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/pedidos_negocio/pedidos_pendientes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPedidos(data.pedidos || []);
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPedidos(); }, []);

  const handleAceptar = async (pedidoId: number) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/pedidos_negocio/aceptar_pedido/${pedidoId}`, {
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

  if (loading) {
    return <ActivityIndicator size="large" color="#7E57C2" style={{ marginTop: 40 }} />;
  }

  if (!pedidos.length) {
    return <Text style={{ textAlign: 'center', marginTop: 40 }}>No hay pedidos entrantes</Text>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F3EFFF', padding: 16 }}>
      <Text style={styles.titulo}>Pedidos entrantes</Text>
      <FlatList
        data={pedidos}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        refreshing={refreshing}
        onRefresh={fetchPedidos}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.info}><Text style={styles.label}>Cliente:</Text> {item.cliente_id}</Text>
            <Text style={styles.info}><Text style={styles.label}>Total:</Text> ${item.total}</Text>
            <Text style={styles.info}><Text style={styles.label}>Fecha:</Text> {item.fecha}</Text>
            <TouchableOpacity style={styles.boton} onPress={() => handleAceptar(item.id)}>
              <Text style={styles.botonTexto}>Aceptar pedido</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7E57C2',
    marginBottom: 18,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 4,
  },
  info: {
    fontSize: 16,
    color: '#5E35B1',
    marginBottom: 6,
  },
  label: {
    fontWeight: 'bold',
    color: '#7E57C2',
  },
  boton: {
    backgroundColor: '#7E57C2',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});