// ============================================================================
// SERVICIO DE RECIBOS (recibos.service.js)
// Centraliza las peticiones HTTP para la gestión de recibos mensuales.
// ============================================================================

import clienteApi from "../api/axios";

// 1. Obtener lista de recibos (admite filtros como { estado: 'PENDIENTE', id_inmueble: 1 })
export const getRecibos = async (filtros = {}) => {
  try {
    const response = await clienteApi.get("/recibos", { params: filtros });
    return response.data;
  } catch (error) {
    console.error("Error al obtener recibos:", error);
    return [];
  }
};

// 2. Obtener un recibo por su ID con sus conceptos
export const getReciboPorId = async (id) => {
  try {
    const response = await clienteApi.get(`/recibos/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener recibo por ID:", error);
    throw new Error(
      error.response?.data?.message || "Error al obtener el recibo",
      { cause: error }
    );
  }
};

// 3. Generar nuevo recibo mensual (CU-01)
export const crearRecibo = async (reciboData) => {
  try {
    const response = await clienteApi.post("/recibos", reciboData);
    return response.data;
  } catch (error) {
    console.error("Error al crear recibo:", error);
    throw new Error(
      error.response?.data?.message || "Error al generar el recibo",
      { cause: error }
    );
  }
};

// 4. Copiar recibo del mes anterior (CU-02)
export const copiarRecibo = async (id, nuevoPeriodoData) => {
  try {
    const response = await clienteApi.post(
      `/recibos/${id}/copiar`,
      nuevoPeriodoData
    );
    return response.data;
  } catch (error) {
    console.error("Error al copiar recibo:", error);
    throw new Error(
      error.response?.data?.message || "Error al copiar el recibo",
      { cause: error }
    );
  }
};

// 5. Modificar recibo existente (CU-03)
export const editarRecibo = async (id, reciboData) => {
  try {
    const response = await clienteApi.put(`/recibos/${id}`, reciboData);
    return response.data;
  } catch (error) {
    console.error("Error al editar recibo:", error);
    throw new Error(
      error.response?.data?.message || "Error al modificar el recibo",
      { cause: error }
    );
  }
};

// 6. Cambiar estado de pago (PAGADO / PENDIENTE) (CU-04)
export const cambiarEstadoRecibo = async (id, estado, datosExtra = {}) => {
  try {
    const response = await clienteApi.patch(`/recibos/${id}/estado`, {
      estado,
      ...datosExtra,
    });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar estado del recibo:", error);
    throw new Error(
      error.response?.data?.message || "Error al actualizar estado del recibo",
      { cause: error }
    );
  }
};

// 7. Eliminar recibo
export const eliminarRecibo = async (id) => {
  try {
    const response = await clienteApi.delete(`/recibos/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar recibo:", error);
    throw new Error(
      error.response?.data?.message || "Error al eliminar el recibo",
      { cause: error }
    );
  }
};