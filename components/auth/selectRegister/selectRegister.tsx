import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SelectRegister() {
  const router = useRouter();

  // Animaciones
  const cardAnim = useRef(new Animated.Value(0)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.spring(cardAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 7,
        tension: 60,
      }),
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
        easing: Easing.elastic(1.2),
      }),
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
        easing: Easing.elastic(1.2),
      }),
      Animated.timing(buttonsAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),
    ]).start();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <LinearGradient
        colors={[
          '#F06292',
          '#BA68C8',
          '#9575CD',
          '#7E57C2',
          '#F06292',
        ]}
        style={styles.gradient}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.container}>
          <Animated.View
            style={[
              styles.card,
              {
                opacity: cardAnim,
                transform: [
                  {
                    translateY: cardAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [80, 0],
                    }),
                  },
                  {
                    scale: cardAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.logoCircle,
                {
                  transform: [
                    {
                      scale: logoAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.7, 1.1],
                      }),
                    },
                    {
                      rotate: logoAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['-20deg', '0deg'],
                      }),
                    },
                  ],
                  shadowOpacity: logoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.1, 0.35],
                  }),
                },
              ]}
            >
              <MaterialIcons name="flash-on" size={44} color="#FFFDE7" />
            </Animated.View>
            <Animated.View
              style={{
                opacity: titleAnim,
                transform: [
                  {
                    scale: titleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.7, 1.1],
                    }),
                  },
                  {
                    rotate: titleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['-10deg', '0deg'],
                    }),
                  },
                ],
              }}
            >
              <ThemedText type="title" style={styles.title}>
                Registro FlashSend
              </ThemedText>
            </Animated.View>

            <Animated.View
              style={[
                styles.typeSelector,
                {
                  opacity: buttonsAnim,
                  transform: [
                    {
                      translateY: buttonsAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [40, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={[styles.typeButton, styles.businessButton]}
                onPress={() => router.push('/auth/registerBusiness')}
                activeOpacity={0.8}
              >
                <MaterialIcons name="store" size={24} color="white" />
                <ThemedText style={styles.typeButtonText}>Negocio</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeButton, styles.clientButton]}
                onPress={() => router.push('/auth/registerClient')}
                activeOpacity={0.8}
              >
                <MaterialIcons name="person" size={24} color="white" />
                <ThemedText style={styles.typeButtonText}>Cliente</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeButton, styles.dealerButton]}
                onPress={() => router.push('/auth/registerDealer')}
                activeOpacity={0.8}
              >
                <MaterialIcons name="delivery-dining" size={24} color="white" />
                <ThemedText style={styles.typeButtonText}>Repartidor</ThemedText>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={{
                opacity: buttonsAnim,
                transform: [
                  {
                    scale: buttonsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
              }}
            >
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
            </Animated.View>
          </Animated.View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 36,
    padding: 36,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.38,
    shadowRadius: 32,
    elevation: 16,
    borderWidth: 1,
    borderColor: 'rgba(126, 87, 194, 0.16)',
    alignItems: 'center',
  },
  logoCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#7E57C2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: '#9575CD',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#FFFDE7',
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#7E57C2',
    textAlign: 'center',
    marginBottom: 38,
    textShadowColor: 'rgba(126, 87, 194, 0.22)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
    letterSpacing: 1.2,
  },
  typeSelector: {
    gap: 18,
    marginBottom: 28,
    width: '100%',
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 28,
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
    fontWeight: '700',
    fontSize: 17,
  },
  loginLink: {
    marginTop: 18,
  },
  loginLinkText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#616161',
  },
  loginLinkBold: {
    fontWeight: '800',
    color: '#7E57C2',
    textDecorationLine: 'underline',
  },
});