import { API_BASE_URL } from '@/constants/ApiConfig';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
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

interface Negocio {
  id: number;
  nombre: string;
  categoria: string;
  telefono: string;
  correo: string;
  descripcion: string;
  cover_photo: string;
  avatar: string;
}

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
}

export default function BusinessProfileScreen() {
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [modalAgregarVisible, setModalAgregarVisible] = useState(false);

  // Animaciones para avatar y nombre
  const avatarAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchNegocio = async () => {
      fetch(`${API_BASE_URL}/api/negocio/profileNegocio`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data?.mensaje || 'No autorizado');
          }
          return res.json();
        })
        .then((data) => {
          setNegocio(data.negocio);
          setProductos(data.productos);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    };
    fetchNegocio();
  }, []);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(avatarAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(titleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
      }),
    ]).start();
  }, [negocio]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4267B2" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: negocio?.cover_photo }} style={styles.coverPhoto} />
        <View style={styles.profileRow}>
          <Animated.View
            style={[
              styles.avatarWrap,
              {
                transform: [
                  {
                    scale: avatarAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.7, 1],
                    }),
                  },
                  {
                    translateY: avatarAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
                opacity: avatarAnim,
              },
            ]}
          >
            <Image source={{ uri: negocio?.avatar }} style={styles.avatar} />
          </Animated.View>
          <View style={styles.profileInfo}>
            <Animated.Text
              style={[
                styles.title,
                {
                  opacity: titleAnim,
                  transform: [
                    {
                      scale: titleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                    {
                      translateY: titleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {negocio?.nombre}
            </Animated.Text>
            <Text style={styles.subtitle}>{negocio?.categoria}</Text>
            <Text style={styles.infoText}>{negocio?.telefono}</Text>
            <Text style={styles.infoText}>{negocio?.correo}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={() => setModalEditarVisible(true)}>
          <MaterialIcons name="edit" size={20} color="#4267B2" />
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => setModalAgregarVisible(true)}>
          <Ionicons name="add-circle" size={20} color="#4267B2" />
          <Text style={styles.actionButtonText}>Agregar Producto</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text>{negocio?.descripcion}</Text>
      </View>

      <Text style={styles.sectionTitle}>Productos</Text>
      <FlatList
        horizontal
        data={productos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <Image source={{ uri: item.imagen_url }} style={styles.productImage} />
            <Text>{item.nombre}</Text>
            <Text>${item.precio.toFixed(2)}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingLeft: 22, paddingBottom: 10 }}
        showsHorizontalScrollIndicator={false}
      />

      {/* Modal Editar Perfil */}
      <Modal visible={modalEditarVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconCircle}>
              <MaterialIcons name="edit" size={38} color="#fff" />
            </View>
            <Text style={styles.modalTitle}>Editar Perfil</Text>
            <View style={styles.inputRow}>
              <MaterialIcons name="person" size={20} color="#BA68C8" style={styles.inputIcon} />
              <TextInput placeholder="Nombre" style={styles.input} placeholderTextColor="#BA68C8" />
            </View>
            <View style={styles.inputRow}>
              <MaterialIcons name="phone" size={20} color="#BA68C8" style={styles.inputIcon} />
              <TextInput placeholder="Teléfono" style={styles.input} placeholderTextColor="#BA68C8" />
            </View>
            <View style={styles.inputRow}>
              <MaterialIcons name="email" size={20} color="#BA68C8" style={styles.inputIcon} />
              <TextInput placeholder="Correo" style={styles.input} placeholderTextColor="#BA68C8" />
            </View>
            <View style={styles.inputRow}>
              <MaterialIcons name="info" size={20} color="#BA68C8" style={styles.inputIcon} />
              <TextInput placeholder="Descripción" style={styles.input} placeholderTextColor="#BA68C8" />
            </View>
            <Pressable style={styles.modalButton}>
              <Text style={styles.modalButtonText}>
                <MaterialIcons name="save" size={18} color="#fff" /> Guardar
              </Text>
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={() => setModalEditarVisible(false)}>
              <Text style={styles.cancelButtonText}>
                <MaterialIcons name="close" size={18} color="#7E57C2" /> Cancelar
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal Agregar Producto */}
      <Modal visible={modalAgregarVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="add-circle" size={38} color="#fff" />
            </View>
            <Text style={styles.modalTitle}>Nuevo Producto</Text>
            <View style={styles.inputRow}>
              <MaterialIcons name="fastfood" size={20} color="#BA68C8" style={styles.inputIcon} />
              <TextInput placeholder="Nombre" style={styles.input} placeholderTextColor="#BA68C8" />
            </View>
            <View style={styles.inputRow}>
              <MaterialIcons name="description" size={20} color="#BA68C8" style={styles.inputIcon} />
              <TextInput placeholder="Descripción" style={styles.input} placeholderTextColor="#BA68C8" />
            </View>
            <View style={styles.inputRow}>
              <MaterialIcons name="attach-money" size={20} color="#BA68C8" style={styles.inputIcon} />
              <TextInput placeholder="Precio" style={styles.input} keyboardType="numeric" placeholderTextColor="#BA68C8" />
            </View>
            <Pressable style={styles.modalButton}>
              <Text style={styles.modalButtonText}>
                <Ionicons name="add-circle" size={18} color="#fff" /> Agregar
              </Text>
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={() => setModalAgregarVisible(false)}>
              <Text style={styles.cancelButtonText}>
                <MaterialIcons name="close" size={18} color="#7E57C2" /> Cancelar
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5FF',
    padding: 0,
  },
  header: {
    backgroundColor: '#7E57C2',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 39,
    paddingBottom: 12,
    paddingTop: 0,
    elevation: 10,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    marginBottom: 10,
  },
  coverPhoto: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -80,
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  avatarWrap: {
    borderWidth: 4,
    borderColor: '#fff',
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    width: 100,
    height: 100,
    marginRight: 18,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'left',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(126, 87, 194, 0.13)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 15,
    color: '#FFD6F6',
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'left',
    letterSpacing: 0.5,
  },
  infoText: {
    color: '#F3EFFF',
    fontSize: 13,
    marginBottom: 2,
    textAlign: 'left',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 14,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE7F6',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#B39DDB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  actionButtonText: {
    marginLeft: 8,
    color: '#7E57C2',
    fontWeight: '700',
    fontSize: 15,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 18,
    marginHorizontal: 18,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#B39DDB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    gap: 2,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#7E57C2',
    marginLeft: 18,
    textAlign: 'left',
  },
  productCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 14,
    marginRight: 14,
    alignItems: 'center',
    width: 130,
    elevation: 2,
    shadowColor: '#B39DDB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
  },
  productImage: {
    width: 90,
    height: 90,
    marginBottom: 8,
    borderRadius: 10,
    backgroundColor: '#F3EFFF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(126,87,194,0.22)',
    padding: 16,
  },
  modalContent: {
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
  modalTitle: {
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
  input: {
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
  cancelButton: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F5FF',
  },
});