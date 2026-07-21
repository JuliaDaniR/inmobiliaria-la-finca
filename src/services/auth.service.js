// ============================================================================
// SERVICIO DE AUTENTICACIÓN (auth.service.js)
// Centraliza las peticiones HTTP (fetch) dirigidas a la API del backend para usuarios.
// ============================================================================

const API_URL = "http://localhost:4000/api/usuarios";

/**
 * PETICIÓN DE REGISTRO
 * Envía los datos del nuevo usuario al backend (/api/usuarios/registro).
 */
export const registrarUsuarioAPI = async (userData) => {
  // Creamos una copia del objeto y eliminamos confirmPassword ya que solo se usa en el frontend para comparar
  const payload = { ...userData };
  delete payload.confirmPassword;

  // Realizamos la petición HTTP POST enviando el cuerpo en formato JSON
  const response = await fetch(`${API_URL}/registro`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  
  // Si la respuesta del servidor no fue exitosa (status >= 400), lanzamos un error con el mensaje devuelto
  if (!response.ok) {
    throw new Error(data.message || "Error al registrar el usuario");
  }
  
  return data;
};

/**
 * PETICIÓN DE LOGIN
 * Envía el correo y la contraseña al backend (/api/usuarios/login).
 */
export const loginUsuarioAPI = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || "Credenciales inválidas");
  }
  
  return data; // Deuelve { token, user: { ... } }
};
