import * as Linking from 'expo-linking';
import * as Location from 'expo-location';

export async function pickLocationAndGetAddress(setEditData, setNegocio) {
  // Solicitar permisos
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    alert('Permiso de ubicación denegado');
    return;
  }

  // Obtener ubicación actual
  let location = await Location.getCurrentPositionAsync({});
  const lat = location.coords.latitude;
  const lng = location.coords.longitude;

  // Abrir Google Maps para seleccionar ubicación
  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  await Linking.openURL(url);

  // Esperar a que el usuario seleccione y regrese (esto es solo una simulación, en apps reales se usaría un picker in-app)
  // Aquí solo actualizamos la dirección con la actual
  let address = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
  if (address && address.length > 0) {
    const dir = `${address[0].street || ''} ${address[0].name || ''}, ${address[0].city || ''}, ${address[0].region || ''}`;
    setEditData((prev) => ({ ...prev, direccion: dir }));
    setNegocio((prev) => prev ? { ...prev, direccion: dir } : prev);
    return dir;
  }
}
