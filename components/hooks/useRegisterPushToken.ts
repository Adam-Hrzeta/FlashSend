import { API_BASE_URL } from '@/constants/ApiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

export function useRegisterPushToken(negocioId?: number) {
  useEffect(() => {
    async function registerForPushNotificationsAsync() {
      if (!Device.isDevice) return;
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;
      if (token && negocioId) {
        const accessToken = await AsyncStorage.getItem('access_token');
        await fetch(`${API_BASE_URL}/api/negocio/push_token`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ negocio_id: negocioId, push_token: token }),
        });
      }
    }
    registerForPushNotificationsAsync();
  }, [negocioId]);
}
