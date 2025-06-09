import { API_BASE_URL } from '@/constants/ApiConfig';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface Repartidor {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  avatar: string;
  fecha_nacimiento: string;
  tipo_servicio: string;
  disponibilidad: string;
  negocio_nombre?: string;
  negocio_info?: string;
}

interface Negocio {
  id: number;
  nombre: string;
  categoria: string;
  descripcion: string;
}

export default function DealerProfileScreen() {
  const [repartidor, setRepartidor] = useState<Repartidor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState<Partial<Repartidor>>({});
  const [tipoServicio, setTipoServicio] = useState<string>('');

  // Estados para búsqueda de negocios (solo de a mentis)
  const [busquedaNombre, setBusquedaNombre] = useState('');
  const [busquedaCategoria, setBusquedaCategoria] = useState('');
  const [negociosEncontrados, setNegociosEncontrados] = useState<Negocio[]>([]);
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    const fetchRepartidor = async () => {
      const token = await AsyncStorage.getItem('access_token');
      fetch(`${API_BASE_URL}/api/repartidor/profileRepartidor`, {
        headers: {
          'Authorization': `Bearer ${token}`,
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
          setRepartidor(data.repartidor);
          setEditData(data.repartidor);
          setTipoServicio(data.repartidor.tipo_servicio);
          setLoading(false);
        })
        .catch(() => {
          setError('No tienes permiso para ver este perfil.');
          setLoading(false);
        });
    };
    fetchRepartidor();
  }, []);

  const handleEdit = () => {
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    const token = await AsyncStorage.getItem('access_token');
    fetch(`${API_BASE_URL}/api/repartidor/editarPerfil`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editData)
    })
      .then(async res => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.mensaje || 'Error al editar');
        }
        return res.json();
      })
      .then(data => {
        setRepartidor(data.repartidor);
        setEditModalVisible(false);
        setTipoServicio(data.repartidor.tipo_servicio);
        Alert.alert('Perfil actualizado');
      })
      .catch(() => {
        Alert.alert('Error', 'No se pudo actualizar el perfil');
      });
  };

  // Manejo de cambio de tipo de servicio fuera del modal
  const handleTipoServicioChange = (tipo: string) => {
    setTipoServicio(tipo);
    // Actualiza el backend
    const update = async () => {
      const token = await AsyncStorage.getItem('access_token');
      await fetch(`${API_BASE_URL}/api/repartidor/editarPerfil`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...repartidor,
          tipo_servicio: tipo,
        })
      });
    };
    update();
  };

  // Búsqueda de negocios (solo de a mentis, no hace nada)
  const buscarNegocios = async () => {
    setBuscando(true);
    setNegociosEncontrados([]);
    // Solo simula búsqueda, no llama API
    setTimeout(() => {
      setNegociosEncontrados([]);
      setBuscando(false);
    }, 800);
  };

  // Solicitud de alianza (solo de a mentis)
  const enviarSolicitudAliado = async (negocioId: number) => {
    Alert.alert('Solicitud enviada', 'Esto es solo de a mentis, no se envió nada.');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7E57C2" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.avatarCircle}>
          <Image source={{ uri: repartidor?.avatar }} style={styles.avatar} />
        </View>
        <View style={styles.infoSide}>
          <Text style={styles.nameOnly}>
            {repartidor?.nombre}
          </Text>
          <Text style={styles.emailOnly}>
            {repartidor?.correo}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
        <MaterialIcons name="edit" size={20} color="#7E57C2" />
        <Text style={styles.editButtonText}>Editar información</Text>
      </TouchableOpacity>
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          <MaterialIcons name="badge" size={18} color="#7E57C2" /> Nombre: {repartidor?.nombre}
        </Text>
        <Text style={styles.infoText}>
          <MaterialIcons name="event-available" size={18} color="#7E57C2" /> Disponibilidad: {repartidor?.disponibilidad}
        </Text>
        <Text style={styles.infoText}>
          <MaterialIcons name="cake" size={18} color="#7E57C2" /> Fecha de nacimiento: {repartidor?.fecha_nacimiento}
        </Text>
        <Text style={styles.infoText}>
          <MaterialIcons name="email" size={18} color="#7E57C2" /> Correo: {repartidor?.correo}
        </Text>
        <Text style={styles.infoText}>
          <MaterialIcons name="phone" size={18} color="#7E57C2" /> Teléfono: {repartidor?.telefono}
        </Text>
      </View>
      {/* Tipo de servicio abajo */}
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          <MaterialIcons name="local-shipping" size={18} color="#7E57C2" /> Tipo de servicio:
        </Text>
        <View style={{ flexDirection: 'row', marginTop: 8, marginBottom: 8 }}>
          <TouchableOpacity
            style={[
              styles.servicioOption,
              tipoServicio === 'Cuenta propia' && styles.servicioOptionSelected,
            ]}
            onPress={() => handleTipoServicioChange('Cuenta propia')}
          >
            <Text style={{ color: tipoServicio === 'Cuenta propia' ? '#fff' : '#7E57C2' }}>Cuenta propia</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.servicioOption,
              tipoServicio === 'Aliado' && styles.servicioOptionSelected,
            ]}
            onPress={() => handleTipoServicioChange('Aliado')}
          >
            <Text style={{ color: tipoServicio === 'Aliado' ? '#fff' : '#7E57C2' }}>Aliado</Text>
          </TouchableOpacity>
        </View>
        {tipoServicio === 'Aliado' && (
          <>
            {/* Buscador de negocios solo de a mentis */}
            <Text style={[styles.infoText, { marginTop: 14, fontWeight: 'bold' }]}>Buscar negocios para aliarse</Text>
            <View style={styles.inputRow}>
              <MaterialIcons name="search" size={20} color="#BA68C8" style={styles.inputIcon} />
              <TextInput
                style={styles.inputCustom}
                placeholder="Nombre del negocio"
                placeholderTextColor="#BA68C8"
                value={busquedaNombre}
                onChangeText={setBusquedaNombre}
              />
            </View>
            <View style={styles.inputRow}>
              <MaterialIcons name="category" size={20} color="#BA68C8" style={styles.inputIcon} />
              <TextInput
                style={styles.inputCustom}
                placeholder="Categoría"
                placeholderTextColor="#BA68C8"
                value={busquedaCategoria}
                onChangeText={setBusquedaCategoria}
              />
            </View>
            <TouchableOpacity style={styles.modalButton} onPress={buscarNegocios}>
              <Text style={styles.modalButtonText}>
                <MaterialIcons name="search" size={18} color="#fff" /> Buscar negocios
              </Text>
            </TouchableOpacity>
            {buscando && <ActivityIndicator color="#7E57C2" style={{ marginTop: 8 }} />}
            {/* Solo de a mentis, no muestra resultados reales */}
            {negociosEncontrados.length === 0 && !buscando ? (
              <Text style={styles.emptyPedidos}>No se encontraron negocios.</Text>
            ) : (
              negociosEncontrados.map(item => (
                <View key={item.id} style={styles.infoCard}>
                  <Text style={styles.infoText}><MaterialIcons name="store" size={16} color="#7E57C2" /> {item.nombre}</Text>
                  <Text style={styles.infoText}><MaterialIcons name="category" size={16} color="#7E57C2" /> {item.categoria}</Text>
                  <Text style={styles.infoText}>{item.descripcion}</Text>
                  <TouchableOpacity
                    style={[styles.modalButton, { marginTop: 8 }]}
                    onPress={() => enviarSolicitudAliado(item.id)}
                  >
                    <Text style={styles.modalButtonText}>
                      <MaterialIcons name="send" size={18} color="#fff" /> Solicitar alianza
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Modal para editar información */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContentCustom}>
            <View style={styles.modalIconCircle}>
              <MaterialIcons name="edit" size={38} color="#fff" />
            </View>
            <Text style={styles.modalTitleCustom}>Editar información</Text>
            <View style={styles.inputRow}>
              <MaterialIcons name="person" size={20} color="#BA68C8" style={styles.inputIcon} />
              <TextInput
                style={styles.inputCustom}
                placeholder="Nombre"
                placeholderTextColor="#BA68C8"
                value={editData.nombre}
                onChangeText={text => setEditData({ ...editData, nombre: text })}
              />
            </View>
            <View style={styles.inputRow}>
              <MaterialIcons name="email" size={20} color="#BA68C8" style={styles.inputIcon} />
              <TextInput
                style={styles.inputCustom}
                placeholder="Correo"
                placeholderTextColor="#BA68C8"
                value={editData.correo}
                onChangeText={text => setEditData({ ...editData, correo: text })}
                keyboardType="email-address"
              />
            </View>
            <View style={styles.inputRow}>
              <MaterialIcons name="phone" size={20} color="#BA68C8" style={styles.inputIcon} />
              <TextInput
                style={styles.inputCustom}
                placeholder="Teléfono"
                placeholderTextColor="#BA68C8"
                value={editData.telefono}
                onChangeText={text => setEditData({ ...editData, telefono: text })}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.inputRow}>
              <MaterialIcons name="cake" size={20} color="#BA68C8" style={styles.inputIcon} />
              <TextInput
                style={styles.inputCustom}
                placeholder="Fecha de nacimiento"
                placeholderTextColor="#BA68C8"
                value={editData.fecha_nacimiento}
                onChangeText={text => setEditData({ ...editData, fecha_nacimiento: text })}
              />
            </View>
            <TouchableOpacity style={styles.modalButton} onPress={handleSaveEdit}>
              <Text style={styles.modalButtonText}>
                <MaterialIcons name="save" size={18} color="#fff" /> Guardar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButtonCustom} onPress={() => setEditModalVisible(false)}>
              <Text style={styles.cancelButtonText}>
                <MaterialIcons name="close" size={18} color="#7E57C2" /> Cancelar
              </Text>
            </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F5FF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#7E57C2',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 24,
    paddingTop: 24,
    elevation: 8,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    paddingHorizontal: 18,
    justifyContent: 'flex-start',
  },
  avatarCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
    elevation: 6,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  infoSide: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
    paddingLeft: 10,
  },
  nameOnly: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
    textAlign: 'left',
    letterSpacing: 1.1,
  },
  emailOnly: {
    fontSize: 16,
    color: '#FFD6F6',
    marginBottom: 6,
    textAlign: 'left',
    fontWeight: '600',
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
  infoText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#7E57C2',
    fontWeight: '500',
    textAlign: 'left',
  },
  errorText: {
    color: '#C62828',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: 'bold',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginRight: 24,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    elevation: 2,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 4,
  },
  editButtonText: {
    color: '#7E57C2',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(126,87,194,0.22)',
    padding: 16,
  },
  modalContentCustom: {
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
  modalTitleCustom: {
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
  inputCustom: {
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
  cancelButtonCustom: {
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
  servicioOption: {
    borderWidth: 1,
    borderColor: '#7E57C2',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    backgroundColor: '#fff',
  },
  servicioOptionSelected: {
    backgroundColor: '#7E57C2',
    borderColor: '#7E57C2',
  },
  emptyPedidos: {
    color: '#B39DDB',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
});