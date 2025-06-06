import { useEffect, useState } from 'react';

// Hook para obtener el tipo de usuario desde el backend
export function useUserType() {
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://192.168.1.120:5000/api/auth/userType', { credentials: 'include' })
      .then(async res => {
        if (!res.ok) throw new Error('No autorizado');
        return res.json();
      })
      .then(data => {
        setUserType(data.tipo_usuario);
        setLoading(false);
      })
      .catch(() => {
        setUserType(null);
        setLoading(false);
      });
  }, []);

  return { userType, loading };
}
