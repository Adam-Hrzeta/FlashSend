import { API_BASE_URL } from '@/constants/ApiConfig';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
        setNegocio(data.negocio);
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
      const response = await fetch(`${API_BASE_URL}/api/perfilNegocio/upload_profile_image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
      if (!response.ok) throw new Error('Error al subir la imagen');
      Alert.alert('Éxito', 'Imagen de perfil actualizada');
      fetchNegocio();
    } catch (e) {
      Alert.alert('Error', 'No se pudo subir la imagen');
    } finally {
      setUploading(false);
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
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.avatarCircle}>
          {negocio?.avatar && (
            <Image source={{ uri: negocio.avatar + `&t=${Date.now()}` }} style={styles.avatar} />
          )}
          <TouchableOpacity style={styles.uploadButton} onPress={handlePickImage}>
            <MaterialIcons name="photo-library" size={22} color="#7E57C2" />
          </TouchableOpacity>
        </View>
        {uploading && <ActivityIndicator size="small" color="#7E57C2" style={{marginTop: 8}} />}
        <View style={styles.infoSide}>
          <Text style={styles.nameOnly}>
            {negocio?.nombre}
          </Text>
          <Text style={styles.emailOnly}>
            {negocio?.correo}
          </Text>
          <Text style={styles.categoriaText}>
            {negocio?.categoria}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
        <MaterialIcons name="edit" size={20} color="#7E57C2" />
        <Text style={styles.editButtonText}>Editar información</Text>
      </TouchableOpacity>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          <MaterialIcons name="badge" size={18} color="#7E57C2" /> Nombre: {negocio?.nombre}
        </Text>
        <Text style={styles.infoText}>
          <MaterialIcons name="email" size={18} color="#7E57C2" /> Correo: {negocio?.correo}
        </Text>
        <Text style={styles.infoText}>
          <MaterialIcons name="phone" size={18} color="#7E57C2" /> Teléfono: {negocio?.telefono}
        </Text>
        <Text style={styles.infoText}>
          <MaterialIcons name="location-on" size={18} color="#7E57C2" /> Dirección: {negocio?.direccion}
        </Text>
        <Text style={styles.infoText}>
          <MaterialIcons name="info" size={18} color="#7E57C2" /> Descripción: {negocio?.descripcion || 'Sin descripción'}
        </Text>
        <Text style={styles.infoText}>
          <MaterialIcons name="delivery-dining" size={18} color="#7E57C2" /> Tipo de entrega: {negocio?.tipo_entrega}
        </Text>
        <Text style={styles.infoText}>
          <MaterialIcons name="circle" size={18} color={negocio?.disponibilidad ? '#4CAF50' : '#F44336'} /> 
          Estado: {negocio?.disponibilidad ? 'Disponible' : 'No disponible'}
        </Text>
      </View>

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
              <MaterialIcons name="location-on" size={20} color="#BA68C8" style={styles.inputIcon} />
              <TextInput
                style={styles.inputCustom}
                placeholder="Dirección"
                placeholderTextColor="#BA68C8"
                value={editData.direccion || ''}
                onChangeText={text => setEditData({ ...editData, direccion: text })}
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

      <TouchableOpacity
        style={{backgroundColor: '#7E57C2', padding: 12, borderRadius: 10, margin: 16, alignItems: 'center'}}
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
        <Text style={{color: '#fff', fontWeight: 'bold'}}>Cerrar sesión</Text>
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