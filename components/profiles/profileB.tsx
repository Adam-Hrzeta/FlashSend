import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

  useEffect(() => {
    const fetchNegocio = async () => {
      fetch('http://192.168.1.120:5000/api/negocio/profileNegocio', {
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(async res => {
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data?.mensaje || 'No autorizado');
          }
          return res.json();
        })
        .then(data => {
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
        <View style={styles.avatarWrap}>
          <Image source={{ uri: negocio?.avatar }} style={styles.avatar} />
        </View>
        <Text style={styles.title}>{negocio?.nombre}</Text>
        <Text style={styles.subtitle}>{negocio?.categoria}</Text>
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
        <Text>{negocio?.telefono}</Text>
        <Text>{negocio?.correo}</Text>
        <Text>{negocio?.descripcion}</Text>
      </View>

      <Text style={styles.sectionTitle}>Productos</Text>
      <FlatList
        horizontal
        data={productos}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <Image source={{ uri: item.imagen_url }} style={styles.productImage} />
            <Text>{item.nombre}</Text>
            <Text>${item.precio.toFixed(2)}</Text>
          </View>
        )}
      />

      {/* Modal Editar Perfil */}
      <Modal visible={modalEditarVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Editar Perfil</Text>
            <TextInput placeholder="Nombre" style={styles.input} />
            <TextInput placeholder="Teléfono" style={styles.input} />
            <TextInput placeholder="Correo" style={styles.input} />
            <TextInput placeholder="Descripción" style={styles.input} />
            <Pressable style={styles.modalButton}><Text style={styles.modalButtonText}>Guardar</Text></Pressable>
            <Pressable onPress={() => setModalEditarVisible(false)}><Text>Cancelar</Text></Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal Agregar Producto */}
      <Modal visible={modalAgregarVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Nuevo Producto</Text>
            <TextInput placeholder="Nombre" style={styles.input} />
            <TextInput placeholder="Descripción" style={styles.input} />
            <TextInput placeholder="Precio" style={styles.input} keyboardType="numeric" />
            <Pressable style={styles.modalButton}><Text style={styles.modalButtonText}>Agregar</Text></Pressable>
            <Pressable onPress={() => setModalAgregarVisible(false)}><Text>Cancelar</Text></Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  header: { alignItems: 'center', marginBottom: 20 },
  coverPhoto: { width: '100%', height: 150, resizeMode: 'cover' },
  avatarWrap: { marginTop: -40, borderWidth: 2, borderColor: '#fff', borderRadius: 50, overflow: 'hidden' },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  title: { fontSize: 20, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#666' },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
  actionButton: { flexDirection: 'row', alignItems: 'center' },
  actionButtonText: { marginLeft: 5, color: '#4267B2' },
  infoCard: { backgroundColor: '#eee', padding: 10, borderRadius: 10, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  productCard: { backgroundColor: '#f5f5f5', padding: 10, borderRadius: 8, marginRight: 10, alignItems: 'center' },
  productImage: { width: 100, height: 100, marginBottom: 5 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 10 },
  input: { borderBottomWidth: 1, marginBottom: 10, padding: 5 },
  modalButton: { backgroundColor: '#4267B2', padding: 10, borderRadius: 5, marginTop: 10, alignItems: 'center' },
  modalButtonText: { color: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});