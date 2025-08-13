import { API_BASE_URL } from '@/constants/ApiConfig';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ImagePickerComponent from '../cliente/modal-foto/imagenpiker';

export interface Cliente {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  avatar: string;
  fecha_nacimiento: string;
}

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

export default function Perfil_ClienteScreen({ setNotAuth }: { setNotAuth?: (v: boolean) => void }) {
  const headerAnim = React.useRef(new Animated.Value(0)).current;
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState<Partial<Cliente>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  const [historial, setHistorial] = useState<PedidoHistorial[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(true);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const fetchCliente = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        setNotAuth && setNotAuth(true);
        setLoading(false);
        return;
      }
      // Evitar llamadas repetidas si ya se tiene el cliente
      if (cliente) {
        setLoading(false);
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/perfilCliente/perfilCliente`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 403) {
        setNotAuth && setNotAuth(true);
        setLoading(false);
        return;
      }
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.mensaje || 'Solo los clientes pueden acceder a este modulo.');
      }
      const data = await response.json();
      setCliente(data.cliente);
      setEditData(data.cliente);
    } catch (err) {
      setError(
        typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message?: string }).message)
          : 'No tienes permiso para ver este perfil.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchHistorial = async () => {
    setLoadingHistorial(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        setNotAuth && setNotAuth(true);
        setLoadingHistorial(false);
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/pedidos_cliente/historial`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 403) {
        setNotAuth && setNotAuth(true);
        setLoadingHistorial(false);
        return;
      }
      const data = await response.json();
      setHistorial(data.pedidos || []);
    } catch (e) {
      setHistorial([]);
    } finally {
      setLoadingHistorial(false);
    }
  };

  useEffect(() => {
    fetchCliente();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchCliente();
      fetchHistorial();
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }).start();
    }, [])
  );

  const handleEdit = () => {
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    let fechaModificada = editData.fecha_nacimiento;

    if (fechaModificada) {
      const fecha = new Date(fechaModificada);
      fecha.setDate(fecha.getDate() - 1);
      fechaModificada = fecha.toISOString().split('T')[0];
    }

    // Solo enviar los campos permitidos
    const { nombre, correo, telefono, fecha_nacimiento } = editData;
    const payload = {
      nombre,
      correo,
      telefono,
      fecha_nacimiento: fechaModificada,
    };

    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/perfilCliente/editarPerfil`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.mensaje || 'Error al editar');
      }

      const data = await response.json();
      // Si el avatar viene vacío, null, o es una cadena muy corta, conservar el anterior
      // Al editar datos personales, siempre conservar el avatar anterior
      let newCliente = { ...data.cliente, avatar: cliente?.avatar };
      setCliente(newCliente);
      setEditModalVisible(false);
      Alert.alert('Perfil actualizado');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    }
  };

  const handleImageSelected = async (uri: string) => {
    try {
      setIsUpdatingPhoto(true);
      const token = await AsyncStorage.getItem('access_token');

      const formData = new FormData();
      formData.append('image', {
        uri,
        type: 'image/jpeg',
        name: `avatar_${Date.now()}.jpg`,
      } as any);

      const uploadResponse = await fetch(
        `${API_BASE_URL}/api/perfilCliente/upload_profile_image`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        const data = await uploadResponse.json().catch(() => ({}));
        throw new Error(data?.mensaje || 'Error al actualizar la foto');
      }
        if (!uploadResponse.ok) {
          const data = await uploadResponse.json().catch(() => ({}));
          throw new Error(data?.mensaje || 'Error al actualizar la foto');
        }
        // Solo refresca si hay token y no error previo
        if (token) {
          const profileRes = await fetch(
            `${API_BASE_URL}/api/perfilCliente/perfilCliente`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          if (!profileRes.ok) {
            throw new Error('Error al refrescar perfil');
          }
          const profileData = await profileRes.json();
          setCliente(profileData.cliente);
        }

      Alert.alert('Éxito', 'Foto de perfil actualizada correctamente');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo actualizar la foto de perfil');
    } finally {
      setIsUpdatingPhoto(false);
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permiso requerido', 'Se necesita permiso para acceder a la galería.');
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      const uri = pickerResult.assets[0].uri;
      await handleImageSelected(uri);
    }
  };

  const handleLogout = async () => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }
    await AsyncStorage.removeItem('access_token');
    setCliente(null);
    Alert.alert('Sesión cerrada');
    router.replace('/');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    date.setDate(date.getDate() + 1);
    return new Intl.DateTimeFormat('es-ES').format(date);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7E57C2" />
        <Text style={{ color: '#7E57C2', marginTop: 18, fontWeight: 'bold', fontSize: 18 }}>Cargando perfil...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#C62828" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F3EFFF' }}>
      {/* Header con degradado y avatar */}
      <Animated.View style={{
        height: 110,
        width: '100%',
        backgroundColor: 'transparent',
        justifyContent: 'flex-end',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 10,
        opacity: headerAnim,
      }}>
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 110,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          overflow: 'hidden',
        }}>
          <View style={{
            flex: 1,
            backgroundColor: '#7E57C2',
            opacity: 0.92,
          }} />
        </View>
        <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '90%' }}>
            <View style={{
              backgroundColor: '#fff',
              borderRadius: 90,
              width: 60,
              height: 60,
              justifyContent: 'center',
              alignItems: 'center',
              elevation: 4,
              shadowColor: '#7E57C2',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.10,
              shadowRadius: 4,
            }}>
              {cliente?.avatar && (
                <Image
                  source={{ uri: localAvatar || cliente.avatar + `?t=${Date.now()}` }}
                  style={{ width: 50, height: 50, borderRadius: 25 }}
                />
              )}
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
                  backgroundColor: '#fff',
                  borderRadius: 10,
                  padding: 3,
                  elevation: 1,
                  shadowColor: '#7E57C2',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.08,
                  shadowRadius: 1,
                }}
                onPress={() => !isUpdatingPhoto && setShowImagePicker(true)}
              >
                <MaterialIcons name="camera-alt" size={12} color="#7E57C2" />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, marginLeft: 10, justifyContent: 'center', alignItems: 'flex-start', height: 60 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#fff',
                  textShadowColor: '#7E57C2',
                  textShadowRadius: 4,
                  flexShrink: 1,
                  flexWrap: 'wrap',
                  textAlign: 'left',
                  maxWidth: '95%',
                }}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {cliente?.nombre}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Selector de imagen para cambiar foto de perfil */}
      {showImagePicker && (
        <ImagePickerComponent
          visible={showImagePicker}
          onRequestClose={() => setShowImagePicker(false)}
          onImageSelected={async (uri: string) => {
            await handleImageSelected(uri);
            setShowImagePicker(false);
          }}
        />
      )}

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingTop: 110, alignItems: 'center', paddingBottom: 20 }}>
        {/* Tarjeta de información personal */}
        <View style={styles.cardInfoPersonal}>
          <Text style={styles.cardTitle}>Información personal</Text>
          <View style={styles.infoRow}><MaterialIcons name="email" size={22} color={'#7E57C2'} /><Text style={styles.infoText}>{cliente?.correo}</Text></View>
          <View style={styles.infoRow}><MaterialIcons name="phone" size={22} color={'#7E57C2'} /><Text style={styles.infoText}>{cliente?.telefono}</Text></View>
          <View style={styles.infoRow}><MaterialIcons name="cake" size={22} color={'#7E57C2'} /><Text style={styles.infoText}>{formatDate(cliente?.fecha_nacimiento) || 'Sin fecha de nacimiento'}</Text></View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <MaterialIcons name="edit" size={22} color="#7E57C2" />
              <Text style={styles.editButtonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <MaterialIcons name="logout" size={22} color="#fff" />
              <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sección de historial de pedidos */}
        <View style={styles.cardPedidos}>
          <Text style={styles.cardTitle}>Pedidos activos</Text>
          {loadingHistorial ? (
            <View style={{ alignItems: 'center', paddingVertical: 18 }}>
              <ActivityIndicator size="small" color="#7E57C2" />
              <Text style={{ color: '#7E57C2', marginTop: 8 }}>Cargando pedidos...</Text>
            </View>
          ) : historial.length === 0 ? (
            <Text style={styles.noPedidosText}>No hay pedidos recientes</Text>
          ) : (
            historial.filter(pedido => pedido.estatus !== 'entregado').length === 0 ? (
              <Text style={styles.noPedidosText}>No hay pedidos activos</Text>
            ) : (
              historial.filter(pedido => pedido.estatus !== 'entregado').map((pedido) => {
                const fechaLegible = new Intl.DateTimeFormat('es-MX', {
                  year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'
                }).format(new Date(pedido.fecha));
                const productos = pedido.productos && pedido.productos.length > 0 ? pedido.productos : (pedido.detalles || []);
                return (
                  <View key={pedido.id} style={styles.pedidoCard}>
                    <View style={styles.pedidoHeader}>
                      <Text style={styles.pedidoHeaderText}><MaterialIcons name="receipt" size={20} color="#fff" /> Pedido #{pedido.id}</Text>
                      <Text style={styles.pedidoHeaderDate}>{fechaLegible}</Text>
                    </View>
                    <View style={styles.pedidoInfo}>
                      <Text style={styles.pedidoNegocio}><MaterialIcons name="store" size={16} color="#7E57C2" /> {pedido.negocio_nombre || pedido.negocio_id}</Text>
                      <Text style={styles.pedidoTotal}><MaterialIcons name="attach-money" size={16} color="#7E57C2" /> <Text style={{ fontWeight: 'bold' }}>Total:</Text> ${pedido.total}</Text>
                      <Text style={styles.pedidoEstatus}><MaterialIcons name="info" size={16} color="#7E57C2" /> <Text style={{ fontWeight: 'bold' }}>Estatus:</Text> {pedido.estatus === 'enviado' ? 'En camino' : pedido.estatus}</Text>
                      <Text style={styles.pedidoDireccion}><MaterialIcons name="location-on" size={16} color="#7E57C2" /> <Text style={{ fontWeight: 'bold' }}>Dirección:</Text> {pedido.direccion_entrega}</Text>
                    </View>
                    <View style={styles.pedidoProductos}>
                      <Text style={styles.pedidoProductosTitle}><MaterialIcons name="shopping-cart" size={16} color="#7E57C2" /> Productos:</Text>
                      {productos.length > 0 ? (
                        productos.map((prod, idx) => {
                          const precio = prod.precio_unitario;
                          let precioDisplay = "N/A";
                          if (precio !== undefined && precio !== null && !isNaN(Number(precio))) {
                            precioDisplay = Number(precio).toFixed(2);
                          }
                          return (
                            <View key={idx} style={styles.pedidoProductoRow}>
                              <MaterialIcons name="check-circle" size={14} color="#7E57C2" />
                              <Text style={styles.pedidoProductoText}>{prod.nombre ? prod.nombre : `Producto ${prod.producto_id}`} <Text style={{ fontWeight: 'bold' }}>x{prod.cantidad}</Text> <Text style={{ color: '#5E35B1' }}>@ ${precioDisplay}</Text></Text>
                            </View>
                          );
                        })
                      ) : (
                        <Text style={styles.pedidoProductoEmpty}>No hay productos asociados.</Text>
                      )}
                    </View>
                  </View>
                );
              })
            )
          )}
        </View>

        {/* Modal de edición */}
        <Modal
          visible={editModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContentCustom}>
              {/* Icon and Title */}
              <View style={styles.modalIconCircle}>
                <MaterialIcons name="edit" size={38} color="#fff" />
              </View>
              <Text style={styles.modalTitleCustom}>Editar información</Text>

              {/* Input Fields */}
              <View style={styles.inputRow}>
                <MaterialIcons name="person" size={20} color="#BA68C8" style={styles.inputIcon} />
                <TextInput
                  style={styles.inputCustom}
                  placeholder="Nombre"
                  placeholderTextColor="#BA68C8"
                  value={editData.nombre || ''}
                  onChangeText={text => setEditData({ ...editData, nombre: text })}
                />
              </View>
              <View style={styles.inputRow}>
                <MaterialIcons name="email" size={20} color="#BA68C8" style={styles.inputIcon} />
                <TextInput
                  style={styles.inputCustom}
                  placeholder="Correo"
                  placeholderTextColor="#BA68C8"
                  value={editData.correo || ''}
                  onChangeText={text => setEditData({ ...editData, correo: text })}
                  keyboardType="email-address"
                />
              </View>
              <View style={styles.inputRow}>
                <MaterialIcons name="phone" size={20} color="#BA68C8" style={styles.inputIcon} />
                <TextInput
                  style={styles.inputCustom}
                  placeholder="Teléfono"
                  placeholderTextColor="#BA68C8"
                  value={editData.telefono || ''}
                  onChangeText={text => setEditData({ ...editData, telefono: text })}
                  keyboardType="phone-pad"
                />
              </View>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={[styles.inputRow, { paddingVertical: 12 }]}
              >
                <MaterialIcons name="cake" size={20} color="#BA68C8" style={styles.inputIcon} />
                <Text style={{ color: '#5E35B1', fontSize: 16 }}>
                  {editData.fecha_nacimiento ? formatDate(editData.fecha_nacimiento) : 'Seleccionar fecha de nacimiento'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={editData.fecha_nacimiento ? new Date(editData.fecha_nacimiento) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      const formattedDate = selectedDate.toISOString().split('T')[0];
                      setEditData({ ...editData, fecha_nacimiento: formattedDate });
                    }
                  }}
                />
              )}

              {/* Buttons */}
              <TouchableOpacity style={styles.modalButton} onPress={handleSaveEdit}>
                <Text style={styles.modalButtonText}>
                  <MaterialIcons name="save" size={18} color="#fff" />
                  <Text> Guardar</Text>
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButtonCustom}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>
                  <MaterialIcons name="close" size={18} color="#7E57C2" />
                  <Text> Cancelar</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3EFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3EFFF',
    padding: 20,
  },
  errorText: {
    color: '#C62828',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 12,
  },
  cardInfoPersonal: {
    width: '95%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginTop: 10,
    marginBottom: 10,
    elevation: 6,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7E57C2',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 6,
    backgroundColor: '#F8F5FF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  infoText: {
    fontSize: 16,
    color: '#5E35B1',
    marginLeft: 14,
    flex: 1,
    flexWrap: 'wrap',
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 10,
    gap: 8,
    justifyContent: 'center',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    elevation: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E1BEE7',
  },
  editButtonText: {
    color: '#7E57C2',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 15,
  },
  logoutButton: {
    flex: 1,
    backgroundColor: '#7E57C2',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    elevation: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 15,
  },
  cardPedidos: {
    width: '95%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 14,
    marginTop: 6,
    elevation: 6,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
  },
  noPedidosText: {
    color: '#7E57C2',
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 16,
    fontWeight: '500',
  },
  pedidoCard: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    elevation: 3,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E1BEE7',
  },
  pedidoHeader: {
    backgroundColor: '#7E57C2',
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  pedidoHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pedidoHeaderDate: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  pedidoInfo: {
    padding: 8,
    gap: 4,
  },
  pedidoNegocio: {
    color: '#5E35B1',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
  },
  pedidoTotal: {
    color: '#7E57C2',
    fontSize: 15,
    marginBottom: 2,
  },
  pedidoEstatus: {
    color: '#7E57C2',
    fontSize: 15,
    marginBottom: 2,
  },
  pedidoDireccion: {
    color: '#7E57C2',
    fontSize: 15,
    marginBottom: 2,
  },
  pedidoProductos: {
    backgroundColor: '#F3EFFF',
    paddingHorizontal: 8,
    paddingBottom: 8,
    paddingTop: 4,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  pedidoProductosTitle: {
    color: '#5E35B1',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 1,
  },
  pedidoProductoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
    marginLeft: 4,
  },
  pedidoProductoText: {
    color: '#7E57C2',
    marginLeft: 4,
    fontSize: 13,
  },
  pedidoProductoEmpty: {
    color: '#7E57C2',
    fontStyle: 'italic',
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(126,87,194,0.22)',
    padding: 16,
  },
  modalContentCustom: {
    width: '95%',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    elevation: 6,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    alignItems: 'center',
  },
  modalIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7E57C2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    elevation: 6,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  modalTitleCustom: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#7E57C2',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 6,
    backgroundColor: '#F8F5FF',
    borderRadius: 8,
    paddingHorizontal: 6,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputCustom: {
    flex: 1,
    borderBottomWidth: 1.2,
    borderBottomColor: '#BA68C8',
    padding: 6,
    fontSize: 15,
    color: '#5E35B1',
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
  modalButton: {
    backgroundColor: '#7E57C2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    elevation: 2,
    width: '100%',
    marginBottom: 6,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  cancelButtonCustom: {
    marginTop: 0,
    paddingVertical: 6,
    width: '100%',
    alignItems: 'center',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#7E57C2',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
});

// Reusable button component for the modal with TypeScript types
type MaterialIconName = React.ComponentProps<typeof MaterialIcons>["name"];

interface ModalButtonProps {
  onPress: () => void;
  style: object;
  textStyle: object;
  iconName: MaterialIconName;
  iconColor: string;
  iconSize: number;
  text: string;
}

const ModalButton: React.FC<ModalButtonProps> = ({ onPress, style, textStyle, iconName, iconColor, iconSize, text }) => (
  <TouchableOpacity style={style} onPress={onPress}>
    <Text style={textStyle}>
      <MaterialIcons name={iconName} size={iconSize} color={iconColor} />
      <Text> {text}</Text>
    </Text>
  </TouchableOpacity>
);
