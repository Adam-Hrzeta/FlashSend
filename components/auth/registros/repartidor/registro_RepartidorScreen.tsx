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
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Registro_RepartidorScreen() {
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
      const response = await fetch(`${API_BASE_URL}/api/auth/registro_Repartidor`, {
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
        setMensaje(data.mensaje || '¡Repartidor registrado! Revisa tu correo para el código.');
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
          tipo_usuario: 'repartidor',
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
          tipo_usuario: 'repartidor',
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
        colors={['#F06292', '#BA68C8', '#9575CD', '#7E57C2']}
        style={styles.gradient}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
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
                <MaterialIcons name="delivery-dining" size={44} color="#FFFDE7" />
              </Animated.View>

              <TouchableOpacity
                onPress={() => router.push('/auth/seleccionar_Registro')}
                style={styles.backCircleButton}
                activeOpacity={0.8}
              >
                <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>

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
                  {mostrarVerificacion ? 'Verifica tu correo' : 'Registrar Repartidor'}
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
                      style={styles.input}
                      secureTextEntry
                      onChangeText={setContrasena}
                      value={contrasena}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <MaterialIcons name="lock" size={22} color="#7E57C2" style={styles.icon} />
                    <TextInput
                      placeholder="Repetir contraseña"
                      placeholderTextColor="#A3A3A3"
                      style={styles.input}
                      secureTextEntry
                      onChangeText={setRepetirContrasena}
                      value={repetirContrasena}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <MaterialIcons name="cake" size={22} color="#7E57C2" style={styles.icon} />
                    <TouchableOpacity
                      style={styles.input}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <ThemedText style={{ color: fechaNacimiento ? '#333' : '#A3A3A3' }}>
                        {fechaNacimiento ? fechaNacimiento.toLocaleDateString() : 'Fecha de nacimiento'}
                      </ThemedText>
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={fechaNacimiento}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                          setShowDatePicker(false);
                          if (selectedDate) setFechaNacimiento(selectedDate);
                        }}
                        maximumDate={new Date()}
                      />
                    )}
                  </View>
                  {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}
                  {mensaje ? <ThemedText style={styles.successText}>{mensaje}</ThemedText> : null}
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleRegister}
                    disabled={loadingRegistro}
                  >
                    {loadingRegistro ? (
                      <MaterialIcons name="hourglass-empty" size={22} color="#fff" />
                    ) : (
                      <MaterialIcons name="person-add" size={22} color="#fff" />
                    )}
                    <ThemedText style={styles.buttonText}>Registrarme</ThemedText>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.inputContainer}>
                  <View style={styles.inputGroup}>
                    <MaterialIcons name="mail" size={22} color="#7E57C2" style={styles.icon} />
                    <TextInput
                      placeholder="Código de verificación"
                      placeholderTextColor="#A3A3A3"
                      style={styles.input}
                      onChangeText={setCodigoVerificacion}
                      value={codigoVerificacion}
                      keyboardType="numeric"
                    />
                  </View>
                  {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}
                  {mensaje ? <ThemedText style={styles.successText}>{mensaje}</ThemedText> : null}
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleVerificarCodigo}
                    disabled={loadingVerificacion}
                  >
                    {loadingVerificacion ? (
                      <MaterialIcons name="hourglass-empty" size={22} color="#fff" />
                    ) : (
                      <MaterialIcons name="check-circle" size={22} color="#fff" />
                    )}
                    <ThemedText style={styles.buttonText}>Verificar código</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#9575CD', marginTop: 10 }]}
                    onPress={handleReenviarPin}
                    disabled={loadingReenvio}
                  >
                    <MaterialIcons name="refresh" size={22} color="#fff" />
                    <ThemedText style={styles.buttonText}>Reenviar código</ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          </View>
        </ScrollView>
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
    borderRadius: 26,
    padding: 22,
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
    fontSize: 28,
    fontWeight: '900',
    color: '#7E57C2',
    textAlign: 'center',
    marginBottom: 24,
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
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1.2,
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
  birthdayText: {
    color: '#5E35B1',
    fontWeight: '600',
    fontSize: 16,
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
  linkText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#616161',
  },
  linkBold: {
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
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  successText: {
    color: 'green',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});