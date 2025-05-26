import { ThemedText } from '@/components/ThemedText';
import { supabase } from '@/lib/supabase';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterBusinessScreen() {
  const [selectedCategory, setSelectedCategory] = useState('comida');
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
          category: selectedCategory,
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
      const { error: insertError } = await supabase.from('businesses').insert([
        {
          user_id: userId,
          category: selectedCategory,
          display_name: displayName,
          phone: phone,
          email: email,
        },
      ]);

      if (insertError) {
        Alert.alert('Error al guardar negocio', insertError.message);
        return;
      }
    }

    Alert.alert('Registro exitoso', 'Por favor verifica tu correo');
    router.push('/auth/login');
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../../assets/images/fondoLogin.jpg')}
        style={styles.background}
        contentFit="cover"
      />
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ThemedText type="title" style={styles.title}>Registrar mi Negocio</ThemedText>

          <View style={styles.inputGroup}>
            <MaterialIcons name="person" size={22} color="#7E57C2" style={styles.icon} />
            <TextInput
              placeholder="Nombre del Negocio"
              placeholderTextColor="#A3A3A3"
              style={styles.input}
              onChangeText={setDisplayName}
            />
          </View>

          <View style={styles.inputGroup}>
            <MaterialIcons name="phone" size={22} color="#7E57C2" style={styles.icon} />
            <TextInput
              placeholder="Teléfono"
              placeholderTextColor="#A3A3A3"
              style={styles.input}
              keyboardType="phone-pad"
              onChangeText={setPhone}
            />
          </View>

          <View style={styles.pickerWrapper}>
            <View style={styles.inputGroup}>
              <MaterialIcons name="category" size={22} color="#7E57C2" style={styles.icon} />
              <Picker
                selectedValue={selectedCategory}
                onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                style={styles.picker}
                dropdownIconColor="#7E57C2"
                mode="dropdown"
              >
                <Picker.Item label="Comida" value="comida" />
                <Picker.Item label="Tecnología" value="tecnologia" />
                <Picker.Item label="Ropa" value="ropa" />
                <Picker.Item label="Hogar" value="hogar" />
                <Picker.Item label="Salud" value="salud" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <MaterialIcons name="email" size={22} color="#7E57C2" style={styles.icon} />
            <TextInput
              placeholder="Correo electrónico"
              placeholderTextColor="#A3A3A3"
              style={styles.input}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <MaterialIcons name="lock" size={22} color="#7E57C2" style={styles.icon} />
            <TextInput
              placeholder="Contraseña"
              placeholderTextColor="#A3A3A3"
              secureTextEntry
              style={styles.input}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.buttonText}>Registrar</ThemedText>
            <MaterialIcons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/auth/login')}
            activeOpacity={0.6}
          >
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
    flex: 1
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%'
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
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
    marginBottom: 32,
    textShadowColor: 'rgba(126, 87, 194, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
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
  pickerWrapper: {
    overflow: 'hidden',
    borderRadius: 16,
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
  picker: {
    flex: 1,
    height: 50,
    color: '#5E35B1',
    backgroundColor: 'transparent',
    borderWidth: 0, // Elimina el borde del Picker
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#7E57C2',
    borderRadius: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
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
  linkText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#616161',
  },
  linkBold: {
    fontWeight: '600',
    color: '#7E57C2',
    textDecorationLine: 'underline',
  },
});