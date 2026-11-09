// ============================================================================
// SERVICIO DE AUTENTICACIÓN (auth.service.js)
// Centraliza las peticiones HTTP mediante clienteApi (Axios) para usuarios.
// ============================================================================

import clienteApi from "../api/axios";

/**
 * PETICIÓN DE REGISTRO
 * Envía los datos del nuevo usuario al backend (/api/usuarios/registro).
 */
export const registrarUsuarioAPI = async (userData) => {
  try {
    const payload = { ...userData };
    delete payload.confirmPassword;

    const response = await clienteApi.post("/usuarios/registro", payload);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.mensaje ||
        "Error al registrar el usuario",
      { cause: error }
    );
  }
};

/**
 * PETICIÓN DE LOGIN
 * Envía el correo y la contraseña al backend (/api/usuarios/login).
 */
export const loginUsuarioAPI = async (email, password) => {
  try {
    const response = await clienteApi.post("/usuarios/login", {
      email,
      password,
    });
    return response.data; // Devuelve { token, user: { ... } }
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.mensaje ||
        "Credenciales inválidas",
      { cause: error }
    );
  }
};
