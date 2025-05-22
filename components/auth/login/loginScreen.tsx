import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { ImageBackground, StyleSheet, TextInput, TouchableOpacity, View, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase'; // Asegúrate de importar correctamente

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos');
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert('Error de autenticación', error.message);
      return;
    }

    // Aquí ya está autenticado correctamente
    Alert.alert('¡Bienvenido!', `Sesión iniciada como ${email}`);
    router.push('/profiles/busisnessProfile'); // Cambia esta ruta si tu perfil tiene otro nombre
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/fondoLogin.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.card}>
          <ThemedText type="title" style={styles.title}>Iniciar sesión</ThemedText>

          <View style={styles.inputGroup}>
            <MaterialIcons name="email" size={22} color="#64B5F6" style={styles.icon} />
            <TextInput
              placeholder="Correo electrónico"
              placeholderTextColor="#ccc"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <MaterialIcons name="lock" size={22} color="#64B5F6" style={styles.icon} />
            <TextInput
              placeholder="Contraseña"
              placeholderTextColor="#ccc"
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <ThemedText style={styles.buttonText}>Entrar</ThemedText>
            <MaterialIcons name="login" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/auth/registerBusiness')}>
            <ThemedText style={styles.registerText}>
              ¿No tienes cuenta? <ThemedText style={styles.registerBold}>Regístrate</ThemedText>
            </ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    backgroundColor: 'rgba(126, 87, 194, 0.7)',
    borderRadius: 32,
    padding: 32,
    shadowColor: '#00B0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 15,
    borderWidth: 1,
    borderColor: 'rgba(67, 0, 212, 0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 18,
    marginBottom: 20,
    paddingHorizontal: 16,
    height: 56,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#9C27B0',
    borderRadius: 28,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    shadowColor: '#CE93D8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  registerText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 15,
    color: 'white',
  },
  registerBold: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    color: 'white',
  },
});