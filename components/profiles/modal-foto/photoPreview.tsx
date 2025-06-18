//FlashSend/components/profiles/modal_imagen/photoPreview.tsx
import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface PhotoPreviewProps {
  uri: string;
  onSave: (uri: string) => void;
  onCancel: () => void;
  newPhoto: () => void;
  onUseAsProfile: (uri: string) => void;
  isLoading?: boolean;
}

export function PhotoPreview({ 
  uri, 
  onSave, 
  onCancel, 
  newPhoto, 
  onUseAsProfile,
  isLoading = false 
}: PhotoPreviewProps) {
  return (
    <View style={styles.container}>
      <Image source={{ uri }} style={styles.image} />
      <View style={styles.overlay}>
        <View style={styles.buttons}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Procesando imagen...</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity 
                style={[styles.button, styles.profileButton]} 
                onPress={() => onUseAsProfile(uri)}
              >
                <MaterialIcons name="account-circle" size={24} color="#fff" />
                <Text style={styles.text}>Usar como foto de perfil</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.newPhotoButton]} 
                onPress={newPhoto}
              >
                <MaterialIcons name="camera-alt" size={24} color="#fff" />
                <Text style={styles.text}>Tomar otra</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={onCancel}
              >
                <MaterialIcons name="close" size={24} color="#fff" />
                <Text style={styles.text}>Cancelar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'black' 
  },
  image: { 
    flex: 1, 
    resizeMode: 'contain' 
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
  },
  buttons: { 
    flexDirection: 'column',
    gap: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    gap: 10,
  },
  profileButton: {
    backgroundColor: '#7E57C2',
  },
  newPhotoButton: {
    backgroundColor: '#2E7D32',
  },
  cancelButton: {
    backgroundColor: '#C62828',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
});
