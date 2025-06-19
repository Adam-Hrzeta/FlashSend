import BusinessProfileScreen from "@/components/profiles/profileB";
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BusinessProfile() {
  const router = useRouter();
  return (
    <View style={{ flex: 1 }}>
      <BusinessProfileScreen />
      <TouchableOpacity
        style={styles.productButton}
        onPress={() => router.push('/dashboardNegocio/gestionProductos')}
      >
        <Text style={styles.productButtonText}>Gestionar productos</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  productButton: {
    backgroundColor: '#7E57C2',
    padding: 16,
    borderRadius: 16,
    margin: 24,
    alignItems: 'center',
    elevation: 4,
  },
  productButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});