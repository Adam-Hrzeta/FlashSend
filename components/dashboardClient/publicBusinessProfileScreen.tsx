//FlashSend/components/dashboardClient/publicBusinessProfileScreen.tsx
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
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

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
  avatar?: string;
  profile_image?: string; 
}

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number | string;
  categoria?: string;
  stock: number;
  fecha_creacion: string;
  imagen_url?: string;
}

const { width: screenWidth } = Dimensions.get('window');

export default function PublicBusinessProfileScreen() {
  const route = useRoute();
  // @ts-ignore
  const { negocioId } = route.params || {};
  const [negocio, setNegocio] = useState<NegocioPublico | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // -------------------------------------- Obtener datos del negocio
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
    // -------------------------------------- Obtener datos del negocio



    //---------------------------------------- Obtener productos del negocio
    fetch(`${API_BASE_URL}/api/negocioyProductos/negocioyProductos/${negocioId}/productos`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          const productosNormalizados = data.productos.map((producto: any) => ({
            ...producto,
            precio: producto.precio ? parseFloat(producto.precio) : 0,
          }));
          setProductos(productosNormalizados);
        }
      })
      .catch(() => {
        console.log('Error al obtener los productos del negocio.');
      });
  }, [negocioId]);
  // -------------------------------------- Obtener productos del negocio



  // -----------------Componente para formatear el precio
  const ProductPrice = ({ precio }: { precio: number | string }) => {
    const priceNumber = typeof precio === 'string' ? parseFloat(precio) : precio;
    const formattedPrice = !isNaN(priceNumber) ? priceNumber.toFixed(2) : '0.00';
    return <Text style={styles.productPrice}>${formattedPrice}</Text>;
  };
  // -----------------Componente para formatear el precio


  // -------------------------------------Render de cada producto
  const renderProductItem = ({ item }: { item: Producto }) => (
    <View style={styles.productSlide}>
      {item.imagen_url && (
        <Image
          source={{ uri: `${API_BASE_URL}${item.imagen_url}` }}
          style={styles.productImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.nombre}</Text>
        <ProductPrice precio={item.precio} />
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.descripcion}
        </Text>
      </View>
    </View>
  );
  // -------------------------------------Render de cada producto

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7E57C2" />
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

      
      {/*  Imagen convertida usando profile_image */}
      {negocio.profile_image && (
  <Image
    source={{
      uri: `data:image/jpeg;base64,${negocio.profile_image}`
            }}
        />
      )}


      {/* ----------Tarjeta principal */}
      <View style={styles.mainCard}>
        {/* -----------Imagen de perfil redonda superpuesta */}
        <View style={styles.avatarContainer}>
          <Image



          //---------------------------------------------tranformar la imagen.
            source={negocio.profile_image
      ? { uri: `data:image/jpeg;base64,${negocio.profile_image}` } //  cambio real
      : { uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }
            }
            //----------------------------------------------tranformar la imagen.



        style={styles.avatar}
          />
        </View>

        <Text style={styles.businessName}>{negocio.nombre}</Text>
        <Text style={styles.businessName}>{negocio.categoria}</Text>

        <View style={styles.categoryChip}>
          <Text style={styles.categoryText}>{negocio.categoria}</Text>
        </View>

        <View style={[
          styles.availabilityBadge,
          negocio.disponibilidad ? styles.available : styles.notAvailable
        ]}>
          <Text style={styles.availabilityText}>
            {negocio.disponibilidad ? 'Disponible' : 'No disponible'}
          </Text>
        </View>

        <Text style={styles.description}>{negocio.descripcion || 'Este negocio no tiene descripción.'}</Text>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <MaterialIcons name="phone" size={20} color="#7E57C2" />
            <Text style={styles.infoText}>{negocio.telefono || 'No disponible'}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="email" size={20} color="#7E57C2" />
            <Text style={styles.infoText}>{negocio.correo || 'No disponible'}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="location-on" size={20} color="#7E57C2" />
            <Text style={styles.infoText}>{negocio.direccion || 'No disponible'}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="delivery-dining" size={20} color="#7E57C2" />
            <Text style={styles.infoText}>{negocio.tipo_entrega || 'No especificado'}</Text>
          </View>
        </View>
      </View>

      {/*--------------------------Sección de productos */}
      <View style={styles.productsSection}>
        <Text style={styles.sectionTitle}>Productos</Text>

        {productos.length === 0 ? (
          <Text style={styles.emptyText}>Este negocio aún no tiene productos disponibles.</Text>
        ) : (
          <>
            <FlatList
              data={productos}
              renderItem={renderProductItem}
              keyExtractor={item => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={screenWidth * 0.8 + 20}
              decelerationRate="fast"
              contentContainerStyle={styles.carouselContainer}
            />
            <TouchableOpacity
              style={styles.orderButton}
              onPress={() => console.log('Realizar pedido')}
            >
              <MaterialIcons name="shopping-cart" size={24} color="#fff" />
              <Text style={styles.orderButtonText}>Realizar pedido</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3EFFF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3EFFF',
  },
  error: {
    color: '#7E57C2',
    fontSize: 16,
    fontWeight: '600',
  },
  bannerImage: {
    width: '100%',
    height: 180,
  },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingTop: 100,
    paddingBottom: 32,
    paddingHorizontal: 24,
    margin: 16,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 16,
  },
  avatarContainer: {
    position: 'absolute',
    top: -80,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 90,
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 18,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#E1BEE7',
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5E35B1',
    marginBottom: 8,
    textAlign: 'center',
  },
  categoryChip: {
    backgroundColor: '#E1BEE7',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 12,
  },
  categoryText: {
    color: '#7E57C2',
    fontWeight: 'bold',
    fontSize: 14,
  },
  availabilityBadge: {
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginBottom: 16,
    alignSelf: 'center',
  },
  available: {
    backgroundColor: '#4CAF50',
  },
  notAvailable: {
    backgroundColor: '#F44336',
  },
  availabilityText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  description: {
    fontSize: 15,
    color: '#5a5a5a',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#F8F5FF',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#5E35B1',
    marginLeft: 12,
    flex: 1,
  },
  productsSection: {
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#5E35B1',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
    marginTop: 20,
  },
  carouselContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  productSlide: {
    width: screenWidth * 0.8,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  productImage: {
    width: '100%',
    height: 180,
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5E35B1',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7E57C2',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  orderButton: {
    backgroundColor: '#7E57C2',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    elevation: 4,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  orderButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },
});
