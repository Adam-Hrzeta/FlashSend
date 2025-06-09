import { API_BASE_URL } from '@/constants/ApiConfig';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';

interface Repartidor {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  avatar: string;
  fecha_nacimiento: string;
  tipo_servicio: string;
  disponibilidad: string;
}

export default function DealerProfileScreen() {
  const [repartidor, setRepartidor] = useState<Repartidor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          setLoading(false);
        })
        .catch(err => {
          setError('No tienes permiso para ver este perfil.');
          setLoading(false);
        });
    };
    fetchRepartidor();
  }, []);

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
          <Text style={styles.title}>
            <MaterialIcons name="person" size={22} color="#fff" /> {repartidor?.nombre}
          </Text>
          <Text style={styles.subtitle}>
            <MaterialIcons name="email" size={18} color="#FFD6F6" /> {repartidor?.correo}
          </Text>
          <Text style={styles.subtitle}>
            <MaterialIcons name="phone" size={18} color="#FFD6F6" /> {repartidor?.telefono}
          </Text>
        </View>
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          <MaterialIcons name="badge" size={18} color="#7E57C2" /> Nombre: {repartidor?.nombre}
        </Text>
        <Text style={styles.infoText}>
          <MaterialIcons name="local-shipping" size={18} color="#7E57C2" /> Tipo de servicio: {repartidor?.tipo_servicio}
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
      {error && <Text style={styles.errorText}>{error}</Text>}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
    textAlign: 'left',
    letterSpacing: 1.1,
  },
  subtitle: {
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
});