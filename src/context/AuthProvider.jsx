// ============================================================================
// PROVEEDOR DE CONTEXTO DE AUTENTICACIÓN (AuthProvider.jsx)
// Utiliza la API de Contexto de React para compartir el estado del usuario activo
// (iniciado sesión, token, función de login y logout) a toda la aplicación.
// ============================================================================

import { useState } from "react";
import { AuthContext } from "./AuthContext";
import { loginUsuarioAPI } from "../services/auth.service";

export function AuthProvider({ children }) {
  // Inicializamos el estado 'user' leyendo sincrónicamente del localStorage
  // Si el usuario ya había iniciado sesión previamente, recuperamos sus datos
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("la_finca_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  /**
   * FUNCIÓN DE LOGIN
   * Llama a la API backend para verificar credenciales y guarda el usuario/token en localStorage.
   */
  const login = async (email, password) => {
    const data = await loginUsuarioAPI(email, password);
    
    // Guardamos el usuario en el estado global de React
    setUser(data.user);
    
    // Persistimos el Token y los datos del usuario en el almacenamiento local del navegador
    localStorage.setItem("la_finca_token", data.token);
    localStorage.setItem("la_finca_user", JSON.stringify(data.user));
    
    return data.user;
  };

  /**
   * FUNCIÓN DE LOGOUT
   * Limpia la sesión del estado global de React y elimina los datos guardados en el navegador.
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem("la_finca_token");
    localStorage.removeItem("la_finca_user");
  };

  // AuthContext.Provider envuelve los componentes hijos (children) y les comparte el objeto value
  return (
    <AuthContext.Provider value={{ user, login, logout, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export { useAuth } from "./AuthContext";
