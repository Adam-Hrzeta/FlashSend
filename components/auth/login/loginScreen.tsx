import { ThemedText } from '@/components/ThemedText';
import { supabase } from '@/lib/supabase';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ImageBackground, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

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

    Alert.alert('¡Bienvenido!', `Sesión iniciada como ${email}`);
    router.push('/profiles/busisnessProfile');
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/fondoLogin.jpg')}
      style={styles.background}
      resizeMode="cover"
      blurRadius={2}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.card}>
          <ThemedText type="title" style={styles.title}>Iniciar sesión</ThemedText>

          <View style={styles.inputContainer}>
            <View style={styles.inputGroup}>
              <MaterialIcons name="email" size={22} color="#7E57C2" style={styles.icon} />
              <TextInput
                placeholder="Correo electrónico"
                placeholderTextColor="#A3A3A3"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <MaterialIcons name="lock" size={22} color="#7E57C2" style={styles.icon} />
              <TextInput
                placeholder="Contraseña"
                placeholderTextColor="#A3A3A3"
                style={styles.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.buttonText}>Entrar</ThemedText>
              <MaterialIcons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/auth/registerBusisness')}
              activeOpacity={0.6}
            >
              <ThemedText style={styles.registerText}>
                ¿No tienes cuenta? <ThemedText style={styles.registerBold}>Regístrate aquí</ThemedText>
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(126, 87, 194, 0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#7E57C2',
    textAlign: 'center',
    marginBottom: 40,
    textShadowColor: 'rgba(126, 87, 194, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    marginBottom: 20,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#EDE7F6',
    shadowColor: '#D1C4E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 3,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#5E35B1',
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 8,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#7E57C2',
    borderRadius: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
    shadowColor: '#B39DDB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  registerText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#616161',
  },
  registerBold: {
    fontWeight: '600',
    color: '#7E57C2',
    textDecorationLine: 'underline',
  },
});