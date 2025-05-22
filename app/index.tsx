import { ThemedText } from '@/components/ThemedText';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuButton} onPress={() => {router.push('/auth/login')}}>
          <ThemedText style={styles.menuText}>Iniciar sesión</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuButton, styles.registerButton]} onPress={() => {router.push('/auth/select')}}>
          <ThemedText style={[styles.menuText, styles.registerText]}>Registrarme</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.headerContainer}>
        <Image
          source={require('../assets/Gif/fondo2.gif')}
          style={styles.animatedGif}
          contentFit="cover"
        />
        <View style={styles.overlay}>
          <ThemedText type="title" style={styles.welcomeTitle}>¡Bienvenido a FlashSend!</ThemedText>
          <ThemedText style={styles.subtitle}>Tu delivery rápido como un flash ⚡</ThemedText>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.stepsRow}>
          <View style={styles.stepCard}>
            <MaterialIcons name="search" size={24} color="#7B1FA2" />
            <ThemedText style={styles.stepCardTitle}>Paso 1</ThemedText>
            <ThemedText style={styles.stepCardText}>Explora restaurantes y tiendas cerca de ti</ThemedText>
          </View>
          <View style={styles.stepCard}>
            <MaterialIcons name="shopping-cart" size={24} color="#7B1FA2" />
            <ThemedText style={styles.stepCardTitle}>Paso 2</ThemedText>
            <ThemedText style={styles.stepCardText}>Ordena tus productos favoritos</ThemedText>
          </View>
          <View style={styles.stepCard}>
            <MaterialIcons name="delivery-dining" size={24} color="#7B1FA2" />
            <ThemedText style={styles.stepCardTitle}>Paso 3</ThemedText>
            <ThemedText style={styles.stepCardText}>Recibe tu pedido en minutos</ThemedText>
          </View>
        </View>

        <TouchableOpacity style={styles.orderButton}>
          <ThemedText style={styles.buttonText}>Hacer mi primer pedido</ThemedText>
          <MaterialIcons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>

        <View style={styles.benefitsContainer}>
          <ThemedText type="title" style={styles.benefitsTitle}>¿Por qué elegir FlashSend?</ThemedText>
          <View style={styles.benefitItem}>
            <FontAwesome5 name="bolt" size={20} color="#7B1FA2" />
            <ThemedText style={styles.benefitText}>Entregas ultrarrápidas en tu zona</ThemedText>
          </View>
          <View style={styles.benefitItem}>
            <FontAwesome5 name="map-marked-alt" size={20} color="#7B1FA2" />
            <ThemedText style={styles.benefitText}>Cobertura local y en expansión</ThemedText>
          </View>
          <View style={styles.benefitItem}>
            <FontAwesome5 name="smile" size={20} color="#7B1FA2" />
            <ThemedText style={styles.benefitText}>Atención rápida y confiable</ThemedText>
          </View>
          <View style={styles.benefitItem}>
            <FontAwesome5 name="clock" size={20} color="#7B1FA2" />
            <ThemedText style={styles.benefitText}>Disponible cuando lo necesites</ThemedText>
          </View>
        </View>
        {/* Sección: ¿Qué puedes ordenar? */}
        <View style={styles.sectionContainer}>
          <ThemedText type="title" style={styles.sectionTitle}>¿Qué puedes ordenar?</ThemedText>

          {/* Comida */}
          <View style={styles.sectionRow}>
            <Image
              source={require('../assets/Gif/comida.gif')}
              style={styles.sectionImage}
              contentFit="cover"
            />
            <View style={styles.sectionTextContainer}>
              <ThemedText style={styles.sectionText}>
                Disfruta de tus platos favoritos desde la comodidad de tu casa. Hamburguesas, sushi, pizza, arepas ¡y mucho más!
              </ThemedText>
            </View>
          </View>

          {/* Regalos */}
          <View style={styles.sectionRowReverse}>
            <View style={styles.sectionTextContainer}>
              <ThemedText style={styles.sectionText}>
                ¿Un cumpleaños sorpresa? Envía regalos, flores o detalles únicos a quienes más quieres, estés donde estés.
              </ThemedText>
            </View>
            <Image
              source={require('../assets/Gif/regalos.gif')}
              style={styles.sectionImage}
              contentFit="cover"
            />
          </View>

          {/* Farmacéuticos */}
          <View style={styles.sectionRow}>
            <Image
              source={require('../assets/Gif/farma.gif')}
              style={styles.sectionImage}
              contentFit="cover"
            />
            <View style={styles.sectionTextContainer}>
              <ThemedText style={styles.sectionText}>
                También puedes pedir productos farmacéuticos, artículos de cuidado personal o primeros auxilios, sin salir de casa.
              </ThemedText>
            </View>
          </View>

          {/* NUEVA SECCIÓN: Tienda, verdulería, productos del hogar */}
          <View style={styles.sectionRowReverse}>
            <View style={styles.sectionTextContainer}>
              <ThemedText style={styles.sectionText}>
                Ordena frutas frescas, verduras, productos para el hogar y todo lo que necesites de tu tienda o abasto más cercano.
              </ThemedText>
            </View>
            <Image
              source={require('../assets/Gif/tienda.gif')}
              style={styles.sectionImage}
              contentFit="cover"
            />
          </View>
        </View>


        <View style={styles.businessContainer}>
          <View style={styles.businessContent}>
            <View style={styles.businessTextContainer}>
              <ThemedText type="title" style={styles.businessTitle}>¿Tienes un negocio?</ThemedText>
              <ThemedText style={styles.businessSubtitle}>Únete a FlashSend y llega a más clientes con nuestro servicio de delivery rápido</ThemedText>
            </View>
            <Image
              source={require('../assets/Gif/fondo1.gif')}
              style={styles.businessImage}
              contentFit="contain"
            />
          </View>

          <TouchableOpacity style={[styles.orderButton, styles.businessButton]}>
            <ThemedText style={styles.buttonText}>Registrar mi negocio</ThemedText>
            <MaterialIcons name="store" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    paddingTop: 40,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EDE7F6',
  },
  menuButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  registerButton: {
    backgroundColor: '#7E57C2',
  },
  menuText: {
    color: '#7E57C2',
    fontWeight: '500',
  },
  registerText: {
    color: 'white',
  },
  headerContainer: {
    height: 250,
    width: '100%',
    position: 'relative',
  },
  animatedGif: {
    height: '100%',
    width: '100%',
    position: 'absolute',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(126, 87, 194, 0.7)',
    padding: 20,
    paddingBottom: 30,
  },
  welcomeTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  stepCard: {
    width: '30%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#7B1FA2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepCardTitle: {
    color: '#7B1FA2',
    fontWeight: 'bold',
    marginVertical: 8,
    fontSize: 16,
  },
  stepCardText: {
    color: '#4A148C',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  orderButton: {
    backgroundColor: '#9C27B0',
    padding: 16,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    shadowColor: '#7B1FA2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  businessContainer: {
    marginTop: 40,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#7B1FA2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  businessContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  businessTextContainer: {
    flex: 1,
    paddingRight: 15,
  },
  businessTitle: {
    color: '#7B1FA2',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  businessSubtitle: {
    color: '#4A148C',
    fontSize: 14,
    lineHeight: 20,
  },
  businessImage: {
    width: 100,
    height: 100,
  },
  businessButton: {
    backgroundColor: '#673AB7',
    marginTop: 0,
  },
  benefitsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginTop: 30,
    shadowColor: '#7B1FA2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7B1FA2',
    marginBottom: 15,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 15,
    color: '#4A148C',
    fontWeight: '500',
  },
  sectionContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginTop: 30,
    shadowColor: '#7B1FA2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7B1FA2',
    marginBottom: 15,
    textAlign: 'center',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  sectionRowReverse: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  sectionImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  sectionTextContainer: {
    flex: 1,
  },
  sectionText: {
    fontSize: 14,
    color: '#4A148C',
    lineHeight: 20,
  },

});