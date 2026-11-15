
import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type UserRole =
  | "SUPER_ADMIN"
  | "MARKETING_OFFICER"
  | "FINANCE_OFFICER"
  | "ACADEMIC_OFFICER"
  | "EXAM_OFFICER"
  | "LECTURER"
  | "STUDENT";
  
export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore the saved login when the application starts
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("ijse_token");
      const savedUser = localStorage.getItem("ijse_user");

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser) as AuthUser);
      }
    } catch {
      localStorage.removeItem("ijse_token");
      localStorage.removeItem("ijse_user");
    } finally {
      setLoading(false);
    }
  }, []);

  // Login using the backend API
  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
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

    const loggedInUser = result.data.user as AuthUser;
    const accessToken = result.data.token as string;

    if (!loggedInUser || !accessToken) {
      throw new Error("Invalid login response from server");
    }

    localStorage.setItem("ijse_token", accessToken);
    localStorage.setItem("ijse_user", JSON.stringify(loggedInUser));

    setUser(loggedInUser);
    setToken(accessToken);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("ijse_token");
    localStorage.removeItem("ijse_user");

    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
