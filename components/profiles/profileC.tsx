import React, { useEffect, useState } from 'react';
import {ActivityIndicator,Image,ScrollView,StyleSheet,Text, View} from 'react-native';

interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  avatar: string;
  direccion: string;
}

export default function ClientProfileScreen() {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://192.168.1.120:5000/api/cliente/profile')
      .then(res => res.json())
      .then(data => {
        setCliente(data.cliente);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
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
        <Text style={styles.subtitle}>{cliente?.email}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>Teléfono: {cliente?.telefono}</Text>
        <Text style={styles.infoText}>Dirección: {cliente?.direccion}</Text>
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
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  orderCard: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 8, marginBottom: 10 },
  orderProduct: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
});
