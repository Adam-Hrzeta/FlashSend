import { ThemedText } from '@/components/ThemedText';
import { supabase } from '@/lib/supabase';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterDealersScreen() {
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const type_user = 'dealer'; 

  const handleRegister = async () => {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          phone: phone,
          type_user: type_user,
        },
      },
    });

    if (signUpError) {
      Alert.alert('Error', signUpError.message);
      return;
    }

    const userId = signUpData?.user?.id;

    if (userId) {
      const { error: insertError } = await supabase.from('entities').insert([
        {
          user_id: userId,
          display_name: displayName,
          phone: phone,
          email: email,
          type_user: type_user,
        },
      ]);

      if (insertError) {
        Alert.alert('Error al guardar los datos', insertError.message);
        return;
      }
    }

    Alert.alert('Registro exitoso', 'Por favor verifica tu correo');
    router.push('/auth/login');
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../../../assets/images/fondoLogin.jpg')} style={styles.background} contentFit="cover" />
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ThemedText type="title" style={styles.title}>Registrarme</ThemedText>

          <View style={styles.inputGroup}>
            <MaterialIcons name="person" size={22} color="#FF69B4" style={styles.icon} />
            <TextInput
              placeholder="Nombre Completo"
              placeholderTextColor="#A3A3A3"
              style={styles.input}
              onChangeText={setDisplayName}
            />
          </View>

          <View style={styles.inputGroup}>
            <MaterialIcons name="phone" size={22} color="#FF69B4" style={styles.icon} />
            <TextInput
              placeholder="Teléfono"
              placeholderTextColor="#A3A3A3"
              style={styles.input}
              keyboardType="phone-pad"
              onChangeText={setPhone}
            />
          </View>

          <View style={styles.inputGroup}>
            <MaterialIcons name="email" size={22} color="#FF69B4" style={styles.icon} />
            <TextInput
              placeholder="Correo electrónico"
              placeholderTextColor="#A3A3A3"
              style={styles.input}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <MaterialIcons name="lock" size={22} color="#FF69B4" style={styles.icon} />
            <TextInput
              placeholder="Contraseña"
              placeholderTextColor="#A3A3A3"
              secureTextEntry
              style={styles.input}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleRegister} activeOpacity={0.8}>
            <ThemedText style={styles.buttonText}>Registrar</ThemedText>
            <MaterialIcons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/auth/login')} activeOpacity={0.6}>
            <ThemedText style={styles.linkText}>
              ¿Ya tienes cuenta? <ThemedText style={styles.linkBold}>Inicia sesión</ThemedText>
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#7E57C2',
    textAlign: 'center',
    marginBottom: 28,
    letterSpacing: 0.3,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderRadius: 14,
    marginBottom: 18,
    paddingHorizontal: 18,
    height: 54,
    borderWidth: 1.5,
    borderColor: '#D1C4E9',
    elevation: 2,
  },
  icon: {
    marginRight: 12,
    color: '#7E57C2',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#5E35B1',
    fontWeight: '500',
    paddingVertical: 0,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#7E57C2',
    borderRadius: 14,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
    marginBottom: 22,
    elevation: 5,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  linkText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
  },
  linkBold: {
    fontWeight: '700',
    color: '#7E57C2',
    textDecorationLine: 'underline',
  },
});
