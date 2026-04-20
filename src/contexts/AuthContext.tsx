import { createContext, useContext, useMemo, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { Role } from '../types';

const TOKEN_KEY = 'license_dashboard_token';

interface TokenPayload {
  sub?: string;
  username?: string;
  role?: Role;
  isAdmin?: boolean;
  is_admin?: boolean;
  exp?: number;
}

interface AuthState {
  token: string | null;
  role: Role | null;
  username: string | null;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (token: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeToken(token: string): Pick<AuthState, 'role' | 'username'> {
  function inferRole(decoded: TokenPayload): Role | null {
    if (decoded.role) return decoded.role;
    if (decoded.is_admin || decoded.isAdmin) return 'admin';
    // Fallback: nếu backend chưa trả role, dùng sub === 'admin' làm dấu hiệu
    if (decoded.sub === 'admin') return 'admin';
    return 'user';
  }

  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return {
      role: inferRole(decoded),
      username: decoded.username ?? decoded.sub ?? null
    };
  } catch {
    try {
      const segment = token.split('.')[1];
      if (!segment) {
        return { role: null, username: null };
      }
      const decoded = JSON.parse(atob(segment)) as TokenPayload;
      return { role: inferRole(decoded), username: decoded.username ?? decoded.sub ?? null };
    } catch {
      return {
        role: null,
        username: null
      };
    }
  }
}

function getInitialState(): AuthState {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    return { token: null, role: null, username: null, isAuthenticated: false };
  }
  const { role, username } = decodeToken(token);
  return {
    token,
    role,
    username,
    isAuthenticated: true
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(getInitialState);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      signIn: (token: string) => {
        localStorage.setItem(TOKEN_KEY, token);
        const decoded = decodeToken(token);
        setState({ token, role: decoded.role, username: decoded.username, isAuthenticated: true });
      },
      signOut: () => {
        localStorage.removeItem(TOKEN_KEY);
        setState({ token: null, role: null, username: null, isAuthenticated: false });
      }
    }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY)
};
