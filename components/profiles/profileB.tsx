// Importaciones necesarias
import { ThemedText } from '@/components/ThemedText';
import { supabase } from '@/lib/supabase';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';

type Business = {
  id: string;
  user_id: string;
  display_name: string;
  phone: string;
  email: string;
  category: string;
  availability: string;
  delivery_type: string;
  ubicacion: string;
  description: string;
  type_user: 'business';
  avatar_url?: string;
};

type Product = {
  id: string;
  business_id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
};

export default function BusinessProfileScreen() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Estados para edición de perfil
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [description, setDescription] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // Estados para productos
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productImage, setProductImage] = useState<string | null>(null);

  useEffect(() => {
    fetchBusiness();
    fetchProducts();
  }, []);

  const fetchBusiness = async () => {
    try {
      setLoading(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw userError || new Error('No authenticated user');
      }

      const { data, error } = await supabase
        .from('entities')
        .select('*')
        .eq('user_id', user.id)
        .eq('type_user', 'business')
        .single();

      if (error) throw error;

      if (data) {
        setBusiness(data);
        setUsername(data.display_name);
        setPhone(data.phone);
        setEmail(data.email);
        setDescription(data.description || '');
      } else {
        Alert.alert('Error', 'No business profile found for this user');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching business profile:', error);
      Alert.alert('Error', 'Failed to load business profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('business_id', user.id);

      if (error) throw error;

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to load products');
    }
  };

  // Cómo subir una imagen de perfil a Supabase Storage
  const uploadAvatar = async () => {
    try {
      setUploading(true);
      
      // Pedir permisos para acceder a la galería
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos necesarios', 'Necesitamos acceso a tus fotos para cambiar la imagen de perfil');
        return;
      }

      // Seleccionar imagen de la galería
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      const { uri } = result.assets[0];
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : 'image';

      // Convertir imagen a blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function() {
          resolve(xhr.response);
        };
        xhr.onerror = function() {
          reject(new Error('Failed to upload image'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
      });

      // Subir imagen a Supabase Storage
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const filePath = `business-avatars/${user.id}/${new Date().getTime()}.${type.split('/')[1]}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, { contentType: type });

      if (uploadError) throw uploadError;

      // Obtener URL pública de la imagen
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Actualizar perfil con la nueva URL de la imagen
      const { error: updateError } = await supabase
        .from('entities')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Actualizar estado local
      setBusiness(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      Alert.alert('Éxito', 'Imagen de perfil actualizada');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Error', 'No se pudo actualizar la imagen de perfil');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!username.trim() || !phone.trim()) {
      Alert.alert('Error', 'Nombre y teléfono son requeridos');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const authUpdates: { email?: string; password?: string } = {};
      if (email && email !== user.email) authUpdates.email = email;
      if (password.trim()) authUpdates.password = password;

      if (Object.keys(authUpdates).length > 0) {
        const { error: authError } = await supabase.auth.updateUser(authUpdates);
        if (authError) throw authError;
      }

      // Update business profile in 'entities' table
      const { error: updateError } = await supabase
        .from('entities')
        .update({ 
          display_name: username,
          phone,
          email,
          description,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('type_user', 'business');

      if (updateError) throw updateError;

      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      setModalVisible(false);
      fetchBusiness();
      setPassword('');
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Error al actualizar el perfil');
    }
  };

  const handleAddProduct = async () => {
    if (!productName.trim() || !productPrice.trim()) {
      Alert.alert('Error', 'Nombre y precio son requeridos');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const price = parseFloat(productPrice);
      if (isNaN(price)) {
        throw new Error('Precio inválido');
      }

      const { error } = await supabase
        .from('products')
        .insert({
          business_id: user.id,
          name: productName,
          description: productDescription,
          price: price,
          image_url: productImage || null
        });

      if (error) throw error;

      Alert.alert('Éxito', 'Producto agregado correctamente');
      setProductModalVisible(false);
      resetProductForm();
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      Alert.alert('Error', 'No se pudo agregar el producto');
    }
  };

  const resetProductForm = () => {
    setProductName('');
    setProductDescription('');
    setProductPrice('');
    setProductImage(null);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4267B2" />
      </View>
    );
  }

  if (!business) {
    return (
      <View style={styles.center}>
        <ThemedText>No se encontró perfil de negocio</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header similar a Facebook */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/Gif/fondo2.gif')}
          style={styles.coverPhoto}
        />
        
        {/* Profile section */}
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={uploadAvatar} disabled={uploading}>
            <View style={styles.avatarContainer}>
              {business.avatar_url ? (
                <Image 
                  source={{ uri: business.avatar_url }} 
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <MaterialIcons name="store" size={50} color="#fff" />
                </View>
              )}
              {uploading && (
                <View style={styles.uploadOverlay}>
                  <ActivityIndicator color="#fff" />
                </View>
              )}
            </View>
          </TouchableOpacity>
          
          <ThemedText type="title" style={styles.businessName}>
            {business.display_name}
          </ThemedText>
          
          <ThemedText style={styles.businessCategory}>
            {business.category || 'Negocio'}
          </ThemedText>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons name="edit" size={20} color="#4267B2" />
          <ThemedText style={styles.actionButtonText}>Editar Perfil</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setProductModalVisible(true)}
        >
          <Ionicons name="add-circle" size={20} color="#4267B2" />
          <ThemedText style={styles.actionButtonText}>Agregar Producto</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Business info */}
      <View style={styles.infoCard}>
        <View style={styles.infoItem}>
          <MaterialIcons name="phone" size={24} color="#4267B2" />
          <ThemedText style={styles.infoText}>{business.phone}</ThemedText>
        </View>
        
        <View style={styles.infoItem}>
          <MaterialIcons name="email" size={24} color="#4267B2" />
          <ThemedText style={styles.infoText}>{business.email}</ThemedText>
        </View>
        
        {business.description && (
          <View style={styles.infoItem}>
            <MaterialIcons name="info" size={24} color="#4267B2" />
            <ThemedText style={styles.infoText}>{business.description}</ThemedText>
          </View>
        )}
      </View>

      {/* Products section */}
      <View style={styles.sectionHeader}>
        <ThemedText type="title" style={styles.sectionTitle}>Productos</ThemedText>
      </View>
      
      {products.length === 0 ? (
        <View style={styles.emptyProducts}>
          <ThemedText style={styles.emptyText}>No hay productos aún</ThemedText>
        </View>
      ) : (
        <FlatList
          data={products}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsContainer}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.productImage} />
              ) : (
                <View style={[styles.productImage, styles.productImagePlaceholder]}>
                  <MaterialIcons name="photo-camera" size={30} color="#fff" />
                </View>
              )}
              <ThemedText style={styles.productName}>{item.name}</ThemedText>
              <ThemedText style={styles.productPrice}>${item.price.toFixed(2)}</ThemedText>
              {item.description && (
                <ThemedText style={styles.productDescription} numberOfLines={2}>
                  {item.description}
                </ThemedText>
              )}
            </View>
          )}
        />
      )}

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <ThemedText type="title" style={styles.modalTitle}>Editar Perfil</ThemedText>

            <View style={styles.inputContainer}>
              <MaterialIcons name="store" size={24} color="#4267B2" />
              <TextInput
                style={styles.input}
                placeholder="Nombre del Negocio"
                value={username}
                onChangeText={setUsername}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="phone" size={24} color="#4267B2" />
              <TextInput
                style={styles.input}
                placeholder="Teléfono"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={24} color="#4267B2" />
              <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="info" size={24} color="#4267B2" />
              <TextInput
                style={styles.input}
                placeholder="Descripción"
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={24} color="#4267B2" />
              <TextInput
                style={styles.input}
                placeholder="Nueva Contraseña (opcional)"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <ThemedText style={styles.cancelButtonText}>Cancelar</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateProfile}
              >
                <ThemedText style={styles.saveButtonText}>Guardar</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Product Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={productModalVisible}
        onRequestClose={() => setProductModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <ThemedText type="title" style={styles.modalTitle}>Agregar Producto</ThemedText>

            <View style={styles.inputContainer}>
              <MaterialIcons name="shopping-bag" size={24} color="#4267B2" />
              <TextInput
                style={styles.input}
                placeholder="Nombre del Producto"
                value={productName}
                onChangeText={setProductName}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="description" size={24} color="#4267B2" />
              <TextInput
                style={styles.input}
                placeholder="Descripción (opcional)"
                value={productDescription}
                onChangeText={setProductDescription}
                multiline
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="attach-money" size={24} color="#4267B2" />
              <TextInput
                style={styles.input}
                placeholder="Precio"
                keyboardType="decimal-pad"
                value={productPrice}
                onChangeText={setProductPrice}
              />
            </View>

            <TouchableOpacity 
              style={styles.uploadImageButton}
              onPress={async () => {
                // Similar a la función uploadAvatar pero para productos
                try {
                  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                  if (status !== 'granted') {
                    Alert.alert('Permisos necesarios', 'Necesitamos acceso a tus fotos');
                    return;
                  }

                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 0.8,
                  });

                  if (result.canceled) return;

                  setProductImage(result.assets[0].uri);
                } catch (error) {
                  console.error('Error selecting image:', error);
                  Alert.alert('Error', 'No se pudo seleccionar la imagen');
                }
              }}
            >
              <ThemedText style={styles.uploadImageText}>
                {productImage ? 'Cambiar Imagen' : 'Agregar Imagen (opcional)'}
              </ThemedText>
            </TouchableOpacity>

            {productImage && (
              <Image 
                source={{ uri: productImage }} 
                style={styles.productPreviewImage}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setProductModalVisible(false);
                  resetProductForm();
                }}
              >
                <ThemedText style={styles.cancelButtonText}>Cancelar</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddProduct}
              >
                <ThemedText style={styles.saveButtonText}>Agregar</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  // Header styles (similar to Facebook)
  header: {
    position: 'relative',
    height: 300,
    marginBottom: 60,
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
  },
  profileSection: {
    position: 'absolute',
    bottom: -50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    backgroundColor: '#4267B2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  businessName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1c1e21',
    marginTop: 10,
  },
  businessCategory: {
    fontSize: 16,
    color: '#65676b',
    marginTop: 5,
  },
  // Action buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7f3ff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: '#4267B2',
    fontWeight: '600',
    marginLeft: 5,
  },
  // Info card
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#1c1e21',
  },
  // Products section
  sectionHeader: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1c1e21',
  },
  emptyProducts: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#65676b',
    fontSize: 16,
  },
  productsContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  productCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 5,
    marginBottom: 8,
  },
  productImagePlaceholder: {
    backgroundColor: '#dddfe2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  productPrice: {
    color: '#4267B2',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  productDescription: {
    color: '#65676b',
    fontSize: 14,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1c1e21',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#dddfe2',
    paddingBottom: 8,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#1c1e21',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#e4e6eb',
  },
  saveButton: {
    backgroundColor: '#4267B2',
  },
  cancelButtonText: {
    color: '#1c1e21',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  uploadImageButton: {
    backgroundColor: '#e7f3ff',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  uploadImageText: {
    color: '#4267B2',
    fontWeight: '600',
  },
  productPreviewImage: {
    width: '100%',
    height: 150,
    borderRadius: 5,
    marginBottom: 15,
  },
});