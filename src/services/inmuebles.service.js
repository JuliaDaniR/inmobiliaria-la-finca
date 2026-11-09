
import clienteApi from "../api/axios";

// ==========================================
// OBTENER TODOS LOS INMUEBLES
// ==========================================
export const getInmuebles = async () => {
  try {
    const respuesta = await clienteApi.get("/inmuebles");
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener inmuebles:", error);
    return [];
  }
};

// ==========================================
// OBTENER UN INMUEBLE POR ID
// ==========================================
export const getInmuebleById = async (id) => {
  try {
    const respuesta = await clienteApi.get(`/inmuebles/${id}`);
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener el inmueble:", error);
    return null;
  }
};

// ==========================================
// CREAR UN INMUEBLE
// ==========================================
export const crearInmueble = async (datosInmueble) => {
  try {
    const respuesta = await clienteApi.post(
      "/inmuebles",
      datosInmueble
    );

    return respuesta.data;
  } catch (error) {
    console.error("Error al crear el inmueble:", error);
    throw error;
  }
};

// ==========================================
// EDITAR UN INMUEBLE
// ==========================================
export const editarInmueble = async (id, datosInmueble) => {
  try {
    const respuesta = await clienteApi.put(
      `/inmuebles/${id}`,
      datosInmueble
    );

    return respuesta.data;
  } catch (error) {
    console.error("Error al editar el inmueble:", error);
    throw error;
  }
};

// ==========================================
// ELIMINAR UN INMUEBLE
// ==========================================
export const eliminarInmueble = async (id) => {
  try {
    const respuesta = await clienteApi.delete(
      `/inmuebles/${id}`
    );

    return respuesta.data;
  } catch (error) {
    console.error("Error al eliminar el inmueble:", error);
    throw error;
  }
};
