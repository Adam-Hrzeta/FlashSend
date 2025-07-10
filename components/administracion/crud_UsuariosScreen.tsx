import { API_BASE_URL } from "@/constants/ApiConfig";
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  tipo: string;
}

export default function Crud_UsuariosScreen({ setNotAuth }: { setNotAuth?: (v: boolean) => void }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editUser, setEditUser] = useState<Usuario | null>(null);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [tipo, setTipo] = useState('cliente');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');

  const fetchUsuarios = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('access_token');
    if (!token) {
      setNotAuth && setNotAuth(true);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard_admin/usuarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403) {
        setNotAuth && setNotAuth(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsuarios(data);
      } else {
        setUsuarios([]);
        setError(typeof data === 'object' && data?.error ? data.error : 'Respuesta inesperada del servidor');
      }
    } catch (e) {
      setUsuarios([]);
      setError('Error de conexión o token inválido');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleDelete = async (id: number, tipo: string) => {
    Alert.alert('Eliminar usuario', '¿Estás seguro de eliminar este usuario?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('access_token');
            await fetch(`${API_BASE_URL}/api/dashboard_admin/usuarios/${tipo}/${id}`, {
              method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsuarios();
          } catch {
            Alert.alert('Error', 'No se pudo eliminar');
          }
        }
      }
    ]);
  };

  const openEdit = (user: Usuario) => {
    setEditUser(user);
    setNombre(user.nombre);
    setCorreo(user.correo);
    setTipo(user.tipo);
    setContrasena('');
    setModalVisible(true);
    setError('');
  };

  const openCreate = () => {
    setEditUser(null);
    setNombre('');
    setCorreo('');
    setTipo('administrador');
    setContrasena('');
    setModalVisible(true);
    setError('');
  };

  const handleSave = async () => {
    if (!nombre.trim() || !correo.trim() || !tipo.trim() || (!editUser && !contrasena.trim())) {
      setError('Completa todos los campos');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('access_token');
      const body = { nombre, correo, tipo, ...(contrasena ? { contrasena } : {}) };
      if (editUser) {
        await fetch(`${API_BASE_URL}/api/dashboard_admin/usuarios/${editUser.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body)
        });
      } else {
        await fetch(`${API_BASE_URL}/api/dashboard_admin/usuarios`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body)
        });
      }
      setModalVisible(false);
      fetchUsuarios();
    } catch {
      setError('No se pudo guardar');
    }
  };

  return (
    <LinearGradient
      colors={["#F06292", "#BA68C8", "#9575CD", "#7E57C2", "#F06292"]}
      style={styles.gradient}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>Usuarios</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <MaterialIcons name="person-add" size={24} color="#fff" />
          <Text style={styles.addBtnText}>Crear admin</Text>
        </TouchableOpacity>
      </View>
      {loading ? <ActivityIndicator size="large" style={{ marginTop: 40 }} /> : (
        <FlatList
          data={usuarios}
          keyExtractor={u => `${u.tipo}-${u.id}`}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          ListEmptyComponent={<View>
            <Text style={styles.empty}>No hay usuarios</Text>
            {error ? <Text style={{ color: 'red', marginTop: 10, textAlign: 'center' }}>{error}</Text> : null}
          </View>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="person" size={32} color="#7E57C2" style={{ marginRight: 8 }} />
                <View>
                  <Text style={styles.name}>{item.nombre}</Text>
                  <Text style={styles.email}>{item.correo}</Text>
                  <Text style={styles.tipo}>{item.tipo}</Text>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                  <MaterialIcons name="edit" size={22} color="#fff" />
                  <Text style={styles.btnText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id, item.tipo)}>
                  <MaterialIcons name="delete" size={22} color="#fff" />
                  <Text style={styles.btnText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editUser ? 'Editar usuario' : 'Crear administrador'}</Text>
            <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
            <TextInput style={styles.input} placeholder="Correo" value={correo} onChangeText={setCorreo} autoCapitalize="none" keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="Tipo (cliente, repartidor, negocio, administrador)" value={tipo} onChangeText={setTipo} />
            <TextInput style={styles.input} placeholder="Contraseña" value={contrasena} onChangeText={setContrasena} secureTextEntry />
            {error ? <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text> : null}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <MaterialIcons name="save" size={22} color="#fff" />
                <Text style={styles.btnText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <MaterialIcons name="cancel" size={22} color="#fff" />
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 0 },
  title: { fontWeight: 'bold', fontSize: 22, color: '#fff' },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#7E57C2', padding: 8, borderRadius: 8 },
  addBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 4 },
  empty: { color: '#fff', fontStyle: 'italic', marginTop: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: { fontWeight: 'bold', fontSize: 18, color: '#7E57C2' },
  email: { color: '#888', fontSize: 15 },
  tipo: { color: '#BA68C8', fontWeight: 'bold', fontSize: 15 },
  actions: { flexDirection: 'row', marginTop: 12, justifyContent: 'flex-end' },
  editBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#9575CD', padding: 8, borderRadius: 8, marginRight: 8 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F06292', padding: 8, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 4 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: 320, maxWidth: '90%' },
  modalTitle: { fontWeight: 'bold', fontSize: 20, color: '#7E57C2', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#BA68C8', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 16 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#7E57C2', padding: 8, borderRadius: 8, marginRight: 8 },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#BDBDBD', padding: 8, borderRadius: 8 },
});