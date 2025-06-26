//FlashSend/components/dashboardClient/publicBusinessProfileScreen.tsx
import { API_BASE_URL } from '@/constants/ApiConfig';
import { MaterialIcons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  // Estado para el carrito
  const [carrito, setCarrito] = useState<Producto[]>([]);

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


  // Función para agregar producto al carrito
  const agregarAlCarrito = (producto: Producto) => {
    setCarrito(prev => [...prev, producto]);
  };

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
        <Text style={styles.productDescription}>{item.descripcion}</Text>
        <View style={styles.divider} />
        {item.categoria && (
          <View style={styles.infoRowResponsive}>
            <MaterialIcons name="category" size={18} color="#7E57C2" />
            <Text style={styles.infoTextResponsive}>{item.categoria}</Text>
          </View>
        )}
        <View style={styles.infoRowResponsive}>
          <MaterialIcons name="inventory" size={18} color="#7E57C2" />
          <Text style={styles.infoTextResponsive}>Stock: {item.stock}</Text>
        </View>
        <TouchableOpacity style={styles.addToCartButton} onPress={() => agregarAlCarrito(item)}>
          <MaterialIcons name="add-shopping-cart" size={20} color="#fff" />
          <Text style={styles.addToCartText}>Agregar a mi carrito</Text>
        </TouchableOpacity>
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
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Eliminar imagen superior */}
      {/* ----------Tarjeta principal horizontal */}
      <View style={styles.mainCardResponsiveHorizontal}>
        <View style={styles.avatarContainerResponsiveHorizontal}>
          <Image
            source={negocio.profile_image
              ? { uri: `data:image/jpeg;base64,${negocio.profile_image}` }
              : { uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }
            }
            style={styles.avatarResponsiveHorizontal}
          />
          <View style={styles.availabilityBadgeHorizontal}>
            <Text style={styles.availabilityText}>
              {negocio.disponibilidad ? 'Disponible' : 'No disponible'}
            </Text>
          </View>
          <View style={styles.categoryChipResponsiveHorizontal}>
            <Text style={styles.categoryTextResponsive}>{negocio.categoria}</Text>
          </View>
        </View>
        <View style={styles.infoSideHorizontal}>
          <Text style={styles.businessNameResponsive}>{negocio.nombre}</Text>
          <Text style={styles.descriptionResponsive}>{negocio.descripcion || 'Este negocio no tiene descripción.'}</Text>
          <View style={styles.infoRowResponsive}>
            <MaterialIcons name="phone" size={20} color="#7E57C2" />
            <Text style={styles.infoTextResponsive}>{negocio.telefono || 'No disponible'}</Text>
          </View>
          <View style={styles.infoRowResponsive}>
            <MaterialIcons name="location-on" size={20} color="#7E57C2" />
            <Text style={styles.infoTextResponsive}>{negocio.direccion || 'No disponible'}</Text>
          </View>
        </View>
      </View>
      {/*--------------------------Sección de productos */}
      <View style={styles.productsSection}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
          <Text style={[styles.sectionTitle, { textAlign: 'right', flex: 0 }]}>Productos</Text>
          <View style={{ width: 16 }} />
          <TouchableOpacity style={styles.viewCartButtonSmall} onPress={() => {/* Aquí puedes navegar o mostrar el carrito */}}>
            <MaterialIcons name="shopping-cart" size={20} color="#fff" />
            <Text style={styles.viewCartTextSmall}>Ver mi carrito ({carrito.length})</Text>
          </TouchableOpacity>
        </View>
        {productos.length === 0 ? (
          <Text style={styles.emptyText}>Este negocio aún no tiene productos disponibles.</Text>
        ) : (
          <FlatList
            data={productos}
            renderItem={renderProductItem}
            keyExtractor={item => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={screenWidth * 0.6 + 16} // Ajuste para que coincida con el ancho real de la tarjeta y margen
            decelerationRate="fast"
            contentContainerStyle={[styles.carouselContainer, { alignItems: 'flex-start', minHeight: undefined }]}
          />
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
  scrollContent: {
    paddingBottom: 32,
    alignItems: 'center',
    minHeight: '100%',
  },
  mainCardResponsiveHorizontal: {
    backgroundColor: '#fff',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    margin: 10,
    width: '96%',
    maxWidth: 520,
    elevation: 8,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 16,
  },
  avatarContainerResponsiveHorizontal: {
    backgroundColor: '#fff',
    borderRadius: 80,
    width: 120,
    height: 180,
    justifyContent: 'flex-start',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    marginRight: 18,
    paddingTop: 8,
    paddingBottom: 8,
  },
  avatarResponsiveHorizontal: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#E1BEE7',
    marginBottom: 8,
  },
  availabilityBadgeHorizontal: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 8,
    backgroundColor: '#4CAF50',
    alignSelf: 'center',
  },
  categoryChipResponsiveHorizontal: {
    backgroundColor: '#E1BEE7',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
    alignSelf: 'center',
  },
  infoSideHorizontal: {
    flex: 1,
    justifyContent: 'flex-start',
    gap: 2,
    minWidth: 0,
  },
  businessNameResponsive: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5E35B1',
    marginBottom: 6,
    textAlign: 'left',
    flexWrap: 'wrap',
    maxWidth: '90%',
  },
  availabilityBadge: {
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
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
  descriptionResponsive: {
    fontSize: 14,
    color: '#5a5a5a',
    marginBottom: 16,
    textAlign: 'left',
    lineHeight: 20,
    maxWidth: '95%',
  },
  infoContainerResponsive: {
    width: '100%',
    backgroundColor: '#F8F5FF',
    borderRadius: 14,
    padding: 12,
    marginTop: 6,
    alignItems: 'flex-start',
  },
  infoRowResponsive: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
    width: '100%',
  },
  infoTextResponsive: {
    fontSize: 14,
    color: '#5E35B1',
    marginLeft: 8,
    flex: 1,
    flexWrap: 'wrap',
    minWidth: 0,
  },
  productsSection: {
    paddingHorizontal: 0, // Elimino padding aquí
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
    paddingHorizontal: 16, // Aplico el padding aquí para separar las tarjetas de los bordes
    paddingBottom: 20,
  },
  productSlide: {
    width: screenWidth * 0.6,
    backgroundColor: '#F8F5FF',
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E1BEE7',
    alignItems: 'flex-start', // Alinear contenido arriba
  },
  productImage: {
    width: '100%',
    height: 130,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginBottom: 0,
  },
  productInfo: {
    padding: 10,
    justifyContent: 'flex-start',
    alignItems: 'flex-start', // Alinear info arriba
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5E35B1',
    marginBottom: 4,
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
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E1BEE7',
    marginVertical: 6,
    width: '100%',
    alignSelf: 'center',
  },
  addToCartButton: {
    backgroundColor: '#7E57C2',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  addToCartText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 8,
  },
  viewCartButton: {
    backgroundColor: '#5E35B1',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    elevation: 4,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  viewCartButtonSmall: {
    backgroundColor: '#5E35B1',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    elevation: 2,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  viewCartText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    marginLeft: 10,
  },
  viewCartTextSmall: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6,
  },
  categoryTextResponsive: {
    color: '#5E35B1',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    flexWrap: 'wrap',
    maxWidth: 90,
  },
});
