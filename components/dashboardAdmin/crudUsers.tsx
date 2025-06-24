import React, { useEffect, useState } from "react";
import { View, Text, Button, ScrollView, Alert, ActivityIndicator } from "react-native";
import { API_BASE_URL } from "@/constants/ApiConfig";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CrudUsers() {
  const [negocios, setNegocios] = useState([]);
  const [repartidores, setRepartidores] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendientes = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('access_token');
    try {
      const [negociosRes, repartidoresRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/dashboard_admin/negocios_pendientes`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/dashboard_admin/repartidores_pendientes`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);
      setNegocios(await negociosRes.json());
      setRepartidores(await repartidoresRes.json());
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar los registros pendientes');
    }
    setLoading(false);
  };

  useEffect(() => { fetchPendientes(); }, []);

  const aprobar = async (tipo, id) => {
    const token = await AsyncStorage.getItem('access_token');
    const url = `${API_BASE_URL}/api/dashboard_admin/aprobar_${tipo}/${id}`;
    try {
      await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      fetchPendientes();
    } catch {
      Alert.alert('Error', 'No se pudo aprobar');
    }
  };
  const rechazar = async (tipo, id) => {
    const token = await AsyncStorage.getItem('access_token');
    const url = `${API_BASE_URL}/api/dashboard_admin/rechazar_${tipo}/${id}`;
    try {
      await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      fetchPendientes();
    } catch {
      Alert.alert('Error', 'No se pudo rechazar');
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{marginTop: 40}} />;

  return (
    <ScrollView style={{padding: 16}}>
      <Text style={{fontWeight: 'bold', fontSize: 18, marginBottom: 8}}>Negocios pendientes</Text>
      {negocios.length === 0 && <Text>No hay negocios pendientes</Text>}
      {negocios.map((n) => (
        <View key={n.id} style={{marginBottom: 12, padding: 8, borderWidth: 1, borderRadius: 8}}>
          <Text>Nombre: {n.nombre}</Text>
          <Text>Correo: {n.correo}</Text>
          <View style={{flexDirection: 'row', marginTop: 4}}>
            <Button title="Aprobar" onPress={() => aprobar('negocio', n.id)} />
            <View style={{width: 8}}/>
            <Button title="Rechazar" color="red" onPress={() => rechazar('negocio', n.id)} />
          </View>
        </View>
      ))}
      <Text style={{fontWeight: 'bold', fontSize: 18, marginVertical: 8}}>Repartidores pendientes</Text>
      {repartidores.length === 0 && <Text>No hay repartidores pendientes</Text>}
      {repartidores.map((r) => (
        <View key={r.id} style={{marginBottom: 12, padding: 8, borderWidth: 1, borderRadius: 8}}>
          <Text>Nombre: {r.nombre}</Text>
          <Text>Correo: {r.correo}</Text>
          <View style={{flexDirection: 'row', marginTop: 4}}>
            <Button title="Aprobar" onPress={() => aprobar('repartidor', r.id)} />
            <View style={{width: 8}}/>
            <Button title="Rechazar" color="red" onPress={() => rechazar('repartidor', r.id)} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}