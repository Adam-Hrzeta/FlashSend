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

type Profile = {
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

export default function UserProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('No se pudo obtener el usuario');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error al obtener perfil:', error.message);
      } else {
        setProfile(data);
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
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos requeridos', 'Se necesita acceso a tu galería para cambiar la imagen');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets[0].uri) {
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

      const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const filename = `user_avatar_${Date.now()}.${ext}`;
      const path = `${user.id}/${filename}`;
      const type = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

      const response = await fetch(uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(path, blob, {
          contentType: type,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(path);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ image_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, image_url: publicUrl } : null);
      Alert.alert('Éxito', 'Imagen actualizada correctamente');
    } catch (error) {
      console.error('Error al subir imagen:', error);
      Alert.alert('Error', 'No se pudo actualizar la imagen.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A6FA5" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text>No se encontró el perfil de usuario.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
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
                  profile.image_url
                    ? { uri: profile.image_url }
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

        <Text style={styles.name}>{profile.display_name}</Text>

        <View style={styles.card}>
          <View style={styles.infoSection}>
            <MaterialIcons name="email" size={20} color="#4A6FA5" />
            <View style={styles.infoText}>
              <Text style={styles.label}>Correo</Text>
              <Text style={styles.value}>{profile.email}</Text>
            </View>
          </View>

          {profile.phone && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoSection}>
                <MaterialIcons name="phone" size={20} color="#4A6FA5" />
                <View style={styles.infoText}>
                  <Text style={styles.label}>Teléfono</Text>
                  <Text style={styles.value}>{profile.phone}</Text>
                </View>
              </View>
            </>
          )}

          {profile.description && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoSection}>
                <MaterialIcons name="person" size={20} color="#4A6FA5" />
                <View style={styles.infoText}>
                  <Text style={styles.label}>Descripción</Text>
                  <Text style={styles.value}>{profile.description}</Text>
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
    backgroundColor: '#F0F4F8',
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    height: 140,
    backgroundColor: '#4A6FA5',
    justifyContent: 'flex-end',
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '700',
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: -60,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#FFF',
    backgroundColor: '#DCE3EC',
  },
  imageLoading: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(0,0,0,0.2)',
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
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C2A3A',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 10,
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: '#7A8FA6',
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C3E50',
  },
  divider: {
    height: 1,
    backgroundColor: '#E1E5EA',
    marginVertical: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
  },
});
