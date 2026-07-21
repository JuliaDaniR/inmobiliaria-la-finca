const API_URL = "http://localhost:4000/api/inmuebles";

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
    return [];
  }
};

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
