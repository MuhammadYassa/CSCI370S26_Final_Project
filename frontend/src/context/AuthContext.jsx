import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { api, ApiError } from '../lib/api';

const AUTH_STORAGE_KEY = 'renter-dispute-auth';
const AuthContext = createContext(null);

function readStoredSession() {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredSession(session) {
  if (!session) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSession());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrateSession() {
      if (!session?.token) {
        setIsReady(true);
        return;
      }

      try {
        const user = await api.getMe();

        if (!cancelled) {
          const nextSession = { ...session, user };
          setSession(nextSession);
          writeStoredSession(nextSession);
        }
      } catch (error) {
        if (!cancelled) {
          if (error instanceof ApiError && error.status === 401) {
            setSession(null);
            writeStoredSession(null);
          }
        }
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    }

    hydrateSession();

    return () => {
      cancelled = true;
    };
  }, [session?.token]);

  const value = useMemo(
    () => ({
      isReady,
      isAuthenticated: Boolean(session?.token && session?.user),
      token: session?.token || null,
      user: session?.user || null,
      async login(credentials) {
        const result = await api.login(credentials);
        const nextSession = {
          token: result.token,
          user: result.user
        };

        setSession(nextSession);
        writeStoredSession(nextSession);

        return result;
      },
      async register(payload) {
        return api.register(payload);
      },
      logout() {
        setSession(null);
        writeStoredSession(null);
      }
    }),
    [isReady, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}
