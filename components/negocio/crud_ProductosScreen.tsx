import NotAuthorized from "@/components/ui/NotAuthorized";
import { API_BASE_URL } from '@/constants/ApiConfig';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Animated, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria?: string;
  fecha_creacion: string;
  imagen_url?: string;
  disponible?: boolean;
}

const CATEGORIAS = [
  'Bebidas',
  'Snacks',
  'Lácteos',
  'Panadería',
  'Dulces',
  'Aseo',
  'Hogar',
  'Otros',
];

export default function Crud_ProductosScreen({ setNotAuth }: { setNotAuth?: (v: boolean) => void }) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editProducto, setEditProducto] = useState<Partial<Producto> | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [notAuthState, setNotAuthState] = useState(false);

  const fetchProductos = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('access_token');
    if (!token) {
      setNotAuth && setNotAuth(true);
      setNotAuthState(true);
      setLoading(false);
      return;
    }
    const res = await fetch(`${API_BASE_URL}/api/productos/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.status === 403) {
      setNotAuth && setNotAuth(true);
      setNotAuthState(true);
      setLoading(false);
      return;
    }
    if (res.ok) {
      setProductos((await res.json()).filter((p: Producto) => p));
    }
    setLoading(false);
  };
  // Marcar producto como no disponible
  const handleToggleDisponible = async (id: number, disponible: boolean) => {
    const token = await AsyncStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/productos/${id}/disponible`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ disponible }),
      });
      if (res.ok) {
        Alert.alert('Éxito', disponible ? 'Producto marcado como disponible' : 'Producto marcado como no disponible');
        fetchProductos();
      } else {
        const data = await res.json().catch(() => ({}));
        Alert.alert('Error', data?.mensaje || 'No se pudo actualizar la disponibilidad');
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    }
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
    setEditProducto({ nombre: '', descripcion: '', precio: 0, categoria: ''});
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

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!editProducto?.nombre || editProducto.nombre.trim() === '') newErrors.nombre = 'El nombre es obligatorio';
    if (!editProducto?.descripcion || editProducto.descripcion.trim() === '') newErrors.descripcion = 'La descripción es obligatoria';
    if (editProducto?.precio === undefined || editProducto.precio <= 0) newErrors.precio = 'El precio debe ser mayor a 0';
    if (!editProducto?.categoria || editProducto.categoria.trim() === '') newErrors.categoria = 'La categoría es obligatoria';
    return newErrors;
  };

  const handleSave = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setUploading(true);
    const token = await AsyncStorage.getItem('access_token');
    const formData = new FormData();
    if (editProducto?.nombre) formData.append('nombre', editProducto.nombre);
    if (editProducto?.descripcion) formData.append('descripcion', editProducto.descripcion);
    if (editProducto?.precio) formData.append('precio', String(editProducto.precio));
    if (editProducto?.categoria) formData.append('categoria', editProducto.categoria);
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

function isProductoDisponible(producto: Producto): boolean {
  const val = producto.disponible;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val === 1;
  if (typeof val === 'string') {
    const strVal = String(val).toLowerCase();
    return val === '1' || strVal === 'true';
  }
  return false;
}

  if (notAuthState) {
    return <NotAuthorized message="No autorizado: solo negocios pueden acceder a este panel." />;
  }

  return (
    <View style={styles.mainContainer}>
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
              <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 110 }}>
                {producto.imagen_url && (
                  <Image source={{ uri: API_BASE_URL + producto.imagen_url }} style={styles.productImageBetter} />
                )}
                <View style={styles.productInfoBoxBetter}>
                  <View style={styles.productHeaderRow}>
                    <Text style={styles.productNameBetter} numberOfLines={1}>{producto.nombre}</Text>
                    <Text style={styles.productPriceBetter}>${producto.precio}</Text>
                  </View>
                  <Text style={styles.productDescBetter} numberOfLines={2}>{producto.descripcion}</Text>
                  <Text style={styles.productCatBetter}>{producto.categoria}</Text>
                  <View style={styles.actionRowBetter}>
                    <TouchableOpacity onPress={() => handleEdit(producto)} style={styles.editBtn}>
                      <MaterialIcons name="edit" size={20} color="#7E57C2" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(producto.id)} style={styles.deleteBtn}>
                      <MaterialIcons name="delete" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.toggleBtn, { backgroundColor: isProductoDisponible(producto) ? '#43A047' : '#BDBDBD' }]}
                      onPress={() => handleToggleDisponible(producto.id, !isProductoDisponible(producto))}
                    >
                      <MaterialIcons name={isProductoDisponible(producto) ? 'check-circle' : 'block'} size={18} color="#fff" />
                      <Text style={styles.toggleBtnText}>{isProductoDisponible(producto) ? 'Disponible' : 'No disponible'}</Text>
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
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, { paddingLeft: 36 }]}
                placeholder="Nombre del producto"
                value={editProducto?.nombre}
                onChangeText={t => { setEditProducto({ ...editProducto, nombre: t }); setErrors({ ...errors, nombre: '' }); }}
              />
              <MaterialIcons name="drive-file-rename-outline" size={22} color="#7E57C2" style={{ position: 'absolute', top: 14, left: 8 }} />
            </View>
            {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, { paddingLeft: 36 }]}
                placeholder="Descripción del producto"
                value={editProducto?.descripcion}
                onChangeText={t => { setEditProducto({ ...editProducto, descripcion: t }); setErrors({ ...errors, descripcion: '' }); }}
                multiline
              />
              <MaterialIcons name="description" size={22} color="#7E57C2" style={{ position: 'absolute', top: 14, left: 8 }} />
            </View>
            {errors.descripcion && <Text style={styles.errorText}>{errors.descripcion}</Text>}
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, { paddingLeft: 36 }]}
                placeholder="Precio en pesos"
                value={editProducto?.precio !== undefined ? `$${editProducto?.precio}` : ''}
                onChangeText={t => {
                  const val = t.replace(/[^\d]/g, '');
                  setEditProducto({ ...editProducto, precio: Number(val) });
                  setErrors({ ...errors, precio: '' });
                }}
                keyboardType="number-pad"
              />
              <MaterialIcons name="attach-money" size={22} color="#43A047" style={{ position: 'absolute', top: 14, left: 8 }} />
            </View>
            {errors.precio && <Text style={styles.errorText}>{errors.precio}</Text>}
            <View style={styles.categoriaPickerWrapper}>
              <Text style={styles.categoriaLabel}>Categoría</Text>
              <View style={styles.categoriaPickerRow}>
                <MaterialIcons name="category" size={22} color="#9575CD" style={styles.categoriaIcon} />
                <Picker
                  selectedValue={editProducto?.categoria}
                  style={styles.categoriaPicker}
                  onValueChange={t => { setEditProducto({ ...editProducto, categoria: t }); setErrors({ ...errors, categoria: '' }); }}
                  dropdownIconColor="#9575CD"
                >
                  <Picker.Item label="Seleccionar" value="" color="#aaa" />
                  {CATEGORIAS.map(cat => (
                    <Picker.Item key={cat} label={cat} value={cat} />
                  ))}
                </Picker>
              </View>
            </View>
            {errors.categoria && <Text style={styles.errorText}>{errors.categoria}</Text>}
            {/* Stock eliminado, no se usa */}
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
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 40,
  },
  productHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 2,
  },
  inputWrapper: {
    width: '100%',
  },
  errorText: {
    color: 'red',
    alignSelf: 'flex-start',
  },
  categoriaPickerWrapper: {
    width: '100%',
    marginBottom: 10,
  },
  categoriaLabel: {
    marginLeft: 4,
    color: '#9575CD',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  categoriaPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F5FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BA68C8',
  },
  categoriaIcon: {
    marginLeft: 10,
    marginRight: 4,
  },
  categoriaPicker: {
    flex: 1,
    height: 50,
    color: '#5E35B1',
    backgroundColor: 'transparent',
  },
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
  productImageBetter: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E1BEE7',
  },
  productInfoBoxBetter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 2,
  },
  productNameBetter: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7E57C2',
    flex: 1,
    marginRight: 6,
  },
  productPriceBetter: {
    color: '#43A047',
    fontWeight: 'bold',
    fontSize: 15,
    marginRight: 8,
  },
  productStockBetter: {
    color: '#BA68C8',
    fontSize: 13,
    fontWeight: 'bold',
  },
  productDescBetter: {
    color: '#5E35B1',
    fontSize: 13,
    marginBottom: 2,
    marginTop: 2,
    textAlign: 'left',
  },
  productCatBetter: {
    color: '#9575CD',
    fontStyle: 'italic',
    fontSize: 12,
    marginBottom: 2,
    textAlign: 'left',
  },
  actionRowBetter: {
    flexDirection: 'row',
    marginTop: 4,
    justifyContent: 'flex-start',
    gap: 8,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 4,
    gap: 6,
  },
  toggleBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 4,
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