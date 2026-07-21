export const getInmuebles = async () => {
  try {
    const response = await fetch("http://localhost:3000/inmuebles", {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching inmuebles:", error);
    return [];
  }
};

export const getInmuebleById = async(id) => {
    try {
    const response = await fetch(`http://localhost:3000/inmuebles/${id}`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching inmuebles:", error);
    return null;
  }
}