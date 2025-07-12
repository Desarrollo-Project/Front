import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthState } from '../types';
import { jwtDecode, JwtPayload } from 'jwt-decode';


interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  refreshTokenIfNeeded: () => Promise<void>;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<boolean>;
  fetchAndUpdateUser: (email: string) => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
  const initializeAuth = async () => {
    const token = localStorage.getItem('access_token');
    const expiresAt = parseInt(localStorage.getItem('expires_at') || '0', 10);
    const email = localStorage.getItem('email');

    if (token && email && Date.now() < expiresAt) {
      await fetchAndUpdateUser(email); // 🔁 Esperamos que termine para saber si poner loading en false
    } else {
      logout(); // Esto ya pone loading en false
    }
  };

  initializeAuth();
}, []);


interface KeycloakJwtPayload {
  realm_access?: {
    roles: string[];
  };
}

const fetchAndUpdateUser = async (email: string): Promise<void> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return logout();

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/Usuarios/email/${email}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error('Error fetching user');

    const rawUser = await res.json();

    localStorage.setItem('user_id', rawUser.id);

    const decoded = jwtDecode<KeycloakJwtPayload>(token);
    const roles = decoded?.realm_access?.roles || [];

    const normalizedRoles = roles.map((r) => r.trim().toLowerCase());

    const roleMapping: Record<string, 'admin' | 'auctioneer' | 'bidder' | 'support'> = {
      'administrador': 'admin',
      'postor': 'bidder',
      'subastador': 'auctioneer',
      'soporte tecnico': 'support',
    };

    const matchedRoleKey = Object.keys(roleMapping).find((key) =>
      normalizedRoles.includes(key)
    );

    const userType: 'admin' | 'auctioneer' | 'bidder' | 'support' =
      matchedRoleKey ? roleMapping[matchedRoleKey] : 'bidder';

    const mappedUser: User = {
      id: rawUser.id,
      email: rawUser.correo,
      firstName: rawUser.nombre,
      lastName: rawUser.apellido,
      phone: rawUser.telefono,
      address: rawUser.direccion,
      userType,
      verificado: rawUser.verificado,
    };

    setAuthState({
      user: mappedUser,
      isAuthenticated: true,
      isLoading: false,
    });
  } catch (err) {
    console.error('Error al cargar el perfil:', err);
    logout();
  }
};

  const login = async (email: string, password: string): Promise<string | null> => {
    try {
      
    const checkRes = await fetch(`${import.meta.env.VITE_API_URL}/api/Usuarios/email/${email}`);
    if (!checkRes.ok) return 'Usuario no encontrado';

    const checkUser = await checkRes.json();
    if (!checkUser.verificado) {
      return 'Tu cuenta aún no ha sido verificada. Revisa tu correo y utiliza el formulario de activación.';
    }
      
      
      const params = new URLSearchParams();
      params.append('client_id', 'adduser-client');
      params.append('client_secret', 'XVXV1fnw9WP46Aiu4bfYBO5UoQIWAG13');
      params.append('grant_type', 'password');
      params.append('username', email);
      params.append('password', password);

      const response = await fetch('http://localhost:8080/realms/realm-adduser/protocol/openid-connect/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      });

      if (!response.ok) return 'Correo o contraseña incorrectos';

      const data = await response.json();
      const expiresAt = Date.now() + data.expires_in * 1000;

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('expires_at', expiresAt.toString());
      localStorage.setItem('email', email);
      


      await fetchAndUpdateUser(email);

      return null;
    } catch (err) {
      console.error('Login error:', err);
      logout();
      return 'Ocurrió un error al intentar iniciar sesión';
    }
  };

  const refreshTokenIfNeeded = async () => {
    const expiresAt = parseInt(localStorage.getItem('expires_at') || '0', 10);
    const now = Date.now();
    if (now < expiresAt - 60000) return;

    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return logout();

    try {
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

      if (!response.ok) return logout();

      const data = await response.json();
      const newExpiresAt = Date.now() + data.expires_in * 1000;

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('expires_at', newExpiresAt.toString());

      const email = localStorage.getItem('email');
      if (email) await fetchAndUpdateUser(email);
    } catch (err) {
      console.error('Error al refrescar token:', err);
      logout();
    }
  };

  const register = async (userData: Omit<User, 'id'> & { password: string }): Promise<boolean> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/register-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userData.email,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          password: userData.password,
        }),
      });

      return response.ok;
    } catch (err) {
      console.error('Error registrando usuario:', err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('email');
    localStorage.removeItem('user_id');
    localStorage.removeItem('default_payment_method');

    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider
  value={{
    ...authState,
    login,
    logout,
    refreshTokenIfNeeded,
    register,
    fetchAndUpdateUser,
    setUser: (user: React.SetStateAction<User | null>) => {
      setAuthState((prev) => ({
        ...prev,
        user: typeof user === 'function' ? user(prev.user) : user,
      }));
    },
  }}
>
  {children}
</AuthContext.Provider>

  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
