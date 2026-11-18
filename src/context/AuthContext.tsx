import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getApiBaseUrl } from "../services/api";

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "MARKETING"
  | "MARKETING_OFFICER"
  | "FINANCE"
  | "FINANCE_OFFICER"
  | "ACADEMIC"
  | "ACADEMIC_OFFICER"
  | "EXAM"
  | "EXAM_OFFICER"
  | "LECTURER"
  | "STUDENT";

export type NormalizedRole =
  | "STUDENT"
  | "MARKETING"
  | "ACADEMIC"
  | "FINANCE"
  | "EXAM"
  | "ADMIN";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  normalizedRole?: NormalizedRole;
  batchNumber?: string;
  institutionalId?: string;
  studentId?: string;
  mustChangePassword?: boolean;
}

export const normalizeRole = (role?: string): NormalizedRole => {
  if (!role) return "STUDENT";
  const upper = role.toUpperCase();
  if (upper.includes("ADMIN")) return "ADMIN";
  if (upper.includes("EXAM")) return "EXAM";
  if (upper.includes("MARKETING")) return "MARKETING";
  if (upper.includes("FINANCE")) return "FINANCE";
  if (upper.includes("ACADEMIC") || upper.includes("LECTURER")) return "ACADEMIC";
  return "STUDENT";
};

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  updateCurrentUser: (user: Partial<AuthUser>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore the saved login when the application starts
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("ijse_token") || localStorage.getItem("token");
      const savedUserStr = localStorage.getItem("ijse_user") || localStorage.getItem("user");

      if (savedToken && savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        parsed.normalizedRole = normalizeRole(parsed.role);
        setToken(savedToken);
        setUser(parsed as AuthUser);
      }
    } catch {
      localStorage.removeItem("ijse_token");
      localStorage.removeItem("ijse_user");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  // Login using the backend API
  const login = async (email: string, password: string): Promise<AuthUser> => {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Login failed");
    }

    const rawUser = result.data?.user || result.user;
    const accessToken = (result.data?.token || result.token || result.accessToken) as string;

    if (!rawUser || !accessToken) {
      throw new Error("Invalid login response from server");
    }

    const loggedInUser: AuthUser = {
      ...rawUser,
      normalizedRole: normalizeRole(rawUser.role)
    };

    localStorage.setItem("ijse_token", accessToken);
    localStorage.setItem("token", accessToken);
    localStorage.setItem("ijse_user", JSON.stringify(loggedInUser));
    localStorage.setItem("user", JSON.stringify(loggedInUser));

    setUser(loggedInUser);
    setToken(accessToken);

    return loggedInUser;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("ijse_token");
    localStorage.removeItem("ijse_user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setToken(null);
  };

  const updateCurrentUser = (partial: Partial<AuthUser>) => {
    if (!user) return;
    const updated = { ...user, ...partial };
    if (updated.role) {
      updated.normalizedRole = normalizeRole(updated.role);
    }
    localStorage.setItem("ijse_user", JSON.stringify(updated));
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, updateCurrentUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
