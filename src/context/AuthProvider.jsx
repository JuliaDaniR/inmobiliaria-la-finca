import { useEffect, useContext, useState } from "react";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("la_finca_session");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  //Funcion simulada para el login
  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let rol = "CLIENTE";
        let nombre = "Javier";
        let apellido = "Gomez";

        //Si inicia con 'secretario@lafinca.com', le asignamos rol administrativo
        if (email.toLowerCase() === "secretario@lafinca.com") {
          rol = "SECRETARIO";
          nombre = "Carlos";
          apellido = "Mendoza";
        }

        const userData = {
          email: email,
          nombre: nombre,
          apellido: apellido,
          rol: rol,
          avatar:
            rol === "SECRETARIO"
              ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              : null,
        };

        setUser(userData);

        localStorage.setItem("la_finca_session", JSON.stringify(userData));
        resolve(userData);
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("la_finca_session");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Hook personalizado
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
