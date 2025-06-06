import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterDealerScreen() {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleRegister = async () => {
    try {
      const response = await fetch('http://192.168.1.120:5000/api/auth/registro_Repartidor', {
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
        Alert.alert('Registro exitoso', data.mensaje || '¡Dealer registrado!');
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
          <ThemedText type="title" style={styles.title}>Registrar Repartidor</ThemedText>

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
    borderWidth: 0,
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