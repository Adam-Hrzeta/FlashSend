import { API_BASE_URL } from '@/constants/ApiConfig';
import { useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

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
    fetch(`${API_BASE_URL}/api/negocioyProductos/negocioyProductos/${negocioId}`)
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
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#b497ff" />
      </View>
    );
  }
  if (error || !negocio) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error || 'Error desconocido'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{negocio.nombre}</Text>
        <Text style={styles.category}>{negocio.categoria}</Text>
        <Text style={styles.description}>{negocio.descripcion}</Text>
        <View style={styles.infoBox}>
          <Text style={styles.info}>📞 Tel: {negocio.telefono || 'No disponible'}</Text>
          <Text style={styles.info}>📍 Dirección: {negocio.direccion || 'No disponible'}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5FF', // Lila clarito
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F5FF',
  },
  error: {
    color: '#b497ff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffffaa',
    margin: 20,
    borderRadius: 20,
    shadowColor: '#caaaff',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#d8c3ff',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#6c63ff',
    marginBottom: 4,
  },
  category: {
    fontSize: 16,
    color: '#a18cd1',
    fontWeight: '600',
    marginBottom: 6,
  },
  description: {
    fontSize: 15,
    color: '#5a5a5a',
    marginBottom: 12,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#efe7fd',
    padding: 12,
    borderRadius: 12,
    width: '100%',
    marginTop: 10,
  },
  info: {
    fontSize: 14,
    color: '#6b5b95',
    marginBottom: 6,
  },
});
