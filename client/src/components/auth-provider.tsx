import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth, type AuthState, type User } from "@/lib/auth";

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    token: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = auth.getToken();
    if (token) {
      auth.me()
        .then(setState)
        .catch(() => auth.logout())
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const authState = await auth.login(username, password);
    setState(authState);
  };

  const register = async (userData: any) => {
    const authState = await auth.register(userData);
    setState(authState);
  };

  const logout = () => {
    auth.logout();
    setState({ user: null, profile: null, token: null });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
