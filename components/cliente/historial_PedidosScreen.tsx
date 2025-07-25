import { API_BASE_URL } from '@/constants/ApiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface DetallePedido {
  producto_id: number;
  nombre?: string;
  cantidad: number;
  precio_unitario?: number;
}

interface PedidoHistorial {
  id: number;
  negocio_id: number;
  negocio_nombre?: string;
  total: number;
  fecha: string;
  estatus: string;
  direccion_entrega: string;
  productos?: DetallePedido[];
  detalles?: DetallePedido[];
}

export default function Historial_PedidosScreen({ setNotAuth }: { setNotAuth?: (v: boolean) => void }) {
  const [historial, setHistorial] = useState<PedidoHistorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistorial = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('access_token');
    if (!token) {
      setNotAuth && setNotAuth(true);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/pedidos_cliente/historial`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 403) {
        setNotAuth && setNotAuth(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setHistorial(data.pedidos || []);
    } catch {
      setHistorial([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorial();
  }, []);

  const pedidosEntregados = historial.filter(p => p.estatus === 'entregado');

  if (loading) {
    return <ActivityIndicator size="large" color="#7E57C2" style={{ marginTop: 40 }} />;
  }

  if (!pedidosEntregados.length) {
    return <Text style={{ textAlign: 'center', marginTop: 40 }}>No hay pedidos entregados</Text>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F3EFFF', padding: 16, marginTop: 20 }}>
      <Text style={styles.titulo}>Pedidos Entregados</Text>
      <FlatList
        data={pedidosEntregados}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        refreshing={refreshing}
        onRefresh={async () => {
          setRefreshing(true);
          await fetchHistorial();
          setRefreshing(false);
        }}
        renderItem={({ item }: { item: PedidoHistorial }) => {
          const detalles: DetallePedido[] = item.productos && item.productos.length > 0 ? item.productos : (item.detalles || []);
          const fechaLegible = formatearFecha(item.fecha);
          return (
            <View style={{
              marginBottom: 22,
              backgroundColor: '#fff',
              borderRadius: 20,
              padding: 0,
              elevation: 6,
              shadowColor: '#7E57C2',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.13,
              shadowRadius: 12,
              overflow: 'hidden',
              borderWidth: 1.5,
              borderColor: '#E1BEE7',
            }}>
              {/* Header */}
              <View style={{ backgroundColor: '#388E3C', padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>
                  <MaterialIcons name="assignment" size={22} color="#fff" /> Pedido #{item.id}
                </Text>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>{fechaLegible}</Text>
              </View>
              {/* Info principal */}
              <View style={{ padding: 16, gap: 6 }}>
                <Text style={{ color: '#5E35B1', fontWeight: 'bold', fontSize: 16 }}>
                  <MaterialIcons name="store" size={18} color="#7E57C2" /> {item.negocio_nombre ? item.negocio_nombre : `Negocio ID: ${item.negocio_id}`}
                </Text>
                <Text style={{ color: '#7E57C2', fontSize: 15 }}>
                  <MaterialIcons name="location-on" size={18} color="#7E57C2" /> <Text style={{ fontWeight: 'bold' }}>Dirección de entrega:</Text> {item.direccion_entrega || 'No disponible'}
                </Text>
                <Text style={{ color: '#7E57C2', fontSize: 15 }}>
                  <MaterialIcons name="attach-money" size={18} color="#7E57C2" /> <Text style={{ fontWeight: 'bold' }}>Total:</Text> ${item.total}
                </Text>
                <Text style={{ color: '#388E3C', fontSize: 15 }}>
                  <MaterialIcons name="check" size={18} color="#388E3C" /> <Text style={{ fontWeight: 'bold' }}>Estatus:</Text> Entregado
                </Text>
              </View>
              {/* Productos */}
              <View style={{ backgroundColor: '#F3EFFF', paddingHorizontal: 16, paddingBottom: 12, paddingTop: 8 }}>
                <Text style={{ color: '#5E35B1', fontWeight: 'bold', fontSize: 15, marginBottom: 2 }}>
                  <MaterialIcons name="shopping-cart" size={18} color="#7E57C2" /> Productos solicitados:
                </Text>
                {detalles.length > 0 ? (
                  detalles.map((detalle, idx) => {
                    const precio = detalle.precio_unitario;
                    let precioDisplay = "N/A";
                    if (precio !== undefined && precio !== null && !isNaN(Number(precio))) {
                      precioDisplay = Number(precio).toFixed(2);
                    }
                    return (
                      <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2, marginLeft: 8 }}>
                        <MaterialIcons name="check-circle" size={16} color="#7E57C2" />
                        <Text style={{ color: '#7E57C2', marginLeft: 6, fontSize: 14 }}>
                          {detalle.nombre ? detalle.nombre : `Producto ${detalle.producto_id}`} <Text style={{ fontWeight: 'bold' }}>x{detalle.cantidad}</Text> <Text style={{ color: '#5E35B1' }}>@ ${precioDisplay}</Text>
                        </Text>
                      </View>
                    );
                  })
                ) : (
                  <Text style={{ color: '#7E57C2', fontStyle: 'italic', marginLeft: 8 }}>
                    No hay productos asociados a este pedido.
                  </Text>
                )}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

function formatearFecha(fecha: string) {
  try {
    const date = new Date(fecha);
    return date.toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return fecha;
  }
}

const styles = StyleSheet.create({
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#a42cc2ff',
    marginBottom: 18,
    textAlign: 'center',
  },
});