// ============================================================================
// CONTROLADOR DE INMUEBLES (inmuebles.controller.js)
// Lógica para consultar las propiedades de la base de datos MySQL.
// ============================================================================

import pool from "../db.js";

/**
 * OBTENER TODOS LOS INMUEBLES
 * Realiza una consulta SQL SELECT para obtener la lista de propiedades ordenadas por ID.
 */
export const obtenerInmuebles = async (req, res) => {
  try {
    // pool.query ejecuta la consulta SQL en MySQL de forma asíncrona (async/await)
    const [inmuebles] = await pool.query("SELECT * FROM inmuebles ORDER BY id DESC");
    
    // Devolvemos la lista en formato JSON con estado HTTP 200 (OK)
    return res.status(200).json(inmuebles);
  } catch (error) {
    console.error("Error al obtener los inmuebles: ", error);
    return res.status(500).json({ message: "Error interno del servidor al obtener inmuebles." });
  }
};

/**
 * OBTENER UN INMUEBLE POR SU ID
 * Recibe el id como parámetro en la URL (req.params.id) y busca el registro específico.
 */
export const obtenerInmueblePorId = async (req, res) => {
  // Desestructuramos el parámetro 'id' de la URL (ej: /api/inmuebles/3 -> id = 3)
  const { id } = req.params;

  try {
    // Usamos el marcador de posición '?' para evitar inyección de SQL
    const [rows] = await pool.query("SELECT * FROM inmuebles WHERE id = ?", [id]);
    
    // Si la consulta no devuelve ningún resultado, respondemos con HTTP 404 (No encontrado)
    if (rows.length === 0) {
      return res.status(404).json({ message: "Inmueble no encontrado." });
    }

    // Retornamos el primer objeto encontrado
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error al obtener el inmueble: ", error);
    return res.status(500).json({ message: "Error interno del servidor al obtener el inmueble." });
  }
};
