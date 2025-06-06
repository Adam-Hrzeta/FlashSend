import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';

// Simulación de datos recibidos (podrías traerlos desde tu backend)
const perfilEjemplo = {
  nombre: 'Juan Pérez',
  correo: 'juanperez@example.com',
  telefono: '5551234567',
  fechaNacimiento: '1990-06-15',
};

export default function PerfilRepartidor() {
  const [perfil] = useState(perfilEjemplo);

  useEffect(() => {
  }, []);

  const cerrarSesion = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sí', onPress: () => router.push('/auth/login') },
    ]);
  };

  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.title}>Mi Perfil</ThemedText>

      <View style={styles.card}>
        <InfoItem icon="person" label="Nombre" value={perfil.nombre} />
        <InfoItem icon="email" label="Correo" value={perfil.correo} />
        <InfoItem icon="phone" label="Teléfono" value={perfil.telefono} />
        <InfoItem icon="cake" label="Nacimiento" value={perfil.fechaNacimiento} />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={cerrarSesion}>
        <MaterialIcons name="logout" size={20} color="white" />
        <ThemedText style={styles.logoutText}>Cerrar sesión</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

function InfoItem({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <MaterialIcons name={icon} size={22} color="#7E57C2" />
      <View style={{ marginLeft: 12 }}>
        <ThemedText style={styles.label}>{label}</ThemedText>
        <ThemedText style={styles.value}>{value}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#7E57C2',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#B39DDB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#7E57C2',
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    color: '#424242',
  },
  logoutButton: {
    marginTop: 40,
    flexDirection: 'row',
    backgroundColor: '#7E57C2',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    elevation: 4,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
