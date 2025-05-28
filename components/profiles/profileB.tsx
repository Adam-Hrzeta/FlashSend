// Importaciones necesarias
import { supabase } from '@/lib/supabase';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Business = {
  id: string;
  display_name: string;
  phone: string;
  email: string;
  category: string;
  description?: string;
  address?: string;
  image_url?: string | null;
};

export default function BusinessProfileScreen() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchBusiness();
  }, []);

  const fetchBusiness = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return;

      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setBusiness(data);
        setUsername(data.display_name);
        setPhone(data.phone);
        setEmail(data.email);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const authUpdates: { email?: string; password?: string } = {};
      if (email && email !== user.email) authUpdates.email = email;
      if (password.trim()) authUpdates.password = password;

      if (Object.keys(authUpdates).length > 0) {
        const { error: authError } = await supabase.auth.updateUser(authUpdates);
        if (authError) throw authError;
      }

      const { error: updateError } = await supabase
        .from('businesses')
        .update({ display_name: username, phone, email })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      Alert.alert('Éxito', 'Perfil actualizado correctamente.');
      setModalVisible(false);
      fetchBusiness();
      setPassword('');
    } catch (e) {
      Alert.alert('Error', 'No se pudo actualizar el perfil.');
    }
  };

  const handlePickImage = async () => {
    try {
      setUploading(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos requeridos', 'Se requiere acceso a la galería');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (e) {
      console.error('Error al seleccionar imagen', e);
    } finally {
      setUploading(false);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `business_avatar_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      const fileType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;
      const response = await fetch(uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('business-avatars')
        .upload(filePath, blob, { contentType: fileType, upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase
        .storage
        .from('business-avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('businesses')
        .update({ image_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setBusiness(prev => prev ? { ...prev, image_url: publicUrl } : null);
      Alert.alert('Éxito', 'Imagen actualizada correctamente');
    } catch (e) {
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

  if (!business) {
    return (
      <View style={styles.center}>
        <Text>No se encontró información del negocio.</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/Gif/fondoP3.gif')}
            style={styles.headerBackground}
            resizeMode="cover"
          />
        </View>

        <View style={styles.profileRow}>
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

          <View style={styles.infoColumn}>
            <Text style={styles.name}>{username}</Text>
            <Text style={styles.category}>{business.category}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Información del Perfil</Text>

        <View style={styles.card}>
          <View style={styles.infoSection}>
            <MaterialIcons name="person" size={20} color="#4A6FA5" />
            <Text style={styles.value}>{username}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoSection}>
            <MaterialIcons name="phone" size={20} color="#4A6FA5" />
            <Text style={styles.value}>{phone}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoSection}>
            <MaterialIcons name="email" size={20} color="#4A6FA5" />
            <Text style={styles.value}>{business.email}</Text>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.button}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.buttonText}>Modificar información</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Editar Información</Text>

            <View style={styles.infoSection}>
              <MaterialIcons name="person" size={20} color="#4A6FA5" />
              <TextInput
                style={styles.modalInput}
                placeholder="Nombre de usuario"
                value={username}
                onChangeText={setUsername}
              />
            </View>

            <View style={styles.infoSection}>
              <MaterialIcons name="phone" size={20} color="#4A6FA5" />
              <TextInput
                style={styles.modalInput}
                placeholder="Teléfono"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <View style={styles.infoSection}>
              <MaterialIcons name="email" size={20} color="#4A6FA5" />
              <TextInput
                style={styles.modalInput}
                placeholder="Correo electrónico"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.infoSection}>
              <MaterialIcons name="lock" size={20} color="#4A6FA5" />
              <TextInput
                style={styles.modalInput}
                placeholder="Nueva contraseña"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View style={styles.modalButtonsRow}>
              <Pressable
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleUpdateProfile}
              >
                <Text style={styles.modalSaveText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
    position: 'relative',
    justifyContent: 'flex-end',
  },
  headerBackground: {
    width: '100%',
    height: '100%',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: -97,
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#FFF',
    backgroundColor: '#E1E5EA',
  },
  imageLoading: {
    width: 90,
    height: 90,
    borderRadius: 45,
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
    borderRadius: 12,
    padding: 4,
  },
  infoColumn: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFF',
  },
  category: {
    fontSize: 14,
    color: '#ffff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A6FA5',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  value: {
    marginLeft: 8,
    color: '#333',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 10,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#4A6FA5',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A6FA5',
    marginBottom: 15,
  },
  modalInput: {
    flex: 1,
    marginLeft: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CCC',
    paddingVertical: 4,
    color: '#333',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 10,
  },
  modalCancelButton: {
    backgroundColor: '#EEE',
  },
  modalSaveButton: {
    backgroundColor: '#4A6FA5',
  },
  modalCancelText: {
    color: '#333',
  },
  modalSaveText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
