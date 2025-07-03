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
