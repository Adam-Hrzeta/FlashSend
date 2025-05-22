import { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';

type Business = {
  id: string;
  display_name: string;
  phone: string;
  email: string;
  category: string;
  //image_url?: string | null;
};

export default function BusinessProfileScreen() {
  const { id } = useLocalSearchParams(); // id del negocio recibido como parámetro
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusiness();
  }, []);

  const fetchBusiness = async () => {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single();

    if (!error) {
      setBusiness(data);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#9C27B0" />
      </View>
    );
  }

  if (!business) {
    return (
      <View style={styles.center}>
        <Text>No se encontró el negocio.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* <Image
        source={
          business.image_url
            ? { uri: business.image_url }
            : require('@/assets/default_profile.png') // Ruta de imagen por defecto
        }
        style={styles.image}
      /> */}
      <Text style={styles.name}>{business.display_name}</Text>
      <Text style={styles.info}>📞 {business.phone}</Text>
      <Text style={styles.info}>📧 {business.email}</Text>
      <Text style={styles.info}>📂 Categoría: {business.category}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f3e5f5',
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    marginVertical: 5,
    textAlign: 'center',
  },
});
