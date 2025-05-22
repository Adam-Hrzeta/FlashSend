import { ThemedText } from '@/components/ThemedText';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { supabase } from '@/lib/supabase'; 

export default function RegisterDealersScreen() {
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          phone: phone,
        },
      },
    });

    if (signUpError) {
      Alert.alert('Error', signUpError.message);
      return;
    }

    const userId = signUpData?.user?.id;

    if (userId) {
      const { error: insertError } = await supabase.from('dealers').insert([
        {
          user_id: userId,
          display_name: displayName,
          phone: phone,
          email: email,
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
      <Image source={require('../../../../assets/Gif/fondo1.gif')} style={styles.background} contentFit="cover" />
      <View style={styles.overlay}>
        <ThemedText type="title" style={styles.title}>Registrarme</ThemedText>

        <TextInput
          placeholder="Nombre Completo"
          placeholderTextColor="#ccc"
          style={styles.input}
          onChangeText={setDisplayName}
        />

        <TextInput
          placeholder="Teléfono"
          placeholderTextColor="#ccc"
          style={styles.input}
          keyboardType="phone-pad"
          onChangeText={setPhone}
        />

        <TextInput
          placeholder="Correo electrónico"
          placeholderTextColor="#ccc"
          style={styles.input}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="#ccc"
          secureTextEntry
          style={styles.input}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <ThemedText style={styles.buttonText}>Registrar</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/auth/login')}>
          <ThemedText style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</ThemedText>
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
  pickerWrapper: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    paddingLeft: 10,
  },
  picker: {
    height: 50,
    width: '100%',
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
