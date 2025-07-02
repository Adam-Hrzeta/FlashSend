import { API_BASE_URL } from '@/constants/ApiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import { useEffect } from 'react';

export function useRegisterPushToken(negocioId?: number) {
  useEffect(() => {
    async function registerForPushNotificationsAsync() {
      if (!Device.isDevice) return;
    }
    registerForPushNotificationsAsync();
  }, [negocioId]);
}
