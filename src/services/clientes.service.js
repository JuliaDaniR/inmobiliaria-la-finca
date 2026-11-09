// ============================================================================
// SERVICIO DE CLIENTES (clientes.service.js)
// Realiza las peticiones al backend para gestionar los clientes utilizando clienteApi (Axios).
// ============================================================================

import clienteApi from "../api/axios";

// ============================================================================
// OBTENER LISTA DE CLIENTES
// ============================================================================

export const getClientes = async () => {
  try {
    const response = await clienteApi.get("/usuarios/clientes");
    return response.data;
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return [];
  }
};

// ============================================================================
// OBTENER CLIENTE POR ID
// ============================================================================

export const getClientePorId = async (id) => {
  try {
    const response = await clienteApi.get(`/usuarios/clientes/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener cliente:", error);
    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.mensaje ||
        "Error al obtener el cliente",
      { cause: error }
    );
  }
};

// ============================================================================
// CREAR CLIENTE (Soporta JSON o FormData con archivo de imagen)
// ============================================================================

export const crearCliente = async (clienteData) => {
  try {
    const response = await clienteApi.post(
      "/usuarios/clientes",
      clienteData
    );
    return response.data;
  } catch (error) {
    console.error("Error al crear cliente:", error);
    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.mensaje ||
        "Error al crear el cliente",
      { cause: error }
    );
  }
};

// ============================================================================
// EDITAR CLIENTE (Soporta JSON o FormData con archivo de imagen)
// ============================================================================

export const editarCliente = async (id, clienteData) => {
  try {
    const response = await clienteApi.put(
      `/usuarios/clientes/${id}`,
      clienteData
    );
    return response.data;
  } catch (error) {
    console.error("Error al editar cliente:", error);
    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.mensaje ||
        "Error al editar el cliente",
      { cause: error }
    );
  }
};

// ============================================================================
// ELIMINAR CLIENTE
// ============================================================================

export const eliminarCliente = async (id) => {
  try {
    const response = await clienteApi.delete(`/usuarios/clientes/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.mensaje ||
        "Error al eliminar el cliente",
      { cause: error }
    );
  }
};
