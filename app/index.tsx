import { ThemedText } from '@/components/ThemedText';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  // Acción para "Hacer mi primer pedido"
  const handleFirstOrder = () => {
    router.push('/cliente/negocios_Dashboard');
  };

  // Acción para registrar negocio
  const handleRegisterBusiness = () => {
    router.push('/auth/registro_Negocio');
  };

  return (
    <View style={styles.container}>
      {/* Menú superior */}
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => router.push('/auth/login')}
          accessibilityLabel="Iniciar sesión"
          accessible
        >
          <ThemedText style={styles.menuText}>Iniciar sesión</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.menuButton, styles.registerButton]}
          onPress={() => router.push('/auth/seleccionar_Registro')}
          accessibilityLabel="Registrarme"
          accessible
        >
          <ThemedText style={[styles.menuText, styles.registerText]}>Registrarme</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Encabezado animado */}
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
        {/* Pasos */}
        <View style={styles.stepsRow}>
          <StepCard
            icon={<MaterialIcons name="search" size={24} color="#7B1FA2" />}
            title="Paso 1"
            text="Explora restaurantes y tiendas cerca de ti"
          />
          <StepCard
            icon={<MaterialIcons name="shopping-cart" size={24} color="#7B1FA2" />}
            title="Paso 2"
            text="Ordena tus productos favoritos"
          />
          <StepCard
            icon={<MaterialIcons name="delivery-dining" size={24} color="#7B1FA2" />}
            title="Paso 3"
            text="Recibe tu pedido en minutos"
          />
        </View>

        {/* Botón principal */}
        <TouchableOpacity
          style={styles.orderButton}
          onPress={handleFirstOrder}
          accessibilityLabel="Hacer mi primer pedido"
          accessible
        >
          <ThemedText style={styles.buttonText}>Hacer mi primer pedido</ThemedText>
          <MaterialIcons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>

        {/* Beneficios */}
        <View style={styles.benefitsContainer}>
          <ThemedText type="title" style={styles.benefitsTitle}>¿Por qué elegir FlashSend?</ThemedText>
          <BenefitItem icon={<FontAwesome5 name="bolt" size={20} color="#7B1FA2" />} text="Entregas ultrarrápidas en tu zona" />
          <BenefitItem icon={<FontAwesome5 name="map-marked-alt" size={20} color="#7B1FA2" />} text="Cobertura local y en expansión" />
          <BenefitItem icon={<FontAwesome5 name="smile" size={20} color="#7B1FA2" />} text="Atención rápida y confiable" />
          <BenefitItem icon={<FontAwesome5 name="clock" size={20} color="#7B1FA2" />} text="Disponible cuando lo necesites" />
        </View>

        {/* ¿Qué puedes ordenar? */}
        <View style={styles.sectionContainer}>
          <ThemedText type="title" style={styles.sectionTitle}>¿Qué puedes ordenar?</ThemedText>
          <SectionRow
            image={require('../assets/Gif/comida.gif')}
            text="Disfruta de tus platos favoritos desde la comodidad de tu casa. Hamburguesas, sushi, pizza, arepas ¡y mucho más!"
          />
          <SectionRow
            image={require('../assets/Gif/regalos.gif')}
            text="¿Un cumpleaños sorpresa? Envía regalos, flores o detalles únicos a quienes más quieres, estés donde estés."
            reverse
          />
          <SectionRow
            image={require('../assets/Gif/farma.gif')}
            text="También puedes pedir productos farmacéuticos, artículos de cuidado personal o primeros auxilios, sin salir de casa."
          />
          <SectionRow
            image={require('../assets/Gif/tienda.gif')}
            text="Ordena frutas frescas, verduras, productos para el hogar y todo lo que necesites de tu tienda o abasto más cercano."
            reverse
          />
        </View>

        {/* Negocios */}
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
          <TouchableOpacity
            style={[styles.orderButton, styles.businessButton]}
            onPress={handleRegisterBusiness}
            accessibilityLabel="Registrar mi negocio"
            accessible
          >
            <ThemedText style={styles.buttonText}>Registrar mi negocio</ThemedText>
            <MaterialIcons name="store" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// Componente para los pasos
function StepCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <View style={styles.stepCard}>
      {icon}
      <ThemedText style={styles.stepCardTitle}>{title}</ThemedText>
      <ThemedText style={styles.stepCardText}>{text}</ThemedText>
    </View>
  );
}

// Componente para los beneficios
function BenefitItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View style={styles.benefitItem}>
      {icon}
      <ThemedText style={styles.benefitText}>{text}</ThemedText>
    </View>
  );
}

// Componente para las secciones de "¿Qué puedes ordenar?"
function SectionRow({ image, text, reverse }: { image: any; text: string; reverse?: boolean }) {
  return (
    <View style={reverse ? styles.sectionRowReverse : styles.sectionRow}>
      <Image source={image} style={styles.sectionImage} contentFit="cover" />
      <View style={styles.sectionTextContainer}>
        <ThemedText style={styles.sectionText}>{text}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: 50, // Espacio para el menú superior
  },
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EDE7F6',
  },
  menuButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 1,
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