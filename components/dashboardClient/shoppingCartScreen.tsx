import { useCarrito } from "@/components/context/CarritoContext";
import { API_BASE_URL } from "@/constants/ApiConfig";
import { getToken } from "@/utils/authToken";
import { useState } from "react";
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ShoppingCartScreen() {
  const { productos, quitarProducto, neto, total, limpiarCarrito } = useCarrito();
  const [loading, setLoading] = useState(false);

  const realizarPedido = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      // Obtener negocio_id del primer producto (asumiendo todos son del mismo negocio)
      const negocio_id = productos.length > 0 ? productos[0].negocio_id : null;
      console.log('[DEBUG] negocio_id a enviar:', negocio_id, productos);
      const res = await fetch(`${API_BASE_URL}/api/pedidos_cliente/realizar_pedido`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          productos: productos.map(p => ({ id: p.id, cantidad: p.cantidad, precio: p.precio })),
          total,
          negocio_id
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        Alert.alert("Pedido realizado", "Tu pedido ha sido registrado con éxito.");
        limpiarCarrito();
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Carrito</Text>
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
        onPress={realizarPedido}
        disabled={productos.length === 0 || loading}
      >
        <Text style={[styles.clearText, { color: '#fff' }]}>{loading ? 'Enviando...' : 'Realizar pedido'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
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
});