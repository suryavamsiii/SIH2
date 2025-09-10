import { apiRequest } from "./queryClient";

export interface User {
  id: string;
  username: string;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  profile: any | null;
  token: string | null;
}

export const auth = {
  getToken(): string | null {
    return localStorage.getItem("auth_token");
  },

  setToken(token: string): void {
    localStorage.setItem("auth_token", token);
  },

  removeToken(): void {
    localStorage.removeItem("auth_token");
  },

  async login(username: string, password: string): Promise<AuthState> {
    const response = await apiRequest("POST", "/api/auth/login", {
      username,
      password,
    });
    
    const data = await response.json();
    this.setToken(data.token);
    
    return {
      user: data.user,
      profile: data.profile || null,
      token: data.token,
    };
  },

  async register(userData: any): Promise<AuthState> {
    const response = await apiRequest("POST", "/api/auth/register", userData);
    
    const data = await response.json();
    this.setToken(data.token);
    
    return {
      user: data.user,
      profile: data.profile || null,
      token: data.token,
    };
  },

  async me(): Promise<AuthState> {
    const token = this.getToken();
    if (!token) {
      throw new Error("No token available");
    }

    const response = await fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      this.removeToken();
      throw new Error("Authentication failed");
    }

    const data = await response.json();
    
    return {
      user: data.user,
      profile: data.profile || null,
      token,
    };
  },

  logout(): void {
    this.removeToken();
  },
};
