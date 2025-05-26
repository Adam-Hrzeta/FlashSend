import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

type Business = {
  id: string;
  display_name: string;
  phone: string;
  email: string;
  category: string;
  description?: string;
  address?: string;
  website?: string;
  image_url?: string | null;
};

export default function BusinessProfileScreen() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchBusiness();
  }, []);

  const fetchBusiness = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('No se pudo obtener el usuario');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error al obtener el negocio:', error.message);
      } else {
        setBusiness(data);
      }
    } catch (error) {
      console.error('Error inesperado:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      setUploading(true);
      
      // Solicitar permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos requeridos', 'Necesitamos acceso a tu galería para cambiar la imagen');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'Ocurrió un error al seleccionar la imagen');
    } finally {
      setUploading(false);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('No se pudo autenticar al usuario');
      }

      // Extraer extensión del archivo
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `business_avatar_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      const fileType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;

      // Convertir a blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Subir a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('business-avatars')
        .upload(filePath, blob, {
          contentType: fileType,
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('business-avatars')
        .getPublicUrl(filePath);

      // Actualizar en la tabla de negocios
      const { error: updateError } = await supabase
        .from('businesses')
        .update({ image_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Actualizar el estado local
      setBusiness(prev => prev ? { ...prev, image_url: publicUrl } : null);
      
      Alert.alert('Éxito', 'Imagen actualizada correctamente');
    } catch (error) {
      console.error('Error al subir imagen:', error);
      Alert.alert('Error', 'No se pudo actualizar la imagen. Por favor intenta nuevamente.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A6FA5" />
      </View>
    );
  }

  if (!business) {
    return (
      <View style={styles.center}>
        <Text>No se encontró información del negocio.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil del Negocio</Text>
      </View>
      
      <View style={styles.profileContainer}>
        <TouchableOpacity 
          onPress={handlePickImage}
          disabled={uploading}
          style={styles.imageContainer}
        >
          {uploading ? (
            <View style={styles.imageLoading}>
              <ActivityIndicator size="small" color="#FFF" />
            </View>
          ) : (
            <>
              <Image
                source={
                  business.image_url
                    ? { uri: business.image_url }
                    : require('../../assets/images/default_profile.png')
                }
                style={styles.image}
              />
              <View style={styles.editIcon}>
                <MaterialIcons name="edit" size={20} color="#FFF" />
              </View>
            </>
          )}
        </TouchableOpacity>
        
        <Text style={styles.name}>{business.display_name}</Text>
        <Text style={styles.category}>{business.category}</Text>
        
        <View style={styles.card}>
          <View style={styles.infoSection}>
            <MaterialIcons name="phone" size={20} color="#4A6FA5" />
            <View style={styles.infoText}>
              <Text style={styles.label}>Teléfono</Text>
              <Text style={styles.value}>{business.phone}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoSection}>
            <MaterialIcons name="email" size={20} color="#4A6FA5" />
            <View style={styles.infoText}>
              <Text style={styles.label}>Correo electrónico</Text>
              <Text style={styles.value}>{business.email}</Text>
            </View>
          </View>
          
          {business.address && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoSection}>
                <MaterialIcons name="location-on" size={20} color="#4A6FA5" />
                <View style={styles.infoText}>
                  <Text style={styles.label}>Dirección</Text>
                  <Text style={styles.value}>{business.address}</Text>
                </View>
              </View>
            </>
          )}
          
          {business.website && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoSection}>
                <MaterialIcons name="public" size={20} color="#4A6FA5" />
                <View style={styles.infoText}>
                  <Text style={styles.label}>Sitio web</Text>
                  <Text style={[styles.value, styles.link]}>{business.website}</Text>
                </View>
              </View>
            </>
          )}
          
          {business.description && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoSection}>
                <MaterialIcons name="description" size={20} color="#4A6FA5" />
                <View style={styles.infoText}>
                  <Text style={styles.label}>Descripción</Text>
                  <Text style={styles.value}>{business.description}</Text>
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: '#F8F9FA',
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    height: 120,
    backgroundColor: '#4A6FA5',
    justifyContent: 'flex-end',
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '600',
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: -50,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFF',
    backgroundColor: '#E1E5EA',
  },
  imageLoading: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4A6FA5',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 5,
  },
  category: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 8,
  },
  infoText: {
    marginLeft: 15,
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    color: '#2C3E50',
    lineHeight: 22,
  },
  link: {
    color: '#4A6FA5',
  },
  divider: {
    height: 1,
    backgroundColor: '#ECF0F1',
    marginVertical: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
});