import AsyncStorage from '@react-native-async-storage/async-storage';

// Llama esta función al cerrar sesión
export async function logoutAndClearToken() {
  try {
    await AsyncStorage.removeItem('access_token');
    // Si tienes otros datos de usuario, límpialos aquí también
    // await AsyncStorage.removeItem('user_data');
  } catch (e) {
    // Maneja el error si ocurre
    console.error('Error limpiando el token:', e);
  }
}
