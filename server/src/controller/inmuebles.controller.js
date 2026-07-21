import pool from "../db.js";

// Obtener todos los inmuebles
export const obtenerInmuebles = async (req, res) => {
  try {
    const [inmuebles] = await pool.query("SELECT * FROM inmuebles ORDER BY id DESC");
    return res.status(200).json(inmuebles);
  } catch (error) {
    console.error("Error al obtener los inmuebles: ", error);
    return res.status(500).json({ message: "Error interno del servidor al obtener inmuebles." });
  }
};

// Obtener un inmueble por su ID
export const obtenerInmueblePorId = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query("SELECT * FROM inmuebles WHERE id = ?", [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Inmueble no encontrado." });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error al obtener el inmueble: ", error);
    return res.status(500).json({ message: "Error interno del servidor al obtener el inmueble." });
  }
};
