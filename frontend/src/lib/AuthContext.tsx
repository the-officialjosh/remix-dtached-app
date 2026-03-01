import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  userId: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCoach: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Helper: make authenticated API calls with auto-logout on 401
async function authFetch(url: string, token: string | null, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  return res;
}

function parseUser(data: any): User {
  return {
    userId: data.user_id ?? data.userId,
    email: data.email,
    role: data.role,
    firstName: data.first_name ?? data.firstName,
    lastName: data.last_name ?? data.lastName,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('dtached_token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('dtached_token');
  }, []);

  // Load user from token on mount
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    authFetch('/api/auth/me', token)
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          // Token expired or invalid
          logout();
          throw new Error('Token expired');
        }
        if (!res.ok) throw new Error('Failed to load user');
        return res.json();
      })
      .then((data) => setUser(parseUser(data)))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [token, logout]);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(err.message || 'Invalid email or password');
    }

    const data = await res.json();
    localStorage.setItem('dtached_token', data.token);
    setToken(data.token);
    setUser(parseUser(data));
  };

  const register = async (regData: RegisterData) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: regData.email.toLowerCase().trim(),
        password: regData.password,
        first_name: regData.firstName.trim(),
        last_name: regData.lastName.trim(),
        role: regData.role,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(err.message || 'Registration failed');
    }

    const data = await res.json();
    localStorage.setItem('dtached_token', data.token);
    setToken(data.token);
    setUser(parseUser(data));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isCoach: user?.role === 'COACH' || user?.role === 'TEAM_MANAGER',
        login,
        register,
        logout,
        loading,
      }}
    >
      {!loading ? children : (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
