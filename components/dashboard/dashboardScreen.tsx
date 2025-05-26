import { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  StyleSheet,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '@/lib/supabase';

type Business = {
  id: string;
  user_id: string;
  category: string;
  display_name: string;
  phone: string;
  email: string;
  description: string;
};

export default function DashboardScreen() {
  const [businesses, setBusinesses] = useState<Business[]>([]);

  useEffect(() => {
    const fetchBusinesses = async () => {
      const { data, error } = await supabase.from('businesses').select('*');
      if (error) console.error('Error fetching businesses:', error);
      else setBusinesses(data as Business[]);
    };

    fetchBusinesses();
  }, []);

  const renderBusinessCard = ({ item }: { item: Business }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <Image
        source={{
          uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        }}
        style={styles.image}
      />
      <View style={styles.cardContent}>
        <Text style={styles.name}>{item.display_name}</Text>
        <Text style={styles.category}>
          Categoría: <Text style={styles.categoryText}>{item.category}</Text>
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.phone}>📞 {item.phone}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🌟 Negocios Destacados</Text>

      <TextInput placeholder="🔍 Buscar negocios..." style={styles.searchInput} />

      <View style={styles.pickerContainer}>
        <Picker>
          <Picker.Item label="Todas las categorías" value="" />
          <Picker.Item label="Comida" value="comida" />
          <Picker.Item label="Tecnología" value="tecnologia" />
          <Picker.Item label="Ropa" value="ropa" />
          <Picker.Item label="Hogar" value="hogar" />
          <Picker.Item label="Salud" value="salud" />
        </Picker>
      </View>

      <FlatList
        data={businesses}
        keyExtractor={(item) => item.id}
        renderItem={renderBusinessCard}
        numColumns={3}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
      />
    </View>
  );
}

const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth - 60) / 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#F3F4F6',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#1F2937',
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 14,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
  },
  grid: {
    paddingBottom: 20,
  },
  card: {
    width: cardWidth,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: cardWidth,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  categoryText: {
    color: '#4B5563',
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 6,
  },
  phone: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
  },
});
