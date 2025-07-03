import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';

interface Props {
  onCancel: () => void;
  onPictureTaken: (uri: string) => void;
}

export function CameraComponent({ onCancel, onPictureTaken }: Props) {
  const [facing, setFacing] = useState<CameraType>('back');
  const [photo, setPhoto] = useState<string | null>(null);
  const ref = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Necesitamos permiso para acceder a la cámara</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.text}>Dar permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    try {
      if (ref.current) {
        const photo = await ref.current.takePictureAsync();
        setPhoto(photo.uri);
      }
    } catch (error) {
      console.error('Error al tomar la foto:', error);
    }
  };

  const handleUsePhoto = () => {
    if (photo) {
      onPictureTaken(photo);
    }
  };

  const handleRetake = () => {
    setPhoto(null);
  };

  if (photo) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photo }} style={styles.preview} />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.useButton]} onPress={handleUsePhoto}>
            <MaterialIcons name="check" size={24} color="#fff" />
            <Text style={styles.text}>Usar foto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.retakeButton]} onPress={handleRetake}>
            <MaterialIcons name="refresh" size={24} color="#fff" />
            <Text style={styles.text}>Tomar otra</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
            <MaterialIcons name="close" size={24} color="#fff" />
            <Text style={styles.text}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={ref}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={onCancel}>
            <MaterialIcons name="close" size={24} color="#fff" />
            <Text style={styles.text}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <MaterialIcons name="camera" size={24} color="#fff" />
            <Text style={styles.text}>Capturar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setFacing(current => current === 'back' ? 'front' : 'back')}>
            <MaterialIcons name="flip-camera-ios" size={24} color="#fff" />
            <Text style={styles.text}>Girar</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  preview: {
    flex: 1,
    resizeMode: 'contain',
  },
  message: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7E57C2',
    padding: 15,
    borderRadius: 10,
    gap: 8,
  },
  useButton: {
    backgroundColor: '#2E7D32',
  },
  retakeButton: {
    backgroundColor: '#7E57C2',
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
