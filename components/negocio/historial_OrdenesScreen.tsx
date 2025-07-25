import NotAuthorized from "@/components/ui/NotAuthorized";
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
  descripcion?: string;
}

interface PedidoEntrante {
  id: number;
  cliente_id: number;
  total: number;
  fecha: string;
  direccion_entrega?: string;
  estatus?: string;
  cliente_nombre?: string;
  productos?: DetallePedido[];
  detalles?: DetallePedido[];
}

export default function Historial_OrdenesScreen({ setNotAuth }: { setNotAuth?: (v: boolean) => void }) {
  const [pedidos, setPedidos] = useState<PedidoEntrante[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notAuthState, setNotAuthState] = useState(false);

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        setNotAuth && setNotAuth(true);
        setNotAuthState(true);
        setLoading(false);
        return;
      }
      const res = await fetch(`${API_BASE_URL}/api/pedidos_negocio/todos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 403) {
        setNotAuth && setNotAuth(true);
        setNotAuthState(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setPedidos(data.pedidos || []);
    } catch (e) {
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const pedidosEntregados = pedidos.filter(p => p.estatus === 'entregado');

  if (loading) {
    return <ActivityIndicator size="large" color="#7E57C2" style={styles.loadingIndicator} />;
  }

  if (notAuthState) {
    return <NotAuthorized message="No autorizado: solo negocios pueden acceder a este panel." />;
  }

  if (!pedidosEntregados.length) {
    return <Text style={styles.emptyText}>No hay pedidos entregados</Text>;
  }

  return (
    <View style={styles.mainContainer}>
      <Text style={styles.titulo}>Pedidos Entregados</Text>
      <FlatList
        data={pedidosEntregados}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        refreshing={refreshing}
        onRefresh={async () => {
          setRefreshing(true);
          await fetchPedidos();
          setRefreshing(false);
        }}
        renderItem={({ item }: { item: PedidoEntrante }) => {
          const detalles: DetallePedido[] = item.productos && item.productos.length > 0 ? item.productos : (item.detalles || []);
          const fechaLegible = formatearFecha(item.fecha);
          return (
            <View style={styles.card}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderText}>
                  <MaterialIcons name="assignment" size={22} color="#fff" /> Pedido {item.id}
                </Text>
                <Text style={styles.cardHeaderDate}>{fechaLegible}</Text>
              </View>
              {/* Info principal */}
              <View style={styles.cardInfoBox}>
                <Text style={styles.cardInfoCliente}>
                  <MaterialIcons name="person" size={18} color="#7E57C2" /> {item.cliente_nombre || 'Cliente'}
                </Text>
                <Text style={styles.cardInfoText}>
                  <MaterialIcons name="location-on" size={18} color="#7E57C2" /> <Text style={styles.bold}>Dirección de entrega:</Text> {item.direccion_entrega || 'No disponible'}
                </Text>
                <Text style={styles.cardInfoText}>
                  <MaterialIcons name="attach-money" size={18} color="#7E57C2" /> <Text style={styles.bold}>Total:</Text> ${item.total}
                </Text>
                <Text style={styles.cardInfoStatus}>
                  <MaterialIcons name="check" size={18} color="#388E3C" /> <Text style={styles.bold}>Estatus:</Text> Entregado
                </Text>
              </View>
              {/* Productos */}
              <View style={styles.cardProductosBox}>
                <Text style={styles.cardProductosTitle}>
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
                      <View key={idx} style={styles.productoRow}>
                        <MaterialIcons name="check-circle" size={16} color="#7E57C2" />
                        <Text style={styles.productoText}>
                          {detalle.nombre ? detalle.nombre : `Producto ${detalle.producto_id}`} <Text style={styles.bold}>x{detalle.cantidad}</Text> <Text style={styles.productoPrecio}>${precioDisplay}</Text>
                        </Text>
                      </View>
                    );
                  })
                ) : (
                  <Text style={styles.productoEmptyText}>
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
  mainContainer: {
    flex: 1,
    backgroundColor: '#F3EFFF',
    padding: 16,
    marginTop: 25,
  },
  loadingIndicator: {
    marginTop: 40,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#7E57C2',
    fontSize: 16,
  },
  titulo: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#7E57C2',
    marginBottom: 18,
    textAlign: 'center',
  },
  card: {
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
  },
  cardHeader: {
    backgroundColor: '#f548a7ff',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  cardHeaderDate: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cardInfoBox: {
    padding: 16,
    gap: 6,
  },
  cardInfoCliente: {
    color: '#5E35B1',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardInfoText: {
    color: '#7E57C2',
    fontSize: 15,
  },
  cardInfoStatus: {
    color: '#388E3C',
    fontSize: 15,
  },
  bold: {
    fontWeight: 'bold',
  },
  cardProductosBox: {
    backgroundColor: '#F3EFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
  },
  cardProductosTitle: {
    color: '#5E35B1',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
  },
  productoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    marginLeft: 8,
  },
  productoText: {
    color: '#7E57C2',
    marginLeft: 6,
    fontSize: 14,
  },
  productoPrecio: {
    color: '#5E35B1',
  },
  productoEmptyText: {
    color: '#7E57C2',
    fontStyle: 'italic',
    marginLeft: 8,
  },
});