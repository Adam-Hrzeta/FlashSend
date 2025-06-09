import { API_BASE_URL } from '@/constants/ApiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';

interface Cliente {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  avatar: string;
  fecha_nacimiento: string;
}

export default function ClientProfileScreen() {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCliente = async () => {
      const token = await AsyncStorage.getItem('access_token');
      fetch(`${API_BASE_URL}/api/cliente/profileCliente`, {
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
          setCliente(data.cliente);
          setLoading(false);
        })
        .catch(err => {
          setError('No tienes permiso para ver este perfil.');
          setLoading(false);
        });
    };
    fetchCliente();
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
        <Image source={{ uri: cliente?.avatar }} style={styles.avatar} />
        <Text style={styles.title}>{cliente?.nombre}</Text>
        <Text style={styles.subtitle}>{cliente?.correo}</Text>
        <Text style={styles.subtitle}>{cliente?.telefono}</Text>
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>Nombre: {cliente?.nombre}</Text>
        <Text style={styles.infoText}>Fecha de nacimiento: {cliente?.fecha_nacimiento}</Text>
        <Text style={styles.infoText}>Correo: {cliente?.correo}</Text>
        <Text style={styles.infoText}>Teléfono: {cliente?.telefono}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 10 },
  infoCard: { backgroundColor: '#eee', padding: 15, borderRadius: 10, marginBottom: 15 },
  infoText: { fontSize: 16, marginBottom: 5 },
});