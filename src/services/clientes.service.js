// ============================================================================
// SERVICIO DE CLIENTES (clientes.service.js)
// Realiza las peticiones al backend para gestionar los clientes.
// ============================================================================

const API_URL = "http://localhost:4000/api/usuarios/clientes";

// ============================================================================
// OBTENER LISTA DE CLIENTES
// ============================================================================

export const getClientes = async () => {
  try {
    const response = await fetch(API_URL, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Error HTTP! estado: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return [];
  }
};

// ============================================================================
// CREAR CLIENTE
// ============================================================================

export const crearCliente = async (cliente) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cliente),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || "Error al crear el cliente");
    }

    return data;
  } catch (error) {
    console.error("Error al crear cliente:", error);
    throw error;
  }
};

// ============================================================================
// EDITAR CLIENTE
// ============================================================================

export const editarCliente = async (id, cliente) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cliente),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || "Error al editar el cliente");
    }

    return data;
  } catch (error) {
    console.error("Error al editar cliente:", error);
    throw error;
  }
};

// ============================================================================
// ELIMINAR CLIENTE
// ============================================================================

export const eliminarCliente = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || "Error al eliminar el cliente");
    }

    return data;
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    throw error;
  }
};