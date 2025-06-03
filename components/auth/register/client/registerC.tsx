import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterClientScreen() {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleRegister = async () => {
    try {
      const response = await fetch('http://192.168.1.120:5000/api/auth/registro_Cliente', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          correo,
          contrasena,
          telefono,
          fecha_nacimiento: fechaNacimiento.toISOString().split('T')[0]
        }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Registro exitoso', data.mensaje || '¡Cliente registrado!');
        router.push('/auth/login');
      } else {
        Alert.alert('Error', data.error || 'No se pudo registrar');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    }
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
          <ThemedText type="title" style={styles.title}>Registrar Cliente</ThemedText>

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
            <MaterialIcons name="cake" size={22} color="#7E57C2" style={styles.icon} />
            <TouchableOpacity
              style={[styles.input, { justifyContent: 'center' }]}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <ThemedText>
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
    flex: 1,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    color: '#333',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#7E57C2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginRight: 8,
  },
  linkText: {
    textAlign: 'center',
    marginTop: 16,
    color: '#7E57C2',
  },
  linkBold: {
    fontWeight: 'bold',
  },
});