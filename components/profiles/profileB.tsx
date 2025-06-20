import { API_BASE_URL } from '@/constants/ApiConfig'; //pefil
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { pickLocationAndGetAddress } from './LocationUtils';

export interface Negocio {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  avatar: string;
  categoria: string;
  descripcion?: string;
  direccion: string;
  tipo_entrega: string;
  disponibilidad: boolean;
}

export default function NegocioProfileScreen() {
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState<Partial<Negocio>>({});
  const [uploading, setUploading] = useState(false);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);

  const fetchNegocio = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/perfilNegocio/perfilNegocio`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'No autorizado');
      }

      const data = await response.json();
      setNegocio(data.negocio);
      setEditData(data.negocio);
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

  useEffect(() => {
    fetchNegocio();
  }, []);

  useEffect(() => {
    if (negocio?.avatar) {
      setLocalAvatar(null); // Siempre usar la URL remota más reciente
    }
  }, [negocio?.avatar]);

  const handleEdit = () => {
    setEditModalVisible(true);
  };

   const handleSaveEdit = async () => {
    const token = await AsyncStorage.getItem('access_token');
    fetch(`${API_BASE_URL}/api/perfilNegocio/editarPerfil`, { // CORREGIDO
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editData)
    })
      .then(async res => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.mensaje || 'Error al editar');
        }
        return res.json();
      })
      .then(data => {
        // Solo actualiza los datos, pero conserva el avatar actual
        setNegocio(prev => prev ? { ...data.negocio, avatar: prev.avatar } : data.negocio);
        setEditModalVisible(false);
        Alert.alert('Perfil actualizado');
      })
      .catch(() => {
        Alert.alert('Error', 'No se pudo actualizar el perfil');
      });
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

      const uploadResponse = await fetch(`${API_BASE_URL}/api/perfilNegocio/upload_profile_image`, {
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

      const profileRes = await fetch(`${API_BASE_URL}/api/perfilNegocio/perfilNegocio`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!profileRes.ok) {
        throw new Error('Error al refrescar perfil');
      }

      const profileData = await profileRes.json();
      setNegocio(profileData.negocio);
      setLocalAvatar(null); // Forzar recarga de la imagen

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
            {negocio?.avatar && (
              <Image source={{ uri: localAvatar || negocio.avatar + `?t=${Date.now()}` }} style={{ width: 165, height: 165, borderRadius: 82.5 }} />
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
              onPress={() => !isUpdatingPhoto && handlePickImage()}
            >
              <MaterialIcons name="camera-alt" size={28} color="#7E57C2" />
            </TouchableOpacity>
          </View>

          {/* Nombre y categoría */}
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#5E35B1', marginTop: 40 }}>{negocio?.nombre}</Text>
          {/* Etiqueta de categoría tipo chip */}
          {negocio?.categoria && (
            <View style={{
              backgroundColor: '#E1BEE7',
              borderRadius: 16,
              paddingHorizontal: 14,
              paddingVertical: 4,
              alignSelf: 'center',
              marginTop: 8,
              marginBottom: 8,
            }}>
              <Text style={{ color: '#7E57C2', fontWeight: 'bold', fontSize: 14 }}>{negocio.categoria}</Text>
            </View>
          )}

          {/* Botón para cambiar estado */}
          <TouchableOpacity
            style={{
              backgroundColor: negocio?.disponibilidad ? '#4CAF50' : '#F44336',
              borderRadius: 16,
              paddingHorizontal: 18,
              paddingVertical: 8,
              marginBottom: 10,
              alignSelf: 'center',
            }}
            onPress={() => setNegocio(prev => prev ? { ...prev, disponibilidad: !prev.disponibilidad } : prev)}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>
              {negocio?.disponibilidad ? 'Disponible' : 'No disponible'}
            </Text>
          </TouchableOpacity>

          {/* Datos con iconos */}
          <View style={{ width: '100%', marginTop: 18, marginBottom: 18 }}>
            {[{
              icon: 'email', value: negocio?.correo
            }, {
              icon: 'phone', value: negocio?.telefono
            }, {
              icon: 'location-on', value: negocio?.direccion,
              isLocation: true
            }, {
              icon: 'info', value: negocio?.descripcion || 'Sin descripción'
            }, {
              icon: 'delivery-dining', value: negocio?.tipo_entrega
            }].map((item, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: idx === 4 ? 0 : 14 }}>
                <MaterialIcons name={item.icon as any} size={22} color={'#7E57C2'} />
                <Text style={{ fontSize: 16, color: '#5E35B1', marginLeft: 14, flex: 1, flexWrap: 'wrap' }}>{item.value}</Text>
                {item.isLocation && (
                  <TouchableOpacity
                    style={{ marginLeft: 8, backgroundColor: '#E1BEE7', borderRadius: 12, padding: 6 }}
                    onPress={async () => {
                      // Seleccionar ubicación y actualizar en backend
                      const dir = await pickLocationAndGetAddress(setEditData, setNegocio);
                      if (dir) {
                        // Actualizar en backend
                        const token = await AsyncStorage.getItem('access_token');
                        await fetch(`${API_BASE_URL}/api/perfilNegocio/editarPerfil`, {
                          method: 'PUT',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({ ...negocio, direccion: dir })
                        });
                      }
                    }}
                  >
                    <MaterialIcons name="my-location" size={20} color="#7E57C2" />
                  </TouchableOpacity>
                )}
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
              onPress={async () => {
                const token = await AsyncStorage.getItem('access_token');
                if (token) {
                  await fetch(`${API_BASE_URL}/api/auth/logout`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                }
                await AsyncStorage.removeItem('access_token');
                Alert.alert('Sesión cerrada');
                router.replace('/');
              }}
            >
              <MaterialIcons name="logout" size={22} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 10, fontSize: 16 }}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Modal de edición (igual que antes) */}
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
              
              <View style={styles.inputRow}>
                <MaterialIcons name="info" size={20} color="#BA68C8" style={styles.inputIcon} />
                <TextInput
                  style={styles.inputCustom}
                  placeholder="Descripción"
                  placeholderTextColor="#BA68C8"
                  value={editData.descripcion || ''}
                  onChangeText={text => setEditData({ ...editData, descripcion: text })}
                  multiline
                />
              </View>
              
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F5FF',
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#7E57C2',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 24,
    paddingTop: 24,
    elevation: 8,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    paddingHorizontal: 18,
    justifyContent: 'flex-start',
  },
  avatarCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
    elevation: 6,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  infoSide: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
    paddingLeft: 10,
  },
  nameOnly: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
    textAlign: 'left',
    letterSpacing: 1.1,
  },
  emailOnly: {
    fontSize: 16,
    color: '#FFD6F6',
    marginBottom: 6,
    textAlign: 'left',
    fontWeight: '600',
  },
  categoriaText: {
    fontSize: 14,
    color: '#E1BEE7',
    fontWeight: '500',
    textAlign: 'left',
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    marginHorizontal: 18,
    marginBottom: 18,
    elevation: 2,
    shadowColor: '#B39DDB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#7E57C2',
    fontWeight: '500',
    textAlign: 'left',
  },
  errorText: {
    color: '#C62828',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginRight: 24,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    elevation: 2,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 4,
  },
  editButtonText: {
    color: '#7E57C2',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 15,
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
  uploadButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 6,
    elevation: 4,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 4,
  },
});