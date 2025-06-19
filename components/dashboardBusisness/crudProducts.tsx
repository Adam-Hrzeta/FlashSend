import { API_BASE_URL } from '@/constants/ApiConfig';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Animated, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria?: string;
  stock: number;
  fecha_creacion: string;
  imagen_url?: string;
}

export default function CrudProducts() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editProducto, setEditProducto] = useState<Partial<Producto> | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const fetchProductos = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('access_token');
    const res = await fetch(`${API_BASE_URL}/api/productos/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      setProductos(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProductos();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleAdd = () => {
    setEditProducto({ nombre: '', descripcion: '', precio: 0, categoria: '', stock: 0 });
    setImage(null);
    setModalVisible(true);
  };

  const handleEdit = (producto: Producto) => {
    setEditProducto(producto);
    setImage(producto.imagen_url || null);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    const token = await AsyncStorage.getItem('access_token');
    await fetch(`${API_BASE_URL}/api/productos/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchProductos();
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.7 });
    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setUploading(true);
    const token = await AsyncStorage.getItem('access_token');
    const formData = new FormData();
    if (editProducto?.nombre) formData.append('nombre', editProducto.nombre);
    if (editProducto?.descripcion) formData.append('descripcion', editProducto.descripcion);
    if (editProducto?.precio) formData.append('precio', String(editProducto.precio));
    if (editProducto?.categoria) formData.append('categoria', editProducto.categoria);
    if (editProducto?.stock !== undefined) formData.append('stock', String(editProducto.stock));
    if (image) {
      formData.append('imagen', { uri: image, type: 'image/jpeg', name: `producto_${Date.now()}.jpg` } as any);
    }
    const method = editProducto?.id ? 'PUT' : 'POST';
    const url = editProducto?.id ? `${API_BASE_URL}/api/productos/${editProducto.id}` : `${API_BASE_URL}/api/productos/`;
    const res = await fetch(url, {
      method,
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    if (res.ok) {
      setModalVisible(false);
      fetchProductos();
    } else {
      Alert.alert('Error', 'No se pudo guardar el producto');
    }
    setUploading(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 20 }}>
      <Text style={styles.title}>Gestión de Productos</Text>
      <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
        <MaterialIcons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Agregar producto</Text>
      </TouchableOpacity>
      {loading ? <ActivityIndicator size="large" color="#7E57C2" /> : (
        <ScrollView>
          {productos.map((producto, idx) => (
            <Animated.View
              key={producto.id}
              style={{
                ...styles.productCard,
                opacity: fadeAnim,
                transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {producto.imagen_url && (
                  <Image source={{ uri: API_BASE_URL + producto.imagen_url }} style={styles.productImage} />
                )}
                <View style={styles.productInfoBox}>
                  <Text style={styles.productName}>{producto.nombre}</Text>
                  <Text style={styles.productDesc}>{producto.descripcion}</Text>
                  <Text style={styles.productPrice}>${producto.precio}</Text>
                  <Text style={styles.productStock}>Stock: {producto.stock}</Text>
                  <Text style={styles.productCat}>{producto.categoria}</Text>
                  <View style={styles.actionRow}>
                    <TouchableOpacity onPress={() => handleEdit(producto)} style={styles.editBtn}>
                      <MaterialIcons name="edit" size={20} color="#7E57C2" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(producto.id)} style={styles.deleteBtn}>
                      <MaterialIcons name="delete" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Animated.View>
          ))}
        </ScrollView>
      )}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editProducto?.id ? 'Editar producto' : 'Agregar producto'}</Text>
            <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
              <MaterialIcons name="image" size={28} color="#7E57C2" />
              <Text style={styles.imagePickerText}>{image ? 'Cambiar imagen' : 'Seleccionar imagen'}</Text>
            </TouchableOpacity>
            {image && <Image source={{ uri: image }} style={styles.modalImage} />}
            <TextInput style={styles.input} placeholder="Nombre" value={editProducto?.nombre} onChangeText={t => setEditProducto({ ...editProducto, nombre: t })} />
            <TextInput style={styles.input} placeholder="Descripción" value={editProducto?.descripcion} onChangeText={t => setEditProducto({ ...editProducto, descripcion: t })} />
            <TextInput style={styles.input} placeholder="Precio" value={editProducto?.precio?.toString()} onChangeText={t => setEditProducto({ ...editProducto, precio: Number(t) })} keyboardType="decimal-pad" />
            <TextInput style={styles.input} placeholder="Categoría" value={editProducto?.categoria} onChangeText={t => setEditProducto({ ...editProducto, categoria: t })} />
            <TextInput style={styles.input} placeholder="Stock" value={editProducto?.stock?.toString()} onChangeText={t => setEditProducto({ ...editProducto, stock: Number(t) })} keyboardType="number-pad" />
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={uploading}>
              {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Guardar</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#7E57C2' },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#7E57C2', padding: 12, borderRadius: 10, marginBottom: 18, alignSelf: 'flex-start' },
  addButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F5FF',
    borderRadius: 20,
    marginBottom: 24,
    padding: 16,
    elevation: 3,
    alignItems: 'center',
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
    marginRight: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E1BEE7',
  },
  productInfoBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 6,
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#7E57C2',
    marginBottom: 4,
    textAlign: 'left',
  },
  productDesc: {
    color: '#5E35B1',
    marginBottom: 8,
    fontSize: 16,
    textAlign: 'left',
  },
  productPrice: {
    color: '#43A047',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 4,
    textAlign: 'left',
  },
  productStock: {
    color: '#BA68C8',
    fontSize: 16,
    marginBottom: 2,
    textAlign: 'left',
  },
  productCat: {
    color: '#9575CD',
    fontStyle: 'italic',
    fontSize: 15,
    marginBottom: 8,
    textAlign: 'left',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'center',
  },
  editBtn: { marginRight: 12, backgroundColor: '#fff', borderRadius: 8, padding: 6, borderWidth: 1, borderColor: '#7E57C2' },
  deleteBtn: { backgroundColor: '#E57373', borderRadius: 8, padding: 6 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(126,87,194,0.22)', padding: 16 },
  modalContent: { width: '90%', backgroundColor: '#fff', padding: 24, borderRadius: 20, elevation: 12, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#7E57C2', marginBottom: 18 },
  imagePickerBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  imagePickerText: { color: '#7E57C2', marginLeft: 8, fontWeight: 'bold' },
  modalImage: { width: 120, height: 120, borderRadius: 10, marginBottom: 10 },
  input: { width: '100%', borderBottomWidth: 1.5, borderBottomColor: '#BA68C8', padding: 10, fontSize: 16, color: '#5E35B1', marginBottom: 10 },
  saveBtn: { backgroundColor: '#7E57C2', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 16, marginTop: 10, alignItems: 'center', width: '100%' },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 17, textAlign: 'center' },
  cancelBtn: { marginTop: 0, paddingVertical: 10, width: '100%', alignItems: 'center', borderRadius: 12 },
  cancelBtnText: { color: '#7E57C2', fontWeight: '700', fontSize: 16 },
});