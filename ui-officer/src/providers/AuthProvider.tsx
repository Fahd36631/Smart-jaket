import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

type OfficerProfile = {
  name: string;
  unit: string;
  rank: string;
  email: string;
};

type Credentials = {
  username: string;
  password: string;
};

type AuthContextValue = {
  officer: OfficerProfile | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (creds: Credentials) => Promise<void>;
  logout: () => void;
};

const SESSION_KEY = "dcd-officer-session";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [officer, setOfficer] = useState<OfficerProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as {
          officer: OfficerProfile;
          token: string;
        };
        setOfficer(parsed.officer);
        setToken(parsed.token);
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async ({ username, password }: Credentials) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (!username || !password) {
      setLoading(false);
      throw new Error("يرجى إدخال بيانات الدخول");
    }

    const normalizedUsername = username.trim().toLowerCase();
    const allowedUsername = "fahad";
    const allowedPassword = "Smart998!";

    if (normalizedUsername !== allowedUsername || password !== allowedPassword) {
      setLoading(false);
      throw new Error("بيانات الدخول غير صحيحة (جرّب Fahad / Smart998!)");
    }

    const fakeOfficer: OfficerProfile = {
      name: "المقدم فهد الشمري",
      unit: "قيادة الرياض",
      rank: "مقدم",
      email: "fahad.alshammari@998.gov.sa",
    };

    const session = {
      officer: fakeOfficer,
      token: crypto.randomUUID(),
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setOfficer(fakeOfficer);
    setToken(session.token);
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setOfficer(null);
    setToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      officer,
      token,
      loading,
      isAuthenticated: Boolean(officer && token),
      login,
      logout,
    }),
    [loading, login, logout, officer, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};

