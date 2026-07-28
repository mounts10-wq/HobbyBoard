import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function checkCurrentUser() {
      const token = localStorage.getItem("token");

      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const data = await apiRequest("/me");
        setUser(data.user);
      } catch (error) {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    }

    checkCurrentUser();
  }, []);

  async function signup(formData) {
    const data = await apiRequest("/signup", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    localStorage.setItem("token", data.access_token);
    setUser(data.user);

    return data;
  }

  async function login(formData) {
    const data = await apiRequest("/login", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    localStorage.setItem("token", data.access_token);
    setUser(data.user);

    return data;
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        signup,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}