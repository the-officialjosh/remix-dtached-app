import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  userId: number;
  email: string;
  role: string | null;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  userTag?: string | null;
  emailConfirmed: boolean;
  needsRole: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCoach: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  selectRole: (role: string) => Promise<void>;
  resendConfirmation: () => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => void;
  loading: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

function parseUser(data: any): User {
  return {
    userId: data.user_id ?? data.userId,
    email: data.email,
    role: data.role ?? null,
    firstName: data.first_name ?? data.firstName,
    lastName: data.last_name ?? data.lastName,
    photoUrl: data.photo_url ?? data.photoUrl ?? data.photo_url,
    userTag: data.user_tag ?? data.userTag ?? null,
    emailConfirmed: data.email_confirmed ?? data.emailConfirmed ?? false,
    needsRole: data.needs_role ?? data.needsRole ?? false,
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

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401 || res.status === 403) {
        logout();
        throw new Error('Token expired');
      }
      if (!res.ok) throw new Error('Failed to load user');
      const data = await res.json();
      setUser(parseUser(data));
    } catch (err) {
      logout();
    }
  }, [token, logout]);

  // Load user from token on mount
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    refreshUser().finally(() => setLoading(false));
  }, [token, refreshUser]);

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
        firstName: regData.firstName.trim(),
        lastName: regData.lastName.trim(),
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

  const selectRole = async (role: string) => {
    if (!token) throw new Error('Not authenticated');

    const res = await fetch('/api/auth/select-role', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Role selection failed' }));
      throw new Error(err.message || 'Role selection failed');
    }

    const data = await res.json();
    // Update token with new role
    if (data.token) {
      localStorage.setItem('dtached_token', data.token);
      setToken(data.token);
    }
    setUser(parseUser(data));
  };

  const resendConfirmation = async () => {
    if (!token) throw new Error('Not authenticated');

    const res = await fetch('/api/auth/resend-confirmation', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to resend' }));
      throw new Error(err.message || 'Failed to resend confirmation');
    }
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
        selectRole,
        resendConfirmation,
        refreshUser,
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
