import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from 'jwt-decode';

export interface DecodedToken {
  tipo_usuario?: string;
  [key: string]: any;
}

export async function getUserRole(): Promise<string | null> {
  const token = await AsyncStorage.getItem('access_token');
  if (!token) return null;
  try {
    const decoded = jwt_decode<DecodedToken>(token);
    return decoded.tipo_usuario || null;
  } catch {
    return null;
  }
}
