import { API_BASE_URL } from '@/constants/ApiConfig';
import { useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';

interface NegocioPublico {
  id: number;
  nombre: string;
  categoria: string;
  telefono?: string;
  correo?: string;
  descripcion?: string;
  direccion?: string;
  disponibilidad?: boolean;
  tipo_entrega?: string;
}

export default function PublicBusinessProfileScreen() {
  const route = useRoute();
  // @ts-ignore
  const { negocioId } = route.params || {};
  const [negocio, setNegocio] = useState<NegocioPublico | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/producto/public_profile/${negocioId}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setNegocio(data.negocio);
        } else {
          setError('No se pudo cargar el perfil del negocio.');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudo cargar el perfil del negocio.');
        setLoading(false);
      });
  }, [negocioId]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#a18cd1" /></View>;
  }
  if (error || !negocio) {
    return <View style={styles.center}><Text style={styles.error}>{error || 'Error desconocido'}</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} style={styles.avatar} />
        <Text style={styles.name}>{negocio.nombre}</Text>
        <Text style={styles.category}>{negocio.categoria}</Text>
        <Text style={styles.description}>{negocio.descripcion}</Text>
        <Text style={styles.info}>Tel: {negocio.telefono}</Text>
        <Text style={styles.info}>Dirección: {negocio.direccion}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: '#a18cd1', fontSize: 16, fontWeight: '600' },
  header: { alignItems: 'center', padding: 20, backgroundColor: '#f3f3fa' },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 10 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#6c63ff' },
  category: { fontSize: 16, color: '#7c6ee6', marginBottom: 5 },
  description: { fontSize: 14, color: '#444', marginBottom: 5, textAlign: 'center' },
  info: { fontSize: 13, color: '#888' },
});
