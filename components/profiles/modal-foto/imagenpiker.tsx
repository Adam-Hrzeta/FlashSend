//FlashSend/components/profiles/modal_imagen/imagenPiker.tsx
import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { CameraComponent } from './cameraComponent';
import { PhotoPreview } from './photoPreview';

interface Props {
  onImageSelected: (uri: string) => void;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

const ImagePickerComponent = ({ onImageSelected }: Props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateImage = async (uri: string): Promise<boolean> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Verificar tamaño
      if (blob.size > MAX_IMAGE_SIZE) {
        Alert.alert(
          'Error',
          'La imagen es demasiado grande. El tamaño máximo permitido es 5MB.'
        );
        return false;
      }

      // Verificar tipo
      if (!ALLOWED_IMAGE_TYPES.includes(blob.type)) {
        Alert.alert(
          'Error',
          'Formato de imagen no válido. Solo se permiten JPG y PNG.'
        );
        return false;
      }

      return true;
    } catch (error) {
      Alert.alert('Error', 'No se pudo validar la imagen');
      return false;
    }
  };

  const pickImage = async () => {
    try {
      setIsLoading(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Error', 'Se necesita permiso para acceder a la galería');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const isValid = await validateImage(result.assets[0].uri);
        if (isValid) {
          setPreviewUri(result.assets[0].uri);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo acceder a la galería');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePictureTaken = async (uri: string) => {
    const isValid = await validateImage(uri);
    if (isValid) {
      setShowCamera(false);
      setPreviewUri(uri);
    }
  };

  const handleUseAsProfile = async (uri: string) => {
    try {
      setIsLoading(true);
      await onImageSelected(uri);
      setModalVisible(false);
      setPreviewUri(null);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la foto de perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setPreviewUri(null);
    setShowCamera(false);
  };

  return (
    <View>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Ionicons name="camera-outline" size={32} color="black" />
      </TouchableOpacity>

      <Modal 
        visible={modalVisible} 
        animationType="slide"
        onRequestClose={handleCancel}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7E57C2" />
            <Text style={styles.loadingText}>Procesando imagen...</Text>
          </View>
        ) : showCamera ? (
          <CameraComponent 
            onPictureTaken={handlePictureTaken} 
            onCancel={() => setShowCamera(false)} 
          />
        ) : previewUri ? (
          <PhotoPreview 
            uri={previewUri} 
            onSave={() => {}} 
            onCancel={handleCancel} 
            newPhoto={() => setShowCamera(true)}
            onUseAsProfile={handleUseAsProfile}
            isLoading={isLoading}
          />
        ) : (
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={pickImage}
              disabled={isLoading}
            >
              <Ionicons name="images-outline" size={24} color="#fff" />
              <Text style={styles.text}>Elegir de galería</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => setShowCamera(true)}
              disabled={isLoading}
            >
              <Ionicons name="camera-outline" size={24} color="#fff" />
              <Text style={styles.text}>Tomar foto</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={handleCancel}
              disabled={isLoading}
            >
              <Ionicons name="close-outline" size={24} color="#fff" />
              <Text style={styles.text}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    padding: 20,
    borderRadius: 10,
    width: 250,
    justifyContent: 'center',
    gap: 10,
  },
  cancelButton: {
    backgroundColor: '#C62828',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ImagePickerComponent;
