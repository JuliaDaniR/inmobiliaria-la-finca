// ============================================================================
// SERVICIO DE INMUEBLES (inmuebles.service.js)
// Realiza las peticiones GET para obtener la lista de propiedades y detalles.
// ============================================================================

const API_URL = "http://localhost:4000/api/inmuebles";

/**
 * OBTENER LISTA DE INMUEBLES
 * Realiza una petición GET al endpoint /api/inmuebles.
 */
export const getInmuebles = async () => {
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
    console.error("Error al obtener inmuebles:", error);
    return []; // En caso de fallo, devolvemos un arreglo vacío de respaldo
  }
};

/**
 * OBTENER DETALLE DE UN INMUEBLE POR ID
 * Realiza una petición GET enviando el ID en la URL (/api/inmuebles/:id).
 */
export const getInmuebleById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "GET",
    });
    
    if (!response.ok) {
      throw new Error(`Error HTTP! estado: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener el inmueble por ID:", error);
    return null;
  }
};
