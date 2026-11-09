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



/* ============================================================================
   CREAR INMUEBLE
   ============================================================================ */

export const crearInmueble = async (req, res) => {
  // Solo los usuarios con rol SECRETARIO pueden gestionar inmuebles.
  if (req.usuarioAutenticado?.rol !== "SECRETARIO") {
    return res.status(403).json({
      message: "No tienes permisos para crear inmuebles.",
    });
  }

  const {
    tipo_inmueble,
    precio,
    direccion,
    localidad,
    provincia,
    estado,
    fotos,
    observaciones,
  } = req.body;

  if (!tipo_inmueble?.trim() || !direccion?.trim()) {
    return res.status(400).json({
      message: "El tipo de inmueble y la dirección son obligatorios.",
    });
  }

  if (precio === undefined || precio === "" || !Number.isFinite(Number(precio)) || Number(precio) < 0) {
    return res.status(400).json({
      message: "El precio debe ser un número válido y no negativo.",
    });
  }

  try {
    const rutaFoto = req.file
      ? `/uploads/${req.file.filename}`
      : (fotos || null);

    const sql = `
      INSERT INTO inmuebles
      (
        id_usuario,
        tipo_inmueble,
        precio,
        direccion,
        localidad,
        provincia,
        estado,
        fotos,
        observaciones
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      req.usuarioAutenticado.id,
      tipo_inmueble.trim(),
      precio,
      direccion.trim(),
      localidad || null,
      provincia || null,
      estado || "DISPONIBLE",
      rutaFoto,
      observaciones || null,
    ];

    const [resultado] = await pool.query(sql, values);

    return res.status(201).json({
      message: "Inmueble creado exitosamente.",
      id: resultado.insertId,
    });
  } catch (error) {
    console.error("Error al crear el inmueble:", error);

    return res.status(500).json({
      message: "Error interno del servidor al crear el inmueble.",
    });
  }
};

/* ============================================================================
   EDITAR INMUEBLE
   ============================================================================ */

export const editarInmueble = async (req, res) => {
  if (req.usuarioAutenticado?.rol !== "SECRETARIO") {
    return res.status(403).json({
      message: "No tienes permisos para editar inmuebles.",
    });
  }

  const { id } = req.params;

  const {
    tipo_inmueble,
    precio,
    direccion,
    localidad,
    provincia,
    estado,
    fotos,
    observaciones,
  } = req.body;

  if (!tipo_inmueble?.trim() || !direccion?.trim()) {
    return res.status(400).json({
      message: "El tipo de inmueble y la dirección son obligatorios.",
    });
  }

  if (precio === undefined || precio === "" || !Number.isFinite(Number(precio)) || Number(precio) < 0) {
    return res.status(400).json({
      message: "El precio debe ser un número válido y no negativo.",
    });
  }

  try {
    const [inmuebles] = await pool.query(
      "SELECT id, fotos FROM inmuebles WHERE id = ?",
      [id]
    );

    if (inmuebles.length === 0) {
      return res.status(404).json({
        message: "Inmueble no encontrado.",
      });
    }

    // Si no se sube otra imagen, se conserva la fotografía actual.
    let rutaFoto = inmuebles[0].fotos;

    if (req.file) {
      rutaFoto = `/uploads/${req.file.filename}`;
    } else if (fotos !== undefined) {
      rutaFoto = fotos || null;
    }

    const sql = `
      UPDATE inmuebles
      SET
        tipo_inmueble = ?,
        precio = ?,
        direccion = ?,
        localidad = ?,
        provincia = ?,
        estado = ?,
        fotos = ?,
        observaciones = ?
      WHERE id = ?
    `;

    const values = [
      tipo_inmueble.trim(),
      precio,
      direccion.trim(),
      localidad || null,
      provincia || null,
      estado || "DISPONIBLE",
      rutaFoto,
      observaciones || null,
      id,
    ];

    await pool.query(sql, values);

    return res.status(200).json({
      message: "Inmueble actualizado exitosamente.",
    });
  } catch (error) {
    console.error("Error al editar el inmueble:", error);

    return res.status(500).json({
      message: "Error interno del servidor al editar el inmueble.",
    });
  }
};

/* ============================================================================
   ELIMINAR INMUEBLE
   ============================================================================ */

export const eliminarInmueble = async (req, res) => {
  if (req.usuarioAutenticado?.rol !== "SECRETARIO") {
    return res.status(403).json({
      message: "No tienes permisos para eliminar inmuebles.",
    });
  }

  const { id } = req.params;

  try {
    const [inmuebles] = await pool.query(
      "SELECT id FROM inmuebles WHERE id = ?",
      [id]
    );

    if (inmuebles.length === 0) {
      return res.status(404).json({
        message: "Inmueble no encontrado.",
      });
    }

    await pool.query(
      "DELETE FROM inmuebles WHERE id = ?",
      [id]
    );

    return res.status(200).json({
      message: "Inmueble eliminado exitosamente.",
    });
  } catch (error) {
    console.error("Error al eliminar el inmueble:", error);

    return res.status(500).json({
      message: "Error interno del servidor al eliminar el inmueble.",
    });
  }
};
