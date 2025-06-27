import { ThemedText } from '@/components/ThemedText';
import { API_BASE_URL } from '@/constants/ApiConfig';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { setToken } from '@/utils/authToken';

export default function LoginScreen() {
  const [correo, setEmail] = useState('');
  const [contrasena, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const cardAnim = useRef(new Animated.Value(0)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const [isLoading, setIsLoading] = useState(false);

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
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!correo || !contrasena) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo, contrasena }),
      });

      const data = await response.json();

      if (response.ok) {
        // Guarda el token en AsyncStorage (esto reemplaza el anterior)
        await AsyncStorage.setItem('access_token', data.access_token);
        await setToken(data.access_token);

        // Opcional: puedes guardar el tipo de usuario si lo necesitas
        // await AsyncStorage.setItem('tipo_usuario', data.tipo_usuario);

        if (data.tipo_usuario === 'negocio') {
          router.push('/profiles/busisnessProfile');
        } else if (data.tipo_usuario === 'cliente') {
          router.push('/profiles/clientProfile');
        } else if (data.tipo_usuario === 'repartidor') {
          router.push('/profiles/dealerProfile');
        } else if (data.tipo_usuario === 'administrador') {
          router.push('/dashboardAdmin/gestionUsers');
        } else {
          router.push('/');
        }
      } else {
        Alert.alert('Error', data.message || data.error || 'Credenciales incorrectas');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    }
    setIsLoading(false);
  };

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
          <TouchableOpacity
            onPress={() => router.push('/')}
            style={styles.backCircleButton}
            activeOpacity={0.8}
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

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
          <ThemedText type="title" style={styles.title}>
            Iniciar sesión
          </ThemedText>

          <View style={styles.inputContainer}>
            <Animated.View
              style={[
                styles.inputGroup,
                {
                  opacity: logoAnim,
                  transform: [
                    {
                      translateX: logoAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-40, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <MaterialIcons name="email" size={22} color="#7E57C2" style={styles.icon} />
              <TextInput
                placeholder="Correo electrónico"
                placeholderTextColor="#A3A3A3"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                value={correo}
                onChangeText={setEmail}
                editable={!isLoading}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.inputGroup,
                {
                  opacity: logoAnim,
                  transform: [
                    {
                      translateX: logoAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [40, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <MaterialIcons name="lock" size={22} color="#7E57C2" style={styles.icon} />
              <TextInput
                placeholder="Contraseña"
                placeholderTextColor="#A3A3A3"
                style={styles.input}
                secureTextEntry={!showPassword}
                value={contrasena}
                onChangeText={setPassword}
                editable={!isLoading}
              />
              <Pressable onPress={() => setShowPassword((v) => !v)}>
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={22}
                  color="#A3A3A3"
                />
              </Pressable>
            </Animated.View>
          </View>

          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: buttonAnim,
                transform: [
                  {
                    scale: buttonAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.button,
                isLoading && { backgroundColor: '#B39DDB' },
              ]}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              <ThemedText style={styles.buttonText}>
                {isLoading ? 'Entrando...' : 'Entrar'}
              </ThemedText>
              <Animated.View
                style={{
                  transform: [
                    {
                      translateX: isLoading
                        ? new Animated.Value(10)
                        : new Animated.Value(0),
                    },
                  ],
                }}
              >
                <MaterialIcons name="arrow-forward" size={20} color="white" />
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/auth/select')}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <ThemedText style={styles.registerText}>
                ¿No tienes cuenta?{' '}
                <ThemedText style={styles.registerBold}>Regístrate aquí</ThemedText>
              </ThemedText>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
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
  inputContainer: {
    width: '100%',
    marginBottom: 18,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3EFFF',
    borderRadius: 20,
    marginBottom: 20,
    paddingHorizontal: 18,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#E1D5FA',
    shadowColor: '#D1C4E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 2,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: '#5E35B1',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  buttonContainer: {
    marginTop: 10,
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#7E57C2',
    borderRadius: 20,
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
    shadowColor: '#B39DDB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: 0.8,
  },
  registerText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#616161',
  },
  registerBold: {
    fontWeight: '800',
    color: '#7E57C2',
    textDecorationLine: 'underline',
  },
  backCircleButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#7E57C2', // lila
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5E35B1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },

});