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
      fetch('http://192.168.1.120:5000/api/repartidor/profileRepartidor', {
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
        <ActivityIndicator size="large" color="#4267B2" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: repartidor?.avatar }} style={styles.avatar} />
        <Text style={styles.title}>{repartidor?.nombre}</Text>
        <Text style={styles.subtitle}>{repartidor?.correo}</Text>
        <Text style={styles.subtitle}>{repartidor?.telefono}</Text>
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>Nombre: {repartidor?.nombre}</Text>
        <Text style={styles.infoText}>Tipo de servicio: {repartidor?.tipo_servicio}</Text>
        <Text style={styles.infoText}>Disponibilidad: {repartidor?.disponibilidad}</Text>
        <Text style={styles.infoText}>Fecha de nacimiento: {repartidor?.fecha_nacimiento}</Text>
        <Text style={styles.infoText}>Correo: {repartidor?.correo}</Text>
        <Text style={styles.infoText}>Teléfono: {repartidor?.telefono}</Text>
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