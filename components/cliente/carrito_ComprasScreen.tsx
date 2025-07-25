import { useCarrito } from "@/components/context/CarritoContext";
import { API_BASE_URL } from "@/constants/ApiConfig";
import { getToken } from "@/utils/authToken";
import * as Location from 'expo-location';
import { useState } from "react";
import { Alert, FlatList, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Carrito_ComprasScreen() {
  const { productos, quitarProducto, neto, total, limpiarCarrito } = useCarrito();
  const [loading, setLoading] = useState(false);
  const [direccion, setDireccion] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [direccionEntrega, setDireccionEntrega] = useState<string | null>(null);
  const [obteniendoUbicacion, setObteniendoUbicacion] = useState(false);
  const [direccionManual, setDireccionManual] = useState("");
  const [seleccionUbicacion, setSeleccionUbicacion] = useState<"actual"|"manual"|null>(null);

  const solicitarUbicacion = async () => {
    setObteniendoUbicacion(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se requiere permiso de ubicación para continuar.');
        setObteniendoUbicacion(false);
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      // Opcional: obtener dirección legible
      let address = `Lat: ${latitude}, Lng: ${longitude}`;
      try {
        const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geocode && geocode.length > 0) {
          const g = geocode[0];
          address = `${g.street || ''} ${g.name || ''}, ${g.city || ''}, ${g.region || ''}, ${g.country || ''}`;
        }
      } catch { }
      setDireccionEntrega(address);
      return address;
    } catch (e) {
      Alert.alert('Error', 'No se pudo obtener la ubicación.');
    } finally {
      setObteniendoUbicacion(false);
    }
  };

  const realizarPedido = async () => {
    let direccionFinal = direccionEntrega;
    if (!direccionFinal) {
      if (seleccionUbicacion === "actual") {
        const address = await solicitarUbicacion();
        if (!address) return;
        direccionFinal = address;
      } else if (seleccionUbicacion === "manual") {
        if (!direccionManual.trim()) {
          Alert.alert("Error", "Por favor ingresa una dirección válida.");
          return;
        }
        direccionFinal = direccionManual.trim();
        setDireccionEntrega(direccionFinal);
      } else {
        // Mostrar modal para elegir ubicación
        setModalVisible(true);
        return;
      }
    }
    setLoading(true);
    try {
      const token = await getToken();
      const negocio_id = productos.length > 0 ? productos[0].negocio_id : null;
      const res = await fetch(`${API_BASE_URL}/api/pedidos_cliente/realizar_pedido`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          productos: productos.map(p => ({ id: p.id, cantidad: p.cantidad, precio: p.precio })),
          total,
          negocio_id,
          direccion_entrega: direccionFinal
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        Alert.alert("Pedido realizado", "Tu pedido ha sido registrado con éxito.");
        limpiarCarrito();
        setDireccionEntrega(null);
        setDireccionManual("");
        setSeleccionUbicacion(null);
      } else {
        Alert.alert("Error", data.message || "No se pudo realizar el pedido.");
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.itemContainer}>
      {item.imagen_url && (
        <Image source={{ uri: item.imagen_url }} style={styles.imageLarge} />
      )}
      <View style={styles.info}>
        <Text style={styles.name}>{item.nombre}</Text>
        <Text style={styles.price}>${item.precio.toFixed(2)} x {item.cantidad}</Text>
        <TouchableOpacity onPress={() => quitarProducto(item.id)} style={styles.removeBtn}>
          <Text style={styles.removeText}>Quitar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Obtener el negocioId del primer producto del carrito (si existe)
  const negocioId = productos.length > 0 ? productos[0].negocio_id : null;

  return (
    <View style={styles.container}>
      {/* Botón de regresar y título en la misma fila */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 8 }}>
        <Text style={styles.title}>Mi Carrito de Compras</Text>
      </View>
      <FlatList
        data={productos}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={<Text style={styles.empty}>No hay productos en el carrito.</Text>}
      />
      <View style={styles.totals}>
        <Text style={styles.totalText}>Neto: ${neto.toFixed(2)}</Text>
        <Text style={styles.totalText}>Total: ${total.toFixed(2)}</Text>
      </View>
      <TouchableOpacity style={styles.clearBtn} onPress={limpiarCarrito}>
        <Text style={styles.clearText}>Vaciar carrito</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.clearBtn, { backgroundColor: '#7E57C2', marginTop: 12 }]}
        onPress={() => setModalVisible(true)}
        disabled={productos.length === 0 || loading || obteniendoUbicacion}
      >
        <Text style={[styles.clearText, { color: '#fff' }]}>{loading ? 'Enviando...' : obteniendoUbicacion ? 'Obteniendo ubicación...' : 'Realizar pedido'}</Text>
      </TouchableOpacity>
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 16, width: 320 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Selecciona la dirección de entrega</Text>
            <TouchableOpacity
              style={{ backgroundColor: seleccionUbicacion === 'actual' ? '#7E57C2' : '#F3EFFF', padding: 12, borderRadius: 8, marginBottom: 8 }}
              onPress={async () => {
                setSeleccionUbicacion('actual');
                setModalVisible(false);
                await realizarPedido();
              }}
            >
              <Text style={{ color: seleccionUbicacion === 'actual' ? '#fff' : '#7E57C2', fontWeight: 'bold' }}>Usar mi ubicación actual</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ backgroundColor: seleccionUbicacion === 'manual' ? '#7E57C2' : '#F3EFFF', padding: 12, borderRadius: 8, marginBottom: 8 }}
              onPress={() => setSeleccionUbicacion('manual')}
            >
              <Text style={{ color: seleccionUbicacion === 'manual' ? '#fff' : '#7E57C2', fontWeight: 'bold' }}>Ingresar otra dirección</Text>
            </TouchableOpacity>
            {seleccionUbicacion === 'manual' && (
              <TextInput
                style={{ borderWidth: 1, borderColor: '#7E57C2', borderRadius: 8, padding: 8, marginBottom: 12 }}
                placeholder="Escribe la dirección de entrega"
                value={direccionManual}
                onChangeText={setDireccionManual}
              />
            )}
            {seleccionUbicacion === 'manual' && (
              <TouchableOpacity
                style={{ backgroundColor: '#7E57C2', padding: 12, borderRadius: 8, marginBottom: 8 }}
                onPress={async () => {
                  setModalVisible(false);
                  await realizarPedido();
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Confirmar dirección manual</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={{ backgroundColor: '#BDBDBD', padding: 12, borderRadius: 8 }}
              onPress={() => {
                setModalVisible(false);
                setSeleccionUbicacion(null);
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff', marginTop: 25 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#7E57C2' },
  itemContainer: { flexDirection: 'row', marginBottom: 16, backgroundColor: '#f3e7e9', borderRadius: 12, padding: 8 },
  imageLarge: { width: 100, height: 100, borderRadius: 12, marginRight: 16 },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#5E35B1' },
  price: { color: '#5E35B1', fontWeight: '600' },
  removeBtn: { marginTop: 4, backgroundColor: '#F44336', borderRadius: 6, padding: 4, alignSelf: 'flex-start' },
  removeText: { color: '#fff', fontWeight: 'bold' },
  totals: { marginTop: 16, marginBottom: 8 },
  totalText: { fontSize: 18, fontWeight: 'bold', color: '#7E57C2' },
  clearBtn: { backgroundColor: '#E1BEE7', borderRadius: 8, padding: 10, alignItems: 'center', marginTop: 8 },
  clearText: { color: '#7E57C2', fontWeight: 'bold' },
  empty: { color: '#7E57C2', textAlign: 'center', marginTop: 32 },
  backButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingVertical: 7,
    paddingHorizontal: 18,
    marginTop: 14,
    marginRight: 12,
    marginBottom: 6,
    elevation: 2,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 4,
    borderWidth: 1.2,
    borderColor: '#E1BEE7',
  },
  backButtonIcon: {
    fontSize: 18,
    color: '#7E57C2',
    marginRight: 7,
    fontWeight: 'bold',
    textShadowColor: '#E1BEE7',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  backButtonText: {
    color: '#7E57C2',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.3,
  },
});