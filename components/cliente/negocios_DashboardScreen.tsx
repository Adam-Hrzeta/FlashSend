import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../constants/ApiConfig';

const categoryEmojis = {
  tecnologia: '💻',
  comida: '🍔',
  ropa: '🧥',
  hogar: '🏡',
  salud: '🩺',
} as const;

const categoryColors = {
  tecnologia: '#a18cd1',
  comida: '#b9a6e9',
  ropa: '#6c63ff',
  hogar: '#8f8ce7',
  salud: '#7c6ee6',
} as const;

interface Negocio {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo_entrega: string;
  avatar?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  disponibilidad?: boolean;
  categoria?: string;
}

export default function Negocios_DashboardScreen({ setNotAuth }: { setNotAuth?: (v: boolean) => void }) {
  const navigation = useNavigation<any>();
  const [searchText, setSearchText] = useState('');
  const [businesses, setBusinesses] = useState<Negocio[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Refrescar negocios al enfocar la pantalla
  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      const fetchNegocios = async () => {
        try {
          const token = await AsyncStorage.getItem('access_token');
          const res = await fetch(`${API_BASE_URL}/api/dashboard_mostrar_negocios/dashboard_negocios`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.status === 403) {
            setNotAuth && setNotAuth(true);
            setLoading(false);
            return;
          }
          const data = await res.json();
          if (data.status === 'success' && Array.isArray(data.negocios)) {
            setBusinesses(data.negocios);
          } else {
            setBusinesses([]);
          }
        } catch {
          setBusinesses([]);
        } finally {
          setLoading(false);
        }
      };
      fetchNegocios();
    }, [])
  );

  useEffect(() => {
    const fetchNegocios = async () => {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        setNotAuth && setNotAuth(true);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/dashboard_mostrar_negocios/dashboard_negocios`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 403) {
          setNotAuth && setNotAuth(true);
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (data.status === 'success' && Array.isArray(data.negocios)) {
          setBusinesses(data.negocios);
          setFetchError(null);
        } else {
          setFetchError('No se pudo cargar la lista de negocios.');
        }
        setLoading(false);
      } catch {
        setLoading(false);
        setFetchError('No se pudo cargar la lista de negocios.');
      }
    };
    fetchNegocios();
  }, []);

  // Unificar búsqueda: texto y categoría
  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch =
      business.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
      (business.descripcion || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (business.categoria || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (business.tipo_entrega || '').toLowerCase().includes(searchText.toLowerCase());
    return matchesSearch;
  });

  const renderBusinessCard = ({ item }: { item: Negocio }) => (
    <TouchableOpacity style={styles.horizontalCard} activeOpacity={0.93}
      onPress={() => {
        navigation.navigate('hidden/componentes_Perfil_Cliente/perfil_Publico_Negocio', { negocioId: item.id });
      }}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.avatar ? `${API_BASE_URL}${item.avatar}` : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
          style={styles.horizontalImageFull}
        />
        <Text style={[styles.disponibleTag, { backgroundColor: item.disponibilidad ? '#4CAF50' : '#F44336' }]}>{item.disponibilidad ? 'Disponible' : 'No disponible'}</Text>
      </View>
      <View style={styles.horizontalInfoLeftBetter}>
        <Text style={styles.businessNameBig}>{item.nombre}</Text>
        <View style={styles.categoryTagCardBetter}>
          <MaterialIcons name="local-offer" size={16} color="#7E57C2" style={{ marginRight: 4 }} />
          <Text style={styles.categoryTextCardBetter}>{item.categoria || 'Sin categoría'}</Text>
        </View>
        <Text style={styles.businessDescriptionBetter} numberOfLines={2}>{item.descripcion}</Text>
        <View style={styles.infoRowBetter}>
          <MaterialIcons name="place" size={16} color="#7c6ee6" style={{ marginRight: 4 }} />
          <Text style={styles.infoTextBetter}>{item.direccion}</Text>
        </View>
        <View style={styles.infoRowBetter}>
          <MaterialIcons name="phone" size={16} color="#7c6ee6" style={{ marginRight: 4 }} />
          <Text style={styles.infoTextBetter}>{item.telefono}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#a18cd1" />
      </View>
    );
  }

  if (fetchError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#a18cd1', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>{fetchError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.screenBg}>
      <View style={styles.headerModern}>
        <Text style={styles.headerTitleModern}>🌟 Negocios Destacados</Text>
        <Text style={styles.headerSubtitleModern}>Descubre lo mejor de tu localidad</Text>
      </View>

      <View style={styles.searchContainerModern}>
        <Text style={styles.searchIconModern}>🔍</Text>
        <TextInput
          placeholder="Buscar negocios, categorías, servicios..."
          placeholderTextColor="#b5c6e0"
          style={styles.searchInputModern}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <FlatList
        data={filteredBusinesses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderBusinessCard}
        contentContainerStyle={styles.businessListModern}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyModernBox}>
            <Text style={styles.emptyModernIcon}>😕</Text>
            <Text style={styles.emptyModernText}>No se encontraron negocios.</Text>
          </View>
        }
      />
    </View>
  );
}

const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth - 64) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f2fb',
  },
  header: {
    backgroundColor: '#a18cd1',
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 6,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e0d7f3',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    marginHorizontal: 24,
    marginBottom: 16,
    shadowColor: '#a18cd1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
    fontSize: 20,
    color: '#a18cd1',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#6c63ff',
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 24,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 0,
    shadowColor: '#a18cd1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 1,
  },
  categoryPicker: {
    height: 48,
    minWidth: 200,
    backgroundColor: '#fff',
    color: '#6c63ff',
    borderRadius: 8,
    paddingHorizontal: 16,
    borderWidth: 0,
    justifyContent: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  businessList: {
    paddingBottom: 24,
    paddingHorizontal: 16,
    gap: 16,
  },
  card: {
    width: cardWidth,
    borderRadius: 24,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#a18cd1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    paddingBottom: 12,
    paddingTop: 18,
  },
  imageContainer: {
    position: 'relative',
    flex: 1.1,
    minWidth: 0,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f5ff',
  },
  horizontalImageFull: {
    width: '100%',
    aspectRatio: 1,
    height: undefined,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    resizeMode: 'cover',
    borderRightWidth: 2,
    borderRightColor: '#E1BEE7',
    flex: 1,
    minWidth: 0,
  },
  disponibleTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 2,
    overflow: 'hidden',
    minWidth: 90,
    textAlign: 'center',
    elevation: 4,
    letterSpacing: 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  horizontalCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#fff',
    borderRadius: 24,
    marginBottom: 20,
    marginHorizontal: 8,
    padding: 0,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
    minHeight: 150,
    borderWidth: 1.5,
    borderColor: '#E1BEE7',
    flex: 1,
    minWidth: 0,
  },
  horizontalInfoLeftBetter: {
    flex: 1.5,
    justifyContent: 'flex-start',
    padding: 14,
    gap: 4,
    backgroundColor: '#fff',
    minWidth: 0,
    flexShrink: 1,
    flexGrow: 1,
  },
  businessNameBig: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5E35B1',
    marginBottom: 2,
    letterSpacing: 0.7,
    textAlign: 'left',
    textShadowColor: '#E1BEE7',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  categoryTagCardBetter: {
    backgroundColor: '#E1BEE7',
    borderRadius: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 6,
    marginTop: 2,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    maxWidth: '90%',
  },
  categoryTextCardBetter: {
    color: '#7E57C2',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  businessDescriptionBetter: {
    fontSize: 15,
    color: '#7E57C2',
    lineHeight: 20,
    textAlign: 'left',
    marginBottom: 4,
    fontWeight: '500',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  infoTextBetter: {
    fontSize: 13,
    color: '#7c6ee6',
    marginTop: 1,
    textAlign: 'left',
    fontWeight: '500',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  infoRowBetter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    gap: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#a18cd1',
    fontSize: 16,
    marginTop: 40,
    fontWeight: '600',
  },
  screenBg: {
    flex: 1,
    backgroundColor: '#f3e7e9',
  },
  headerModern: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 38,
    paddingBottom: 28,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    marginBottom: 18,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 6,
  },
  headerTitleModern: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#5E35B1',
    marginBottom: 4,
    letterSpacing: 1.2,
    textShadowColor: '#E1BEE7',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitleModern: {
    fontSize: 16,
    color: '#7E57C2',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  searchContainerModern: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 18,
    height: 56,
    marginHorizontal: 28,
    marginBottom: 22,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIconModern: {
    marginRight: 12,
    fontSize: 22,
    color: '#7E57C2',
  },
  searchInputModern: {
    flex: 1,
    height: '100%',
    fontSize: 17,
    color: '#5E35B1',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  businessListModern: {
    paddingBottom: 32,
    paddingHorizontal: 8,
    gap: 18,
  },
  emptyModernBox: {
    alignItems: 'center',
    marginTop: 60,
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 18,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyModernIcon: {
    fontSize: 38,
    marginBottom: 8,
  },
  emptyModernText: {
    color: '#7E57C2',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
});