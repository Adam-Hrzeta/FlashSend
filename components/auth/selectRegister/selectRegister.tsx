import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons'; 
import { useRouter } from 'expo-router';
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SelectRegister() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require('../../../assets/Gif/fondo1.gif')}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Botón de regreso */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push('/')}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <View style={styles.container}>
        <View style={styles.card}>
          <ThemedText type="title" style={styles.title}>
            Registro FlashSend
          </ThemedText>

          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={styles.typeButton}
              onPress={() => router.push('/auth/registerBusiness')}
            >
              <Text style={styles.typeButtonText}>Negocio</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.typeButton}
              onPress={() => router.push('/auth/registerClients')}
            >
              <Text style={styles.typeButtonText}>Cliente</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.typeButton}
              onPress={() => router.push('/')}
            >
              <Text style={styles.typeButtonText}>Repartidor</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.push('/')}
          >
            <Text style={styles.loginLinkText}>
              ¿Ya estás registrado?{' '}
              <Text style={styles.loginLinkBold}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 28,
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#CE93D8',
    textAlign: 'center',
    marginBottom: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: '#9575CD',
  },
  typeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
  },
  loginLinkText: {
    color: '#CE93D8',
    textAlign: 'center',
  },
  loginLinkBold: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    color: '#E1BEE7',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(149, 117, 205, 0.7)',
    borderRadius: 20,
    padding: 10,
    zIndex: 1,
  },
});