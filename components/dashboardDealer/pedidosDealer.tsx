import React from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

// Datos simulados (mock)
const pedidosMock = [
  {
    id: '1',
    cliente: { id: 'c1', nombre: 'Juan Pérez', telefono: '555-123-4567' },
    negocio: { id: 'n1', nombre: 'Tacos De perro', telefono: '555-987-6543', categoria: 'Comida Rápida' }
  },
  {
    id: '2',
    cliente: { id: 'c2', nombre: 'Laura Martínez', telefono: '555-333-2211' },
    negocio: { id: 'n2', nombre: 'Farmacia Vida', telefono: '555-888-7777', categoria: 'Farmacia' }
  },
  {
    id: '3',
    cliente: { id: 'c3', nombre: 'Carlos Gómez', telefono: '555-444-5566' },
    negocio: { id: 'n3', nombre: 'Librería El Saber', telefono: '555-222-3333', categoria: 'Librería' }
  },
  {
    id: '4',
    cliente: { id: 'c4', nombre: 'Ana Torres', telefono: '555-999-0000' },
    negocio: { id: 'n4', nombre: 'Panadería Dulce Aroma', telefono: '555-111-2222', categoria: 'Panadería' }
  },
  {
    id: '5',
    cliente: { id: 'c5', nombre: 'Luis Fernández', telefono: '555-777-8888' },
    negocio: { id: 'n5', nombre: 'Electrodomésticos Rápidos', telefono: '555-444-5555', categoria: 'Electrodomésticos' }
  }
];

const PedidosD = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>📦 Pedidos Asignados</Text>

      <FlatList
        data={pedidosMock}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.subtitulo}>👤 Cliente</Text>
            <Text style={styles.text}>Nombre: {item.cliente.nombre}</Text>
            <Text style={styles.text}>Teléfono: {item.cliente.telefono}</Text>

            <Text style={styles.subtitulo}>🏪 Negocio</Text>
            <Text style={styles.text}>Nombre: {item.negocio.nombre}</Text>
            <Text style={styles.text}>Teléfono: {item.negocio.telefono}</Text>
            <Text style={styles.text}>Categoría: {item.negocio.categoria}</Text>
          </View>
        )}
      />

      <TouchableOpacity style={styles.botonVolver} onPress={() => router.push('/profiles/dealerProfile')}>
        <MaterialIcons name="arrow-back" size={22} color="#fff" />
        <Text style={styles.textoBoton}>Volver al perfil</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default PedidosD;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#7B1FA2',
  },
  card: {
    backgroundColor: '#FFF',
    borderLeftWidth: 6,
    borderLeftColor: '#BA68C8',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  subtitulo: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#8E24AA',
    marginBottom: 4,
    marginTop: 6,
  },
  text: {
    fontSize: 14,
    color: '#4A148C',
    marginBottom: 2,
  },
  botonVolver: {
    flexDirection: 'row',
    backgroundColor: '#AB47BC',
    padding: 12,
    marginVertical: 20,
    marginHorizontal: 60,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    elevation: 4,
  },
  textoBoton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
