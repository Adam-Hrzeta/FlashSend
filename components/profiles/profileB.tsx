// BusinessProfileScreen.tsx
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, FlatList, Modal, TextInput, Pressable } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

export default function BusinessProfileScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: 'https://via.placeholder.com/400x150' }} style={styles.coverPhoto} />
        <View style={styles.avatarWrap}>
          <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} style={styles.avatar} />
        </View>
        <Text style={styles.title}>Nombre del Negocio</Text>
        <Text style={styles.subtitle}>Categoría</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="edit" size={20} color="#4267B2" />
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="add-circle" size={20} color="#4267B2" />
          <Text style={styles.actionButtonText}>Agregar Producto</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text>Teléfono</Text>
        <Text>Correo electrónico</Text>
        <Text>Descripción del negocio</Text>
      </View>

      <Text style={styles.sectionTitle}>Productos</Text>
      <FlatList
        horizontal
        data={[1, 2, 3]}
        keyExtractor={(item, index) => index.toString()}
        renderItem={() => (
          <View style={styles.productCard}>
            <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.productImage} />
            <Text>Nombre Producto</Text>
            <Text>$00.00</Text>
          </View>
        )}
      />

      {/* Modal Editar Perfil */}
      <Modal visible={false} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Editar Perfil</Text>
            <TextInput placeholder="Nombre" style={styles.input} />
            <TextInput placeholder="Teléfono" style={styles.input} />
            <TextInput placeholder="Correo" style={styles.input} />
            <TextInput placeholder="Descripción" style={styles.input} />
            <Pressable style={styles.modalButton}><Text style={styles.modalButtonText}>Guardar</Text></Pressable>
            <Pressable><Text>Cancelar</Text></Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal Agregar Producto */}
      <Modal visible={false} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Nuevo Producto</Text>
            <TextInput placeholder="Nombre" style={styles.input} />
            <TextInput placeholder="Descripción" style={styles.input} />
            <TextInput placeholder="Precio" style={styles.input} keyboardType="numeric" />
            <Pressable style={styles.modalButton}><Text style={styles.modalButtonText}>Agregar</Text></Pressable>
            <Pressable><Text>Cancelar</Text></Pressable>
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
});
