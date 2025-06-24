import { ThemedText } from '@/components/ThemedText';
import { API_BASE_URL } from '@/constants/ApiConfig';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function RegisterClientScreen() {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [repetirContrasena, setRepetirContrasena] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Estados para verificación
  const [codigoVerificacion, setCodigoVerificacion] = useState('');
  const [mostrarVerificacion, setMostrarVerificacion] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loadingRegistro, setLoadingRegistro] = useState(false);
  const [loadingVerificacion, setLoadingVerificacion] = useState(false);
  const [loadingReenvio, setLoadingReenvio] = useState(false);

  // Animaciones
  const cardAnim = useRef(new Animated.Value(0)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

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
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),
    ]).start();
  }, []);

  const handleRegister = async () => {
    if (contrasena !== repetirContrasena) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setLoadingRegistro(true);
    setError('');
    setMensaje('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/registro_Cliente`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          correo,
          contrasena,
          telefono,
          fecha_nacimiento: fechaNacimiento.toISOString().split('T')[0],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje(data.mensaje || '¡Cliente registrado! Revisa tu correo para el código.');
        setMostrarVerificacion(true);
      } else {
        Alert.alert('Error', data.error || 'No se pudo registrar');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    } finally {
      setLoadingRegistro(false);
    }
  };

  const handleVerificarCodigo = async () => {
    if (!codigoVerificacion.trim()) {
      setError('Por favor ingresa el código de verificación');
      setMensaje('');
      return;
    }

    setLoadingVerificacion(true);
    setError('');
    setMensaje('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verificar_correo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo,
          pin: codigoVerificacion.trim(),
          tipo_usuario: 'cliente',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Éxito', data.mensaje || 'Correo verificado correctamente');
        router.push('/auth/login');
      } else {
        setError(data.error || 'Código incorrecto o expirado');
      }
    } catch (error) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoadingVerificacion(false);
    }
  };

  const handleReenviarPin = async () => {
    setLoadingReenvio(true);
    setError('');
    setMensaje('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reenviar_pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo,
          tipo_usuario: 'cliente',
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMensaje(data.mensaje || 'Se ha enviado un nuevo código a tu correo.');
      } else {
        setError(data.error || 'No se pudo reenviar el código');
      }
    } catch (error) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoadingReenvio(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <LinearGradient
        colors={['#F06292', '#BA68C8', '#9575CD', '#7E57C2', '#F06292']}
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
            <TouchableOpacity
              onPress={() => router.push('/auth/select')}
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
              <MaterialIcons name="person" size={44} color="#FFFDE7" />
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
                {mostrarVerificacion ? 'Verifica tu correo' : 'Registrar Cliente'}
              </ThemedText>
            </Animated.View>

            {!mostrarVerificacion ? (
              <View style={styles.inputContainer}>
                <View style={styles.inputGroup}>
                  <MaterialIcons name="person" size={22} color="#7E57C2" style={styles.icon} />
                  <TextInput
                    placeholder="Nombre completo"
                    placeholderTextColor="#A3A3A3"
                    style={styles.input}
                    onChangeText={setNombre}
                    value={nombre}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <MaterialIcons name="phone" size={22} color="#7E57C2" style={styles.icon} />
                  <TextInput
                    placeholder="Teléfono"
                    placeholderTextColor="#A3A3A3"
                    style={styles.input}
                    keyboardType="phone-pad"
                    onChangeText={setTelefono}
                    value={telefono}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <MaterialIcons name="email" size={22} color="#7E57C2" style={styles.icon} />
                  <TextInput
                    placeholder="Correo electrónico"
                    placeholderTextColor="#A3A3A3"
                    style={styles.input}
                    onChangeText={setCorreo}
                    keyboardType="email-address"
                    value={correo}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <MaterialIcons name="lock" size={22} color="#7E57C2" style={styles.icon} />
                  <TextInput
                    placeholder="Contraseña"
                    placeholderTextColor="#A3A3A3"
                    secureTextEntry
                    style={styles.input}
                    onChangeText={setContrasena}
                    value={contrasena}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <MaterialIcons name="lock" size={22} color="#7E57C2" style={styles.icon} />
                  <TextInput
                    placeholder="Repetir contraseña"
                    placeholderTextColor="#A3A3A3"
                    secureTextEntry
                    style={styles.input}
                    onChangeText={setRepetirContrasena}
                    value={repetirContrasena}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <MaterialIcons name="cake" size={22} color="#7E57C2" style={styles.icon} />
                  <TouchableOpacity
                    style={[styles.input, { justifyContent: 'center' }]}
                    onPress={() => setShowDatePicker(true)}
                    activeOpacity={0.7}
                  >
                    <ThemedText style={styles.birthdayText}>
                      {fechaNacimiento
                        ? fechaNacimiento.toLocaleDateString()
                        : 'Selecciona tu fecha de nacimiento'}
                    </ThemedText>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={fechaNacimiento}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      maximumDate={new Date()}
                      onChange={(_, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) setFechaNacimiento(selectedDate);
                      }}
                    />
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.inputContainer}>
                <View style={styles.inputGroup}>
                  <MaterialIcons name="email" size={22} color="#7E57C2" style={styles.icon} />
                  <TextInput
                    placeholder="Correo electrónico"
                    placeholderTextColor="#A3A3A3"
                    style={styles.input}
                    editable={false}
                    value={correo}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <MaterialIcons
                    name="confirmation-number"
                    size={22}
                    color="#7E57C2"
                    style={styles.icon}
                  />
                  <TextInput
                    placeholder="Código de verificación"
                    placeholderTextColor="#A3A3A3"
                    style={styles.input}
                    onChangeText={setCodigoVerificacion}
                    value={codigoVerificacion}
                  />
                </View>
                {mensaje ? (
                  <ThemedText style={{ color: 'green', marginBottom: 10 }}>{mensaje}</ThemedText>
                ) : null}
                {error ? (
                  <ThemedText style={{ color: 'red', marginBottom: 10 }}>{error}</ThemedText>
                ) : null}
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: '#BA68C8', marginTop: 10 }]}
                  onPress={handleReenviarPin}
                  activeOpacity={0.8}
                  disabled={loadingReenvio}
                >
                  <ThemedText type="defaultSemiBold" style={{ color: '#fff' }}>
                    {loadingReenvio ? 'Enviando...' : 'Reenviar código'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}

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
              {!mostrarVerificacion ? (
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleRegister}
                  activeOpacity={0.8}
                  disabled={loadingRegistro}
                >
                  <ThemedText type="defaultSemiBold" style={{ color: '#fff' }}>
                    {loadingRegistro ? 'Registrando...' : 'Registrar'}
                  </ThemedText>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleVerificarCodigo}
                  activeOpacity={0.8}
                  disabled={loadingVerificacion}
                >
                  <ThemedText type="defaultSemiBold" style={{ color: '#fff' }}>
                    {loadingVerificacion ? 'Verificando...' : 'Verificar Código'}
                  </ThemedText>
                </TouchableOpacity>
              )}
            </Animated.View>
          </Animated.View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  backCircleButton: {
    backgroundColor: '#9575CD',
    padding: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  logoCircle: {
    backgroundColor: '#7E57C2',
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 18,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7E57C2',
    alignSelf: 'center',
    marginBottom: 18,
  },
  inputContainer: {
    marginBottom: 10,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#D1C4E9',
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#4A148C',
  },
  birthdayText: {
    fontSize: 16,
    color: '#4A148C',
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#7E57C2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
});