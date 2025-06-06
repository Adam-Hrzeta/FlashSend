import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ImageBackground, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function SelectRegister() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require('../../../assets/images/fondoLogin.jpg')}
      style={styles.background}
      resizeMode="cover"
      blurRadius={2}
    >
      <View style={styles.container}>
        <View style={styles.card}>
          <ThemedText type="title" style={styles.title}>
            Registro FlashSend
          </ThemedText>

          <View style={styles.typeSelector}>
            {/* Botón Negocio - Color morado */}
            <TouchableOpacity
              style={[styles.typeButton, styles.businessButton]}
              onPress={() => router.push('/auth/registerBusiness')}
              activeOpacity={0.8}
            >
              <MaterialIcons name="store" size={24} color="white" />
              <ThemedText style={styles.typeButtonText}>Negocio</ThemedText>
            </TouchableOpacity>

            {/* Botón Cliente - Color azul */}
            <TouchableOpacity
              style={[styles.typeButton, styles.clientButton]}
              onPress={() => router.push('/auth/registerClient')}
              activeOpacity={0.8}
            >
              <MaterialIcons name="person" size={24} color="white" />
              <ThemedText style={styles.typeButtonText}>Cliente</ThemedText>
            </TouchableOpacity>

            {/* Botón Repartidor - Color verde */}
            <TouchableOpacity
              style={[styles.typeButton, styles.dealerButton]}
              onPress={() => router.push('/auth/registerDealer' as any)}
              activeOpacity={0.8}
            >
              <MaterialIcons name="delivery-dining" size={24} color="white" />
              <ThemedText style={styles.typeButtonText}>Repartidor</ThemedText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.push('/auth/login')}
            activeOpacity={0.6}
          >
            <ThemedText style={styles.loginLinkText}>
              ¿Ya estás registrado?{' '}
              <ThemedText style={styles.loginLinkBold}>Inicia sesión</ThemedText>
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: 'rgba(126, 87, 194, 0.8)',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(126, 87, 194, 0.2)',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  typeSelector: {
    gap: 16,
    marginBottom: 24,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  businessButton: {
    backgroundColor: '#FF1493',
  },
  clientButton: {
    backgroundColor: '#4285F4',
  },
  dealerButton: {
    backgroundColor: '#34A853',
  },
  typeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  loginLink: {
    marginTop: 16,
  },
  loginLinkText: {
    textAlign: 'center',
    fontSize: 14,
    color: 'white',
  },
  loginLinkBold: {
    fontWeight: '600',
    color: '#E1BEE7',
    textDecorationLine: 'underline',
  },
});