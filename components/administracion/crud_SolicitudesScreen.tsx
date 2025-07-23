import { API_BASE_URL } from "@/constants/ApiConfig";
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

interface Negocio {
  id: number;
  nombre: string;
  correo: string;
}
interface Repartidor {
  id: number;
  nombre: string;
  correo: string;
}

export default function Crud_SolicitudesScreen({ setNotAuth }: { setNotAuth?: (v: boolean) => void }) {
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [repartidores, setRepartidores] = useState<Repartidor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch principal (con spinner)
  const fetchPendientes = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    setNotAuth && setNotAuth(false);
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
      if (!negociosRes.ok || !repartidoresRes.ok) {
        const data = await negociosRes.json().catch(() => ({}));
        setNotAuth && setNotAuth(true);
        Alert.alert('No autorizado', data?.error || 'Solo administradores pueden acceder a este panel.');
        if (showSpinner) setLoading(false);
        return;
      }
      const negociosData = await negociosRes.json();
      setNegocios(Array.isArray(negociosData) ? negociosData : []);
      const repartidoresData = await repartidoresRes.json();
      setRepartidores(Array.isArray(repartidoresData) ? repartidoresData : []);
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar los registros pendientes');
    }
    if (showSpinner) setLoading(false);
  };

  // Polling discreto (sin spinner)
  const fetchPendientesSilent = async () => {
    await fetchPendientes(false);
  };

  useEffect(() => {
    fetchPendientes(true);
    intervalRef.current = setInterval(fetchPendientesSilent, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const aprobar = async (tipo: 'negocio' | 'repartidor', id: number) => {
    const token = await AsyncStorage.getItem('access_token');
    const url = `${API_BASE_URL}/api/dashboard_admin/aprobar_${tipo}/${id}`;
    try {
      await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      fetchPendientes();
    } catch {
      Alert.alert('Error', 'No se pudo aprobar');
    }
  };
  const rechazar = async (tipo: 'negocio' | 'repartidor', id: number) => {
    const token = await AsyncStorage.getItem('access_token');
    const url = `${API_BASE_URL}/api/dashboard_admin/rechazar_${tipo}/${id}`;
    try {
      await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      fetchPendientes();
    } catch {
      Alert.alert('Error', 'No se pudo rechazar');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPendientes(true);
    setRefreshing(false);
  };


  if (loading) return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" style={{ marginTop: 40 }} />
    </ThemedView>
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0a7ea4"]} tintColor="#0a7ea4" />}>
        <ThemedText type="title" style={styles.title}>Negocios pendientes</ThemedText>
        {negocios.length === 0 && <ThemedText style={styles.empty}>No hay negocios pendientes</ThemedText>}
        {Array.isArray(negocios) && negocios.map((n) => (
          <View key={n.id} style={styles.card}>
            <View style={{flexDirection:'row', alignItems:'center'}}>
              <MaterialIcons name="store" size={32} color="#0a7ea4" style={{marginRight:8}} />
              <View>
                <ThemedText style={styles.name}>{n.nombre}</ThemedText>
                <ThemedText style={styles.email}>{n.correo}</ThemedText>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.approveBtn} onPress={() => aprobar('negocio', n.id)}>
                <MaterialIcons name="check-circle" size={24} color="#fff" />
                <ThemedText style={styles.btnText}>Aprobar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rejectBtn} onPress={() => rechazar('negocio', n.id)}>
                <MaterialIcons name="cancel" size={24} color="#fff" />
                <ThemedText style={styles.btnText}>Rechazar</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <ThemedText type="title" style={styles.title}>Repartidores pendientes</ThemedText>
        {repartidores.length === 0 && <ThemedText style={styles.empty}>No hay repartidores pendientes</ThemedText>}
        {repartidores.map((r) => (
          <View key={r.id} style={styles.card}>
            <View style={{flexDirection:'row', alignItems:'center'}}>
              <MaterialIcons name="delivery-dining" size={32} color="#0a7ea4" style={{marginRight:8}} />
              <View>
                <ThemedText style={styles.name}>{r.nombre}</ThemedText>
                <ThemedText style={styles.email}>{r.correo}</ThemedText>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.approveBtn} onPress={() => aprobar('repartidor', r.id)}>
                <MaterialIcons name="check-circle" size={24} color="#fff" />
                <ThemedText style={styles.btnText}>Aprobar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rejectBtn} onPress={() => rechazar('repartidor', r.id)}>
                <MaterialIcons name="cancel" size={24} color="#fff" />
                <ThemedText style={styles.btnText}>Rechazar</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },
  title: { fontWeight: 'bold', fontSize: 22, color: '#fff', marginBottom: 12, marginTop: 16 },
  empty: { color: '#fff', fontStyle: 'italic', marginBottom: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: { fontWeight: 'bold', fontSize: 18, color: '#7E57C2' },
  email: { color: '#888', fontSize: 15 },
  actions: { flexDirection: 'row', marginTop: 12, justifyContent: 'flex-end' },
  approveBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#7E57C2', padding: 8, borderRadius: 8, marginRight: 8
  },
  rejectBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F06292', padding: 8, borderRadius: 8
  },
  btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 4 },
});