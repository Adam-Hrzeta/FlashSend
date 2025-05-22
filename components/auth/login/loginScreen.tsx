import { ThemedText } from '@/components/ThemedText';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/Gif/fondo2.gif')} style={styles.background} contentFit="cover" />
      <View style={styles.overlay}>
        <ThemedText type="title" style={styles.title}>Iniciar sesión</ThemedText>

        <TextInput placeholder="Correo electrónico" placeholderTextColor="#ccc" style={styles.input} />
        <TextInput placeholder="Contraseña" placeholderTextColor="#ccc" secureTextEntry style={styles.input} />

        <TouchableOpacity style={styles.button}>
          <ThemedText style={styles.buttonText}>Entrar</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/auth/registerBusiness')}>
          <ThemedText style={styles.linkText}>¿No tienes cuenta? Regístrate</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', width: '100%', height: '100%' },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(126, 87, 194, 0.7)',
  },
  title: {
    color: 'white',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#9C27B0',
    padding: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  linkText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
});
