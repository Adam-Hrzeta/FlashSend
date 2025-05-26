import { supabase } from '@/lib/supabase';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Business = {
  id: string;
  user_id: string;
  category: string;
  display_name: string;
  phone: string;
  description: string;
};

export default function DashboardScreen() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const fetchBusinesses = async () => {
      const { data, error } = await supabase.from('businesses').select('*');
      if (error) console.error('Error fetching businesses:', error);
      else setBusinesses(data as Business[]);
    };
    fetchBusinesses();
  }, []);

  const filteredBusinesses = businesses.filter((b) => {
    const matchesCategory = selectedCategory ? b.category === selectedCategory : true;
    const matchesSearch = b.display_name.toLowerCase().includes(searchText.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderBusinessCard = ({ item }: { item: Business }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.9}>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
            }}
            style={styles.image}
          />
          <View style={[styles.categoryTag, { backgroundColor: getCategoryColor(item.category) }]}>
            <Text style={styles.categoryText}>
              {getCategoryEmoji(item.category)} {item.category.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.businessName}>{item.display_name}</Text>
          <Text style={styles.businessDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.contactItem}>
            <Text style={styles.contactIcon}>📞</Text>
            <Text style={styles.contactText}>{item.phone}</Text>
          </View>

        </View>
      </View>
    </TouchableOpacity>
  );

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      tecnologia: '#4E6AFF',
      comida: '#FF6B4E',
      ropa: '#FF4E9E',
      hogar: '#6BFF4E',
      salud: '#9E4EFF',
    };
    return colors[category.toLowerCase()] || '#6C63FF';
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      tecnologia: '💻',
      comida: '🍔',
      ropa: '👕',
      hogar: '🏠',
      salud: '🩺',
    };
    return emojis[category.toLowerCase()] || '🏷️';
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Negocios Destacados</Text>
        <Text style={styles.headerSubtitle}>Descubre lo mejor de tu localidad</Text>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          placeholder="Buscar negocios..."
          placeholderTextColor="#8E8E93"
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
          dropdownIconColor="#6C63FF"
        >
          <Picker.Item label="Todas las categorías 🏷️" value="" />
          <Picker.Item label="Tecnología 💻" value="tecnologia" />
          <Picker.Item label="Comida 🍔" value="comida" />
          <Picker.Item label="Ropa 👕" value="ropa" />
          <Picker.Item label="Hogar 🏠" value="hogar" />
          <Picker.Item label="Salud 🩺" value="salud" />
        </Picker>
      </View>

      <FlatList
        data={filteredBusinesses}
        keyExtractor={(item) => item.id}
        renderItem={renderBusinessCard}
        numColumns={2}
        contentContainerStyle={styles.businessList}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth - 64) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F5F7FF',
  },
  headerContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3748',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6C63FF',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 20,
    shadowColor: '#4E6AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 12,
    fontSize: 20,
    color: '#6C63FF',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#2D3748',
  },
  pickerWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 0,
    shadowColor: '#4E6AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryPicker: {
    height: 56,
    minWidth: 200,  // Añadido para mejor usabilidad
    backgroundColor: '#FFFFFF',
    color: '#2D3748',
    borderRadius: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#00000010',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: 'center',
  },
  businessList: {
    paddingBottom: 24,
    gap: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  card: {
    width: cardWidth,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: cardWidth * 0.8,
    resizeMode: 'cover',
  },
  categoryTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  cardBody: {
    padding: 16,
    paddingBottom: 8,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8,
  },
  businessDescription: {
    fontSize: 13,
    color: '#718096',
    lineHeight: 18,
  },
  cardFooter: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  contactIcon: {
    marginRight: 8,
    fontSize: 16,
    color: '#6C63FF',
  },
  contactText: {
    fontSize: 12,
    color: '#4A5568',
    fontWeight: '500',
  },
});
