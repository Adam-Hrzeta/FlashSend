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

    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/perfilCliente/editarPerfil`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...editData, fecha_nacimiento: fechaModificada }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.mensaje || 'Error al editar');
      }

      const data = await response.json();
      setCliente(data.cliente);
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
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F3EFFF', justifyContent: 'center' }}>
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
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 32 }}>
        {/* Tarjeta principal */}
        <View style={{
          width: '92%',
          backgroundColor: '#fff',
          borderRadius: 28,
          paddingTop: 70,
          paddingBottom: 32,
          paddingHorizontal: 24,
          alignItems: 'center',
          elevation: 8,
          shadowColor: '#7E57C2',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.13,
          shadowRadius: 16,
          marginTop: 60,
        }}>
          {/* Avatar superpuesto */}
          <View style={{
            position: 'absolute',
            top: -80,
            alignSelf: 'center',
            backgroundColor: '#fff',
            borderRadius: 90,
            width: 180,
            height: 180,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 10,
            shadowColor: '#7E57C2',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.20,
            shadowRadius: 18,
          }}>
            {cliente?.avatar && (
              <Image
                source={{ uri: localAvatar || cliente.avatar + `?t=${Date.now()}` }}
                style={{ width: 165, height: 165, borderRadius: 82.5 }}
              />
            )}
            <TouchableOpacity
              style={{
                position: 'absolute',
                bottom: 14,
                right: 14,
                backgroundColor: '#fff',
                borderRadius: 30,
                padding: 10,
                elevation: 4,
                shadowColor: '#7E57C2',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.13,
                shadowRadius: 4,
              }}
              onPress={() => !isUpdatingPhoto && setShowImagePicker(true)}
            >
              <MaterialIcons name="camera-alt" size={28} color="#7E57C2" />
            </TouchableOpacity>
          </View>

          {/* Nombre */}
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#5E35B1', marginTop: 40 }}>{cliente?.nombre}</Text>

          {/* Datos con iconos */}
          <View style={{ width: '100%', marginTop: 18, marginBottom: 18 }}>
            {[{
              icon: 'email', value: cliente?.correo
            }, {
              icon: 'phone', value: cliente?.telefono
            }, {
              icon: 'cake', value: formatDate(cliente?.fecha_nacimiento) || 'Sin fecha de nacimiento'
            }].map((item, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                <MaterialIcons name={item.icon as any} size={22} color={'#7E57C2'} />
                <Text style={{ fontSize: 16, color: '#5E35B1', marginLeft: 14, flex: 1, flexWrap: 'wrap' }}>{item.value}</Text>
              </View>
            ))}
          </View>

          {/* Botones */}
          <View style={{ flexDirection: 'row', width: '100%', marginTop: 18, gap: 12 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: '#fff',
                borderRadius: 16,
                paddingVertical: 14,
                alignItems: 'center',
                elevation: 2,
                shadowColor: '#7E57C2',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.13,
                shadowRadius: 4,
                flexDirection: 'row',
                justifyContent: 'center',
                borderWidth: 1.2,
                borderColor: '#E1BEE7',
              }}
              onPress={handleEdit}
            >
              <MaterialIcons name="edit" size={22} color="#7E57C2" />
              <Text style={{ color: '#7E57C2', fontWeight: 'bold', marginLeft: 10, fontSize: 16 }}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: '#7E57C2',
                borderRadius: 16,
                paddingVertical: 14,
                alignItems: 'center',
                elevation: 2,
                shadowColor: '#7E57C2',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.13,
                shadowRadius: 4,
                flexDirection: 'row',
                justifyContent: 'center',
              }}
              onPress={handleLogout}
            >
              <MaterialIcons name="logout" size={22} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 10, fontSize: 16 }}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sección de historial de pedidos */}
        <View style={{
          width: '92%',
          backgroundColor: '#fff',
          borderRadius: 28,
          padding: 24,
          marginTop: 20,
          elevation: 8,
          shadowColor: '#7E57C2',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.13,
          shadowRadius: 16,
        }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#5E35B1', marginBottom: 16 }}>Historial de pedidos</Text>
          {loadingHistorial ? (
            <ActivityIndicator size="small" color="#7E57C2" />
          ) : historial.length === 0 ? (
            <Text style={{ color: '#7E57C2', textAlign: 'center', paddingVertical: 20 }}>No hay pedidos recientes</Text>
          ) : (
            historial.filter(pedido => pedido.estatus !== 'entregado').length === 0 ? (
              <Text style={{ color: '#7E57C2', textAlign: 'center', paddingVertical: 20 }}>No hay pedidos activos</Text>
            ) : (
              historial.filter(pedido => pedido.estatus !== 'entregado').map((pedido) => {
                const fechaLegible = new Intl.DateTimeFormat('es-MX', {
                  year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'
                }).format(new Date(pedido.fecha));
                const productos = pedido.productos && pedido.productos.length > 0 ? pedido.productos : (pedido.detalles || []);
                return (
                  <View key={pedido.id} style={{
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
                    <View style={{ backgroundColor: '#7E57C2', padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>
                        <MaterialIcons name="receipt" size={22} color="#fff" /> Pedido #{pedido.id}
                      </Text>
                      <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
                        {fechaLegible}
                      </Text>
                    </View>
                    {/* Info principal */}
                    <View style={{ padding: 16, gap: 6 }}>
                      <Text style={{ color: '#5E35B1', fontWeight: 'bold', fontSize: 16 }}>
                        <MaterialIcons name="store" size={18} color="#7E57C2" /> {pedido.negocio_nombre || pedido.negocio_id}
                      </Text>
                      <Text style={{ color: '#7E57C2', fontSize: 15 }}>
                        <MaterialIcons name="attach-money" size={18} color="#7E57C2" /> <Text style={{ fontWeight: 'bold' }}>Total:</Text> ${pedido.total}
                      </Text>
                      <Text style={{ color: '#7E57C2', fontSize: 15 }}>
                        <MaterialIcons name="info" size={18} color="#7E57C2" /> <Text style={{ fontWeight: 'bold' }}>Estatus:</Text> {pedido.estatus === 'enviado' ? 'En camino' : pedido.estatus}
                      </Text>
                      <Text style={{ color: '#7E57C2', fontSize: 15 }}>
                        <MaterialIcons name="location-on" size={18} color="#7E57C2" /> <Text style={{ fontWeight: 'bold' }}>Dirección de entrega:</Text> {pedido.direccion_entrega}
                      </Text>
                    </View>
                    {/* Productos */}
                    <View style={{ backgroundColor: '#F3EFFF', paddingHorizontal: 16, paddingBottom: 12, paddingTop: 8 }}>
                      <Text style={{ color: '#5E35B1', fontWeight: 'bold', fontSize: 15, marginBottom: 2 }}>
                        <MaterialIcons name="shopping-cart" size={18} color="#7E57C2" /> Productos solicitados:
                      </Text>
                      {productos.length > 0 ? (
                        productos.map((prod, idx) => {
                          const precio = prod.precio_unitario;
                          let precioDisplay = "N/A";
                          if (precio !== undefined && precio !== null && !isNaN(Number(precio))) {
                            precioDisplay = Number(precio).toFixed(2);
                          }
                          return (
                            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2, marginLeft: 8 }}>
                              <MaterialIcons name="check-circle" size={16} color="#7E57C2" />
                              <Text style={{ color: '#7E57C2', marginLeft: 6, fontSize: 14 }}>
                                {prod.nombre ? prod.nombre : `Producto ${prod.producto_id}`} <Text style={{ fontWeight: 'bold' }}>x{prod.cantidad}</Text> <Text style={{ color: '#5E35B1' }}>@ ${precioDisplay}</Text>
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
              <View style={styles.modalIconCircle}>
                <MaterialIcons name="edit" size={38} color="#fff" />
              </View>
              <Text style={styles.modalTitleCustom}>Editar información</Text>

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
                  {editData.fecha_nacimiento
                    ? formatDate(editData.fecha_nacimiento)
                    : 'Seleccionar fecha de nacimiento'}
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

              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleSaveEdit}
              >
                <Text style={styles.modalButtonText}>
                  <MaterialIcons name="save" size={18} color="#fff" /> Guardar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButtonCustom}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>
                  <MaterialIcons name="close" size={18} color="#7E57C2" /> Cancelar
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
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(126,87,194,0.22)',
    padding: 16,
  },
  modalContentCustom: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 28,
    borderRadius: 20,
    elevation: 12,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7E57C2',
    marginBottom: 18,
    textAlign: 'center',
    letterSpacing: 0.7,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    backgroundColor: '#F8F5FF',
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputCustom: {
    flex: 1,
    borderBottomWidth: 1.7,
    borderBottomColor: '#BA68C8',
    padding: 10,
    fontSize: 17,
    color: '#5E35B1',
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
  modalButton: {
    backgroundColor: '#7E57C2',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginTop: 18,
    alignItems: 'center',
    elevation: 4,
    width: '100%',
    marginBottom: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: 0.7,
    textAlign: 'center',
  },
  cancelButtonCustom: {
    marginTop: 0,
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
    borderRadius: 12,
  },
  cancelButtonText: {
    color: '#7E57C2',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
