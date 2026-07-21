import { useState } from "react";
import { AuthContext } from "./AuthContext";
import { loginUsuarioAPI } from "../services/auth.service";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("la_finca_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email, password) => {
    const data = await loginUsuarioAPI(email, password);
    setUser(data.user);
    localStorage.setItem("la_finca_token", data.token);
    localStorage.setItem("la_finca_user", JSON.stringify(data.user));
    return data.user;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("la_finca_token");
    localStorage.removeItem("la_finca_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export { useAuth } from "./AuthContext";
