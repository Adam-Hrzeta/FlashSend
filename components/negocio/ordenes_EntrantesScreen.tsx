import NotAuthorized from "@/components/ui/NotAuthorized";
import { API_BASE_URL } from '@/constants/ApiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Button, FlatList, Modal, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from "react-native";
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
  detalles?: DetallePedido[]; // <- para compatibilidad y evitar error TS
}

export default function ordenes_EntrantesScreen({ setNotAuth }: { setNotAuth?: (v: boolean) => void }) {
  const [pedidos, setPedidos] = useState<PedidoEntrante[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [pedidoAEnviar, setPedidoAEnviar] = useState<number | null>(null);
  const [repartidoresAliados, setRepartidoresAliados] = useState<any[]>([]);
  const [repartidorSeleccionado, setRepartidorSeleccionado] = useState<any | null>(null);
  const [loadingRepartidores, setLoadingRepartidores] = useState(false);
  const [notAuthState, setNotAuthState] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch principal (con spinner)
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
      const response = await fetch(`${API_BASE_URL}/api/pedidos_negocio/pedidos_pendientes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 403) {
        setNotAuth && setNotAuth(true);
        setNotAuthState(true);
        setLoading(false);
        return;
      }
      const data = await response.json();
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
      const res = await fetch(`${API_BASE_URL}/api/pedidos_negocio/pedidos_pendientes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
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

  // Obtener repartidores aliados aceptados y disponibles
  const fetchRepartidoresAliados = async () => {
    setLoadingRepartidores(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/negocio/solicitudes_aliados`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      // Filtrar solo aceptados (y opcional: disponibles)
      const aliadosAceptados = (data.solicitudes || []).filter((s: any) => s.estatus === 'aceptada');
      setRepartidoresAliados(aliadosAceptados);
    } catch (e) {
      setRepartidoresAliados([]);
    } finally {
      setLoadingRepartidores(false);
    }
  };

  // Mostrar modal y cargar repartidores aliados
  const abrirModalAsignar = (pedidoId: number) => {
    setPedidoAEnviar(pedidoId);
    setModalVisible(true);
    setRepartidorSeleccionado(null);
    fetchRepartidoresAliados();
  };

  // Enviar pedido (cambiar estatus a 'enviado' y asignar repartidor)
  const handleEnviar = async () => {
    if (!pedidoAEnviar || !repartidorSeleccionado) return;
    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/pedidos_negocio/enviar_pedido/${pedidoAEnviar}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ repartidor_id: repartidorSeleccionado.repartidor_id })
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Éxito', data.mensaje || 'Pedido enviado al repartidor');
        fetchPedidos();
      } else {
        // Mostrar mensaje de error exacto del backend
        Alert.alert('Error', data.error || data.mensaje || JSON.stringify(data) || 'No se pudo enviar el pedido');
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo enviar el pedido');
    }
    setModalVisible(false);
    setRepartidorSeleccionado(null);
    setPedidoAEnviar(null);
  };

  // Obtener nombre de cliente por id
  const [clientes, setClientes] = useState<{ [key: number]: string }>({});
  const fetchClienteNombre = async (clienteId: number) => {
    if (clientes[clienteId]) return clientes[clienteId];
    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/perfilCliente/perfilCliente?id=${clienteId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.cliente && data.cliente.nombre) {
        setClientes(prev => ({ ...prev, [clienteId]: data.cliente.nombre }));
        return data.cliente.nombre;
      }
    } catch { }
    return clienteId;
  };

  // Cargar nombres de clientes para los pedidos
  useEffect(() => {
    (async () => {
      for (const pedido of pedidos) {
        if (pedido.cliente_id && !clientes[pedido.cliente_id]) {
          await fetchClienteNombre(pedido.cliente_id);
        }
      }
    })();
    // eslint-disable-next-line
  }, [pedidos]);

  // Elimina el refresco automático, solo actualiza al enfocar o al hacer pull-to-refresh
  useFocusEffect(
    React.useCallback(() => {
      fetchPedidos();
    }, [])
  );

  // Mostrar todos los pedidos menos los cancelados y entregados
  const pedidosVisibles = pedidos.filter(p => p.estatus !== 'cancelado' && p.estatus !== 'entregado');

  if (loading) {
    return <ActivityIndicator size="large" color="#7E57C2" style={{ marginTop: 40 }} />;
  }

  if (!pedidos.length) {
    return <Text style={{ textAlign: 'center', marginTop: 40 }}>No hay pedidos entrantes</Text>;
  }

  if (notAuthState) {
    return <NotAuthorized message="No autorizado: solo negocios pueden acceder a este panel." />;
  }

  return (
    <View style={styles.mainContainer}>
      {/* Modal para seleccionar repartidor aliado */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Selecciona un repartidor aliado</Text>
            {loadingRepartidores ? (
              <ActivityIndicator color="#7E57C2" />
            ) : (
              <FlatList
                data={repartidoresAliados}
                keyExtractor={item => item.repartidor_id.toString()}
                renderItem={({ item }) => (
                  <TouchableHighlight
                    underlayColor="#E1BEE7"
                    style={[styles.repartidorItem, repartidorSeleccionado?.repartidor_id === item.repartidor_id && styles.repartidorItemSelected]}
                    onPress={() => setRepartidorSeleccionado(item)}
                  >
                    <Text style={[styles.repartidorText, repartidorSeleccionado?.repartidor_id === item.repartidor_id && styles.repartidorTextSelected]}>
                      {item.repartidor_nombre} (ID: {item.repartidor_id})
                    </Text>
                  </TouchableHighlight>
                )}
                ListEmptyComponent={<Text style={styles.emptyRepartidorText}>No hay repartidores aliados disponibles.</Text>}
                style={styles.repartidorList}
              />
            )}
            <Button
              title="Enviar pedido"
              color="#7E57C2"
              onPress={handleEnviar}
              disabled={!repartidorSeleccionado}
            />
            <Button title="Cancelar" color="#BDBDBD" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
      <Text style={styles.titulo}>Pedidos entrantes</Text>
      <FlatList
        data={pedidosVisibles}
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
                  <MaterialIcons name="person" size={18} color="#7E57C2" /> {item.cliente_nombre ? item.cliente_nombre : (clientes[item.cliente_id] ? clientes[item.cliente_id] : `ID: ${item.cliente_id}`)}
                </Text>
                <Text style={styles.cardInfoText}>
                  <MaterialIcons name="location-on" size={18} color="#7E57C2" /> <Text style={styles.label}>Dirección de entrega:</Text> {item.direccion_entrega || 'No disponible'}
                </Text>
                <Text style={styles.cardInfoText}>
                  <MaterialIcons name="attach-money" size={18} color="#7E57C2" /> <Text style={styles.label}>Total:</Text> ${item.total}
                </Text>
                <Text style={styles.cardInfoText}>
                  <MaterialIcons name="info" size={18} color="#7E57C2" /> <Text style={styles.label}>Estatus:</Text> {item.estatus || 'Pendiente'}
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
                          {detalle.nombre ? detalle.nombre : `Producto ${detalle.producto_id}`} <Text style={styles.label}>x{detalle.cantidad}</Text> <Text style={styles.productoPrecio}>${precioDisplay}</Text>
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
              {/* Botón dinámico según estatus */}
              {item.estatus === 'pendiente' && (
                <TouchableOpacity style={styles.boton} onPress={() => handleAceptar(item.id)}>
                  <Text style={styles.botonTexto}>Aceptar pedido</Text>
                </TouchableOpacity>
              )}
              {item.estatus === 'preparando' && (
                <TouchableOpacity style={styles.boton} onPress={() => abrirModalAsignar(item.id)}>
                  <MaterialIcons name="local-shipping" size={18} color="#fff" />
                  <Text style={styles.botonTexto}>Enviar con repartidor</Text>
                </TouchableOpacity>
              )}
              {item.estatus === 'enviado' && (
                <TouchableOpacity style={[styles.boton, styles.botonDisabled]} disabled>
                  <MaterialIcons name="local-shipping" size={18} color="#fff" />
                  <Text style={styles.botonTexto}>En reparto</Text>
                </TouchableOpacity>
              )}
              {item.estatus === 'en_camino' && (
                <TouchableOpacity style={[styles.boton, styles.botonDisabled]} disabled>
                  <MaterialIcons name="done" size={18} color="#fff" />
                  <Text style={styles.botonTexto}>En camino</Text>
                </TouchableOpacity>
              )}
              {item.estatus === 'entregado' && (
                <TouchableOpacity style={[styles.boton, styles.botonEntregado]} disabled>
                  <MaterialIcons name="check" size={18} color="#fff" />
                  <Text style={styles.botonTexto}>Entregado</Text>
                </TouchableOpacity>
              )}
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    width: 320,
    maxHeight: 400,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
  },
  repartidorList: {
    marginBottom: 16,
    maxHeight: 200,
  },
  repartidorItem: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F3EFFF',
    marginBottom: 6,
  },
  repartidorItemSelected: {
    backgroundColor: '#7E57C2',
  },
  repartidorText: {
    color: '#7E57C2',
    fontWeight: 'bold',
  },
  repartidorTextSelected: {
    color: '#fff',
  },
  emptyRepartidorText: {
    color: '#7E57C2',
    textAlign: 'center',
    marginTop: 10,
  },
  titulo: {
    fontSize: 24,
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
    backgroundColor: '#7E57C2',
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
  label: {
    fontWeight: 'bold',
    color: '#7E57C2',
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
  boton: {
    backgroundColor: '#7E57C2',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  botonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  botonEntregado: {
    backgroundColor: '#388E3C',
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});