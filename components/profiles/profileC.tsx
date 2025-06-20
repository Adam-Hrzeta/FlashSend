import { API_BASE_URL } from '@/constants/ApiConfig';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ImagePickerComponent from './modal-foto/imagenpiker';


export interface Cliente {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  avatar: string;
  fecha_nacimiento: string; // siempre YYYY-MM-DD
}

export default function ClientProfileScreen() {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState<Partial<Cliente>>({});
  const [uploading, setUploading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);

  const fetchCliente = async () => {
    setLoading(true);
    setError(null);
    const token = await AsyncStorage.getItem('access_token');
    fetch(`${API_BASE_URL}/api/perfilCliente/perfilCliente`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(async res => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.mensaje || 'No autorizado');
        }
        return res.json();
      })
      .then(data => {
        setCliente(data.cliente);
        setEditData(data.cliente);
        setLoading(false);
      })
      .catch(() => {
        setError('No tienes permiso para ver este perfil.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCliente();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchCliente();
    }, [])
  );

  const handleEdit = () => {
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    // RESTAMOS un día antes de enviar al backend
    let fechaModificada = editData.fecha_nacimiento;

    if (fechaModificada) {
      const fecha = new Date(fechaModificada);
      fecha.setDate(fecha.getDate() - 1);
      fechaModificada = fecha.toISOString().split('T')[0];
    }

    const token = await AsyncStorage.getItem('access_token');
    fetch(`${API_BASE_URL}/api/perfilCliente/editarPerfil`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...editData, fecha_nacimiento: fechaModificada })
    })
      .then(async res => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.mensaje || 'Error al editar');
        }
        return res.json();
      })
      .then(data => {
        setCliente(data.cliente);
        setEditModalVisible(false);
        Alert.alert('Perfil actualizado');
      })
      .catch(() => {
        Alert.alert('Error', 'No se pudo actualizar el perfil');
      });
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permiso requerido', 'Se necesita permiso para acceder a la galería.');
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, base64: false });
    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      uploadProfileImage(pickerResult.assets[0].uri);
    }
  };

  const uploadProfileImage = async (uri: string) => {
    setUploading(true);
    const token = await AsyncStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('image', {
      uri,
      name: 'profile.jpg',
      type: 'image/jpeg',
    } as any);
    try {
      const response = await fetch(`${API_BASE_URL}/api/perfilCliente/upload_profile_image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
      if (!response.ok) throw new Error('Error al subir la imagen');
      Alert.alert('Éxito', 'Imagen de perfil actualizada');
      fetchCliente();
    } catch (e) {
      Alert.alert('Error', 'No se pudo subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
    await AsyncStorage.removeItem('access_token');
    setCliente(null); // Limpia el estado del perfil
    Alert.alert('Sesión cerrada');
    router.replace('/');
  };

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        setCliente(null);
        setError(null);
      }
    };
    checkToken();
  }, []);

  

  // MOSTRAR la fecha sumando 1 día para el usuario
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    date.setDate(date.getDate() + 1); // AÑADIMOS un día para mostrar
    return new Intl.DateTimeFormat('es-ES').format(date);
  };

  const handleImageSelected = async (uri: string) => {
    try {
      setIsUpdatingPhoto(true);
      const token = await AsyncStorage.getItem('access_token');

      const formData = new FormData();
      formData.append('image', {
        uri,
        type: 'image/jpeg',
        name: `avatar_${Date.now()}.jpg`
      } as any);

      const uploadResponse = await fetch(`${API_BASE_URL}/api/perfilCliente/upload_profile_image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const data = await uploadResponse.json().catch(() => ({}));
        throw new Error(data?.mensaje || 'Error al actualizar la foto');
      }

      const profileRes = await fetch(`${API_BASE_URL}/api/perfilCliente/perfilCliente`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!profileRes.ok) {
        throw new Error('Error al refrescar perfil');
      }

      const profileData = await profileRes.json();
      setCliente(profileData.cliente);

      Alert.alert('Éxito', 'Foto de perfil actualizada correctamente');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo actualizar la foto de perfil');
    } finally {
      setIsUpdatingPhoto(false);
    }
  };

  return loading ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#7E57C2" />
    </View>
  ) : !cliente && !error ? (
    <View style={styles.loadingContainer}>
      <Text style={styles.errorText}>No has iniciado sesión.</Text>
    </View>
  ) : (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.avatarCircle}>
          {cliente?.avatar && (
            <Image source={{ uri: cliente.avatar + `&t=${Date.now()}` }} style={styles.avatar} />
          )}
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={() => !isUpdatingPhoto && setEditModalVisible(true)}
          >
            <MaterialIcons name="camera-alt" size={24} color="#7E57C2" />
          </TouchableOpacity>
        </View>
        {uploading && <ActivityIndicator size="small" color="#7E57C2" style={{ marginTop: 8 }} />}
        <View style={styles.infoSide}>
          <Text style={styles.nameOnly}>
            {cliente?.nombre}
          </Text>
          <Text style={styles.emailOnly}>
            {cliente?.correo}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
        <MaterialIcons name="edit" size={20} color="#7E57C2" />
        <Text style={styles.editButtonText}>Editar información</Text>
      </TouchableOpacity>
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          <MaterialIcons name="badge" size={18} color="#7E57C2" /> Nombre: {cliente?.nombre}
        </Text>
        <Text style={styles.infoText}>
          <MaterialIcons name="cake" size={18} color="#7E57C2" /> Fecha de nacimiento: {formatDate(cliente?.fecha_nacimiento)}
        </Text>
        <Text style={styles.infoText}>
          <MaterialIcons name="email" size={18} color="#7E57C2" /> Correo: {cliente?.correo}
        </Text>
        <Text style={styles.infoText}>
          <MaterialIcons name="phone" size={18} color="#7E57C2" /> Teléfono: {cliente?.telefono}
        </Text>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
      <Text style={styles.historyTitle}>Historial de pedidos</Text>
      <Text style={styles.emptyPedidos}>No hay pedidos.</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Modal para editar información */}
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

            {/* Sección de foto de perfil */}
            <View style={styles.imagePickerContainer}>
              <Text style={styles.imagePickerLabel}>Cambiar foto de perfil</Text>
              <ImagePickerComponent onImageSelected={handleImageSelected} />
            </View>

            <View style={styles.inputRow}>
              <MaterialIcons name="person" size={20} color="#BA68C8" style={styles.inputIcon} />
              <TextInput
                style={styles.inputCustom}
                placeholder="Nombre"
                placeholderTextColor="#BA68C8"
                value={editData.nombre}
                onChangeText={text => setEditData({ ...editData, nombre: text })}
              />
            </View>
            <View style={styles.inputRow}>
              <MaterialIcons name="email" size={20} color="#BA68C8" style={styles.inputIcon} />
              <TextInput
                style={styles.inputCustom}
                placeholder="Correo"
                placeholderTextColor="#BA68C8"
                value={editData.correo}
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
                value={editData.telefono}
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

            <TouchableOpacity style={styles.modalButton} onPress={handleSaveEdit}>
              <Text style={styles.modalButtonText}>
                <MaterialIcons name="save" size={18} color="#fff" /> Guardar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButtonCustom} onPress={() => setEditModalVisible(false)}>
              <Text style={styles.cancelButtonText}>
                <MaterialIcons name="close" size={18} color="#7E57C2" /> Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

       {/* Botón para cerrar sesión ------------------------------*/}
      <TouchableOpacity
        style={{ backgroundColor: '#7E57C2', padding: 12, borderRadius: 10, margin: 16, alignItems: 'center' }}
        onPress={async () => {
          const token = await AsyncStorage.getItem('access_token');
          if (token) {
            await fetch(`${API_BASE_URL}/api/auth/logout`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` }
            });
          }
          await AsyncStorage.removeItem('access_token');
          setCliente(null); // Limpia el estado del perfil
          Alert.alert('Sesión cerrada');
          router.replace('/');
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cerrar sesión</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5FF',
    padding: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F5FF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#6D3AB7', // moradito más bonito y suave
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    paddingBottom: 28,
    paddingTop: 28,
    elevation: 10,
    shadowColor: '#6D3AB7',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  avatarCircle: {
    backgroundColor: '#FFF5FF',
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 18,
    marginRight: 18,
    position: 'relative',
    elevation: 6,
    shadowColor: '#A084DC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
  },
  uploadButton: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 5,
    elevation: 9,
    shadowColor: '#6D3AB7',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  infoSide: {
    flex: 1,
  },
  nameOnly: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF3FF',
    marginBottom: 8,
    textShadowColor: 'rgba(109,58,183,0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  emailOnly: {
    fontSize: 15,
    fontWeight: '600',
    color: '#DCC6F0',
  },
  editButton: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#EAD7FF',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 20,
    marginBottom: 15,
    alignSelf: 'flex-end',
    elevation: 3,
    shadowColor: '#A084DC',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  editButtonText: {
    marginLeft: 8,
    fontWeight: '700',
    fontSize: 14,
    color: '#7A3FCB',
  },
  infoCard: {
    backgroundColor: '#FFF3FF',
    borderRadius: 14,
    marginHorizontal: 16,
    padding: 18,
    elevation: 6,
    shadowColor: '#A084DC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 9,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#5D2789',
    fontWeight: '600',
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#7A3FCB',
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 40,
    alignSelf: 'center',
    minWidth: 140,
    elevation: 6,
    shadowColor: '#5E32A3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 7,
  },
  logoutText: {
    fontSize: 14,
    color: '#FFF5FF',
    fontWeight: '700',
  },
  historyTitle: {
    marginLeft: 16,
    fontSize: 19,
    fontWeight: '700',
    color: '#7A3FCB',
    marginBottom: 10,
  },
  emptyPedidos: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#A8A3B8',
    marginBottom: 40,
    fontStyle: 'italic',
  },
  errorText: {
    color: 'red',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 16,
    padding: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000AA',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContentCustom: {
    backgroundColor: '#FFF5FF',
    width: '90%',
    borderRadius: 28,
    padding: 28,
    elevation: 15,
    shadowColor: '#7A3FCB',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: '#E6D7FF',
  },
  modalIconCircle: {
    backgroundColor: '#7A3FCB',
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    alignSelf: 'center',
    elevation: 10,
    shadowColor: '#5E32A3',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  modalTitleCustom: {
    fontSize: 26,
    fontWeight: '800',
    color: '#6D3AB7',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#7A3FCB',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  inputIcon: {
    marginRight: 10,
    color: '#7A3FCB',
  },
  inputCustom: {
    flex: 1,
    fontSize: 17,
    color: '#5E35B1',
  },
  modalButton: {
    backgroundColor: '#7A3FCB',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    elevation: 6,
    shadowColor: '#5E32A3',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '700',
  },
  cancelButtonCustom: {
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderColor: '#7A3FCB',
    borderWidth: 2,
  },
  cancelButtonText: {
    color: '#7A3FCB',
    fontSize: 23,
    fontWeight: '900',
  },
  imagePickerContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  imagePickerLabel: {
    fontSize: 16,
    color: '#7E57C2',
    marginBottom: 10,
    fontWeight: 'bold',
  },
});
