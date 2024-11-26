import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface AuthContextType {
  user: string | null;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);

  // Configure Axios Base URL
  axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (token) {
      setUser("authenticated"); // Replace with user details if necessary
    } else if (refreshToken) {
      refreshAccessToken(refreshToken);
    }
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    try {
      const response = await axios.post("/users/auth/login/", { email, password });
      console.log("Login Response:", response.data); // Log the full response for debugging
  
      const { access, refresh, user } = response.data; // Ensure the structure matches your API response
      console.log("User Data:", user); // Debug user object
  
      localStorage.setItem("accessToken", access);
      if (rememberMe) {
        localStorage.setItem("refreshToken", refresh);
      }
      localStorage.setItem("userId", user.id); // Store userId in localStorage
      setUser(user); // Update user state with full user details
    } catch (error: any) {
      console.error("Login Error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || "Login failed. Check your credentials.");
    }
  };
  
  

  const refreshAccessToken = async (refreshToken: string) => {
    try {
      const response = await axios.post("/users/auth/token/refresh/", { refresh: refreshToken });
      const { access, user } = response.data; // Assuming `user` is included in the response
  
      localStorage.setItem("accessToken", access);
      if (user) {
        localStorage.setItem("userId", user.id); // Update userId in localStorage
        setUser(user);
      }
    } catch (error) {
      console.error("Failed to refresh token:", error);
      logout();
    }
  };
  

  const signup = async (email: string, username: string, password: string) => {
    try {
      await axios.post("/auth/register/", { email, username, password });
    } catch (error: any) {
      console.error("Signup Error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || "Signup failed. Try again.");
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
