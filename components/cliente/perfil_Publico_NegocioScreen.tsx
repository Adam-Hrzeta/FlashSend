//FlashSend/components/dashboardClient/publicBusinessProfileScreen.tsx
import { useCarrito } from "@/components/context/CarritoContext";
import { API_BASE_URL } from '@/constants/ApiConfig';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
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

export default function Perfil_Publico_NegocioScreen({ negocioId: propNegocioId }: { negocioId?: any }) {
  const route = useRoute();
  // @ts-ignore
  const { negocioId: routeNegocioId } = route.params || {};
  const negocioId = propNegocioId || routeNegocioId;
  const navigation = useNavigation<any>();
  const [negocio, setNegocio] = useState<NegocioPublico | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { agregarProducto, productos: productosCarrito } = useCarrito();
  // Estado para el carrito
  const [carrito, setCarrito] = useState<Producto[]>([]);

  // Refrescar datos al enfocar la pantalla
  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      setError(null);
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
    }, [negocioId])
  );

  // -------------------------------------- Obtener datos del negocio
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
  // -------------------------------------- Obtener datos del negocio



  //---------------------------------------- Obtener productos del negocio
  useEffect(() => {
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
    agregarProducto({
      ...producto,
      negocio_id: negocio?.id, // <-- Asegura que el producto lleva el negocio_id
      precio: typeof producto.precio === 'string' ? parseFloat(producto.precio) : producto.precio,
      cantidad: 1,
      imagen_url: producto.imagen_url ? (producto.imagen_url.startsWith('http') ? producto.imagen_url : `${API_BASE_URL}${producto.imagen_url}`) : undefined
    });
    if (Platform.OS === 'android') {
      ToastAndroid.show('Producto agregado al carrito', ToastAndroid.SHORT);
    }
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
      {/* Botón de regresar */}
      <View style={{ width: '100%', alignItems: 'flex-start' }}>
        <TouchableOpacity
          onPress={() => router.push('/cliente/negocios_Dashboard')}
          style={styles.backButtonRow}
          activeOpacity={0.85}
          accessibilityLabel="Regresar"
          accessible
        >
          <MaterialIcons name="arrow-back" size={24} color="#7E57C2" />
          <Text style={styles.backButtonText}>Regresar</Text>
        </TouchableOpacity>
      </View>
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
          <View style={[styles.availabilityBadgeHorizontal, { backgroundColor: negocio.disponibilidad ? '#4CAF50' : '#F44336' }]}>
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
          <TouchableOpacity style={styles.viewCartButtonSmall} onPress={() => navigation.navigate('hidden/componentes_Perfil_Cliente/carrito_Compras')}>
            <MaterialIcons name="shopping-cart" size={20} color="#fff" />
            <Text style={styles.viewCartTextSmall}>Ver mi carrito ({productosCarrito.reduce((acc, p) => acc + p.cantidad, 0)})</Text>
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
  backButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE7F6',
    borderRadius: 18,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: 14,
    marginLeft: 12,
    marginBottom: 6,
    elevation: 1,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  backButtonText: {
    color: '#7E57C2',
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 6,
    letterSpacing: 0.2,
  },
});
