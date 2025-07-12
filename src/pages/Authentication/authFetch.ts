import { useAuth } from '../../context/AuthContext';

export const authFetch = async (
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> => {
  const { refreshTokenIfNeeded } = useAuth();

  await refreshTokenIfNeeded(); // Actualiza si el token está por expirar

  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('No access token available');

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    ...(init?.headers || {}),
  };

  return fetch(input, {
    ...init,
    headers: authHeaders,
  });
};
