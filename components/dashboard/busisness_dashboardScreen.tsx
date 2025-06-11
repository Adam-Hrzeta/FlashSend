import { Picker } from '@react-native-picker/picker';
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
}

export default function Busisness_dashboardScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [businesses, setBusinesses] = useState<Negocio[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/dashboard_mostrar_negocios/dashboard_negocios`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && Array.isArray(data.negocios)) {
          setBusinesses(data.negocios);
          setFetchError(null);
        } else {
          setFetchError('No se pudo cargar la lista de negocios.');
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setFetchError('No se pudo cargar la lista de negocios.');
      });
  }, []);

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch =
      business.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
      (business.descripcion || '').toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = selectedCategory === '' || business.tipo_entrega === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderBusinessCard = ({ item }: { item: Negocio }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.93}>
      <View style={styles.cardHeader}>
        <Image
          source={{ uri: item.avatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
          style={styles.image}
        />
        <View style={[
          styles.categoryTag,
          { backgroundColor: categoryColors[item.tipo_entrega as keyof typeof categoryColors] || '#b5c6e0' }
        ]}>
          <Text style={styles.categoryText}>
            {categoryEmojis[item.tipo_entrega as keyof typeof categoryEmojis] || '🏷️'} {item.tipo_entrega?.charAt(0).toUpperCase() + item.tipo_entrega?.slice(1)}
          </Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.businessName}>{item.nombre}</Text>
        <Text style={styles.businessDescription} numberOfLines={2}>
          {item.descripcion}
        </Text>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.contactIcon}>📞</Text>
        <Text style={styles.contactText}>{item.telefono}</Text>
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Negocios Destacados</Text>
        <Text style={styles.headerSubtitle}>Descubre lo mejor de tu localidad</Text>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          placeholder="Buscar negocios..."
          placeholderTextColor="#b5c6e0"
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(value) => setSelectedCategory(value)}
          style={styles.categoryPicker}
          dropdownIconColor="#a18cd1"
        >
          <Picker.Item label="Todas las categorías 🏷️" value="" />
          <Picker.Item label="Tecnología 💻" value="tecnologia" />
          <Picker.Item label="Comida 🍔" value="comida" />
          <Picker.Item label="Ropa 🧥" value="ropa" />
          <Picker.Item label="Hogar 🏡" value="hogar" />
          <Picker.Item label="Salud 🩺" value="salud" />
        </Picker>
      </View>

      <FlatList
        data={filteredBusinesses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderBusinessCard}
        numColumns={2}
        contentContainerStyle={styles.businessList}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No se encontraron negocios.
          </Text>
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
  },
  businessList: {
    paddingBottom: 24,
    paddingHorizontal: 16,
    gap: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
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
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
    borderWidth: 3,
    borderColor: '#a18cd1',
    backgroundColor: '#fff',
  },
  categoryTag: {
    position: 'absolute',
    top: 8,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#a18cd1',
    shadowColor: '#a18cd1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardBody: {
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6c63ff',
    marginBottom: 4,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  businessDescription: {
    fontSize: 13,
    color: '#a18cd1',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  contactIcon: {
    marginRight: 6,
    fontSize: 18,
    color: '#a18cd1',
  },
  contactText: {
    fontSize: 13,
    color: '#6c63ff',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#a18cd1',
    fontSize: 16,
    marginTop: 40,
    fontWeight: '600',
  },
});