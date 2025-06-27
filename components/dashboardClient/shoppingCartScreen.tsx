import { useCarrito } from "@/components/context/CarritoContext";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ShoppingCartScreen() {
  const { productos, quitarProducto, neto, total, limpiarCarrito } = useCarrito();

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
      {/* Aquí irá el botón para realizar pedido */}
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