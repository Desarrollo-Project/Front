// src/services/ApiClient.ts
const BASE_URL =  import.meta.env.VITE_API_URL

const getToken = () => localStorage.getItem('access_token');
const getRefreshToken = () => localStorage.getItem('refresh_token');
const setTokens = (access: string, refresh: string, expiresIn: number) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
  localStorage.setItem('expires_at', (Date.now() + expiresIn * 1000).toString());
};

const refreshTokenIfNeeded = async () => {
  const expiresAt = parseInt(localStorage.getItem('expires_at') || '0', 10);
  const now = Date.now();
  if (now < expiresAt - 60000) return; // Si el token aún es válido, no hacer nada

  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No hay refresh token');

  const params = new URLSearchParams();
  params.append('client_id', 'adduser-client');
  params.append('client_secret', 'XVXV1fnw9WP46Aiu4bfYBO5UoQIWAG13');
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', refreshToken);

  const response = await fetch('http://localhost:8080/realms/realm-adduser/protocol/openid-connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  if (!response.ok) throw new Error('Error al refrescar token');

  const data = await response.json();
  setTokens(data.access_token, data.refresh_token, data.expires_in);
};

const request = async (
  method: string,
  url: string,
  body?: any,
  responseType: 'json' | 'blob' | 'text' = 'json'
) => {
  await refreshTokenIfNeeded();

  const token = getToken();
  const isFormData = body instanceof FormData;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const options: RequestInit = {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  };

  const res = await fetch(`${BASE_URL}${url}`, options);

  if (!res.ok) {
    const contentType = res.headers.get('content-type') || '';
    let errorMessage = '';
    if (contentType.includes('application/json')) {
      const errJson = await res.json();
      errorMessage = errJson.message || JSON.stringify(errJson);
    } else {
      errorMessage = await res.text();
    }
    throw new Error(errorMessage || 'Error en la solicitud');
  }

  if (res.status === 204) return null;

  if (responseType === 'blob') return res.blob();
  if (responseType === 'text') return res.text();

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  } else {
    return res.text();
  }
};

// Exporta los métodos que usarás
export default {
  get: (url: string) => request('GET', url),
  post: (url: string, body?: any) => request('POST', url, body),
  put: (url: string, body?: any) => request('PUT', url, body),
  patch: (url: string, body?: any) => request('PATCH', url, body),
  delete: (url: string, body?: any) => request('DELETE', url, body),
  getBlob: (url: string) => request('GET', url, undefined, 'blob'),
};