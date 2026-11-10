/* global process */
import pool from "../db.js";

// ============================================================================
// 1. OBTENER TODOS LOS RECIBOS (con filtros opcionales de estado y período)
// ============================================================================
export const obtenerRecibos = async (req, res) => {
  const { estado, id_inmueble } = req.query;

  try {
    let sql = `
      SELECT 
        r.*,
        i.direccion AS inmueble_direccion,
        i.tipo_inmueble,
        i.localidad AS inmueble_localidad,
        u.nombre AS inquilino_nombre,
        u.apellido AS inquilino_apellido,
        u.dni AS inquilino_dni,
        u.email AS inquilino_email
      FROM recibos r
      LEFT JOIN inmuebles i ON r.id_inmueble = i.id
      LEFT JOIN usuarios u ON r.id_cliente = u.id
      WHERE 1=1
    `;
    const params = [];

    // Si quien consulta es un CLIENTE, solo ve sus propios recibos
    if (req.usuarioAutenticado?.rol === "CLIENTE") {
      sql += " AND r.id_cliente = ?";
      params.push(req.usuarioAutenticado.id);
    } else if (req.query.id_cliente) {
      sql += " AND r.id_cliente = ?";
      params.push(req.query.id_cliente);
    }

    if (estado) {
      sql += " AND r.estado = ?";
      params.push(estado);
    }

    if (id_inmueble) {
      sql += " AND r.id_inmueble = ?";
      params.push(id_inmueble);
    }

    sql += " ORDER BY r.fecha_emision DESC, r.id DESC";

    const [recibos] = await pool.query(sql, params);

    // Adjuntar los conceptos a cada recibo
    for (const recibo of recibos) {
      const [conceptos] = await pool.query(
        "SELECT id, concepto, monto, es_obligatorio FROM conceptos_recibo WHERE id_recibo = ?",
        [recibo.id]
      );
      recibo.conceptos = conceptos;
    }

    return res.status(200).json(recibos);
  } catch (error) {
    console.error("Error al obtener recibos:", error);
    return res.status(500).json({
      message: "Error interno del servidor al obtener los recibos.",
    });
  }
};

// ============================================================================
// 2. OBTENER RECIBO POR ID (para ver detalle o imprimir)
// ============================================================================
export const obtenerReciboPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT 
        r.*,
        i.direccion AS inmueble_direccion,
        i.tipo_inmueble,
        i.localidad AS inmueble_localidad,
        i.provincia AS inmueble_provincia,
        u.nombre AS inquilino_nombre,
        u.apellido AS inquilino_apellido,
        u.dni AS inquilino_dni,
        u.telefono AS inquilino_telefono,
        u.email AS inquilino_email
      FROM recibos r
      LEFT JOIN inmuebles i ON r.id_inmueble = i.id
      LEFT JOIN usuarios u ON r.id_cliente = u.id
      WHERE r.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Recibo no encontrado." });
    }

    const recibo = rows[0];

    const [conceptos] = await pool.query(
      "SELECT id, concepto, monto, es_obligatorio FROM conceptos_recibo WHERE id_recibo = ?",
      [id]
    );
    recibo.conceptos = conceptos;

    return res.status(200).json(recibo);
  } catch (error) {
    console.error("Error al obtener recibo:", error);
    return res.status(500).json({ message: "Error al obtener el recibo." });
  }
};

// ============================================================================
// 3. CREAR RECIBO (CU-01: Generar recibo mensual)
// ============================================================================
export const crearRecibo = async (req, res) => {
  const {
    numero_recibo,
    id_inmueble,
    id_cliente,
    fecha_emision,
    periodo,
    conceptos = [],
    observaciones,
  } = req.body;

  if (!numero_recibo || !id_inmueble || !fecha_emision || !periodo) {
    return res.status(400).json({
      message: "Número de recibo, inmueble, fecha de emisión y período son obligatorios.",
    });
  }

  // Calcular total sumando los conceptos
  const total = conceptos.reduce(
    (acc, c) => acc + (parseFloat(c.monto) || 0),
    0
  );

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO recibos 
        (numero_recibo, id_inmueble, id_cliente, fecha_emision, periodo, total, estado, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDIENTE', ?)`,
      [
        numero_recibo.trim(),
        id_inmueble,
        id_cliente || null,
        fecha_emision,
        periodo.trim(),
        total,
        observaciones || null,
      ]
    );

    const idRecibo = result.insertId;

    // Insertar cada concepto si existen
    for (const c of conceptos) {
      await connection.query(
        `INSERT INTO conceptos_recibo (id_recibo, concepto, monto, es_obligatorio)
         VALUES (?, ?, ?, ?)`,
        [
          idRecibo,
          c.concepto.trim(),
          parseFloat(c.monto) || 0,
          c.es_obligatorio ? 1 : 0,
        ]
      );
    }

    await connection.commit();

    return res.status(201).json({
      message: "Recibo generado exitosamente.",
      id: idRecibo,
      total,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error al crear recibo:", error);
    return res.status(500).json({
      message: "Error interno al crear el recibo.",
    });
  } finally {
    connection.release();
  }
};

// ============================================================================
// 4. COPIAR RECIBO DEL MES ANTERIOR (CU-02)
// ============================================================================
export const copiarRecibo = async (req, res) => {
  const { id } = req.params; // ID del recibo a clonar
  const { nuevo_periodo, nueva_fecha_emision } = req.body;

  if (!nuevo_periodo) {
    return res.status(400).json({
      message: "El nuevo período es obligatorio (ej. 'Noviembre 2026').",
    });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Obtener recibo original
    const [origen] = await connection.query(
      "SELECT * FROM recibos WHERE id = ?",
      [id]
    );

    if (origen.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Recibo de origen no encontrado." });
    }

    const r = origen[0];
    const fechaEmision = nueva_fecha_emision || new Date().toISOString().split("T")[0];

    // Crear nuevo recibo basado en el anterior (el número de recibo no varía para el inmueble)
    const [resultNuevo] = await connection.query(
      `INSERT INTO recibos 
        (numero_recibo, id_inmueble, id_cliente, fecha_emision, periodo, total, estado, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDIENTE', ?)`,
      [
        r.numero_recibo,
        r.id_inmueble,
        r.id_cliente,
        fechaEmision,
        nuevo_periodo.trim(),
        r.total,
        r.observaciones,
      ]
    );

    const nuevoId = resultNuevo.insertId;

    // Clonar conceptos
    const [conceptos] = await connection.query(
      "SELECT concepto, monto, es_obligatorio FROM conceptos_recibo WHERE id_recibo = ?",
      [id]
    );

    for (const c of conceptos) {
      await connection.query(
        `INSERT INTO conceptos_recibo (id_recibo, concepto, monto, es_obligatorio)
         VALUES (?, ?, ?, ?)`,
        [nuevoId, c.concepto, c.monto, c.es_obligatorio]
      );
    }

    await connection.commit();

    return res.status(201).json({
      message: "Recibo duplicado exitosamente para el nuevo período.",
      id: nuevoId,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error al copiar recibo:", error);
    return res.status(500).json({ message: "Error interno al copiar recibo." });
  } finally {
    connection.release();
  }
};

// ============================================================================
// 5. EDITAR RECIBO (CU-03: Modificar recibo)
// ============================================================================
export const editarRecibo = async (req, res) => {
  const { id } = req.params;
  const {
    numero_recibo,
    fecha_emision,
    periodo,
    conceptos = [],
    observaciones,
  } = req.body;

  const total = conceptos.reduce(
    (acc, c) => acc + (parseFloat(c.monto) || 0),
    0
  );

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE recibos 
       SET numero_recibo = ?, fecha_emision = ?, periodo = ?, total = ?, observaciones = ?
       WHERE id = ?`,
      [
        numero_recibo,
        fecha_emision,
        periodo,
        total,
        observaciones || null,
        id,
      ]
    );

    // Reemplazar conceptos
    await connection.query("DELETE FROM conceptos_recibo WHERE id_recibo = ?", [
      id,
    ]);

    for (const c of conceptos) {
      await connection.query(
        `INSERT INTO conceptos_recibo (id_recibo, concepto, monto, es_obligatorio)
         VALUES (?, ?, ?, ?)`,
        [id, c.concepto.trim(), parseFloat(c.monto) || 0, c.es_obligatorio ? 1 : 0]
      );
    }

    await connection.commit();

    return res.status(200).json({
      message: "Recibo actualizado correctamente.",
      total,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error al editar recibo:", error);
    return res.status(500).json({ message: "Error al actualizar el recibo." });
  } finally {
    connection.release();
  }
};

// ============================================================================
// 6. CAMBIAR ESTADO DE PAGO (CU-04: Registrar estado de pago)
// ============================================================================
export const cambiarEstadoPago = async (req, res) => {
  const { id } = req.params;
  const { estado, id_cuenta } = req.body; // 'COBRADO' o 'PENDIENTE'

  if (!["PENDIENTE", "COBRADO"].includes(estado)) {
    return res.status(400).json({
      message: "El estado debe ser 'PENDIENTE' o 'COBRADO'.",
    });
  }

  // Si quien realiza la petición es un CLIENTE, verificar que el recibo sea suyo
  if (req.usuarioAutenticado?.rol === "CLIENTE") {
    const [verif] = await pool.query(
      "SELECT id_cliente FROM recibos WHERE id = ?",
      [id]
    );
    if (!verif.length || verif[0].id_cliente !== req.usuarioAutenticado.id) {
      return res.status(403).json({
        message: "No tienes permiso para abonar este recibo.",
      });
    }
  }

  const fechaCobro = estado === "COBRADO" ? new Date().toISOString().split("T")[0] : null;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      "UPDATE recibos SET estado = ?, fecha_cobro = ? WHERE id = ?",
      [estado, fechaCobro, id]
    );

    // Si se abona el recibo, registrar automáticamente el movimiento bancario de INGRESO
    if (estado === "COBRADO") {
      const [rec] = await connection.query(
        `SELECT r.total, r.numero_recibo, r.id_inmueble, u.nombre, u.apellido 
         FROM recibos r 
         LEFT JOIN usuarios u ON r.id_cliente = u.id 
         WHERE r.id = ?`,
        [id]
      );

      if (rec.length > 0) {
        const cuentaDestino = id_cuenta || 1; // Santander por defecto
        const clienteNom = rec[0].nombre ? `${rec[0].nombre} ${rec[0].apellido}` : "Inquilino";

        await connection.query(
          `INSERT INTO movimientos_bancarios (id_cuenta, id_inmueble, id_recibo, tipo, categoria, monto, fecha, descripcion)
           VALUES (?, ?, ?, 'INGRESO', 'Cobro de Alquiler', ?, ?, ?)`,
          [
            cuentaDestino,
            rec[0].id_inmueble,
            id,
            rec[0].total,
            fechaCobro,
            `Cobro online recibo ${rec[0].numero_recibo} (${clienteNom})`,
          ]
        );

        // Actualizar saldo de la cuenta bancaria seleccionada
        await connection.query(
          "UPDATE cuentas_bancarias SET saldo = saldo + ? WHERE id = ?",
          [rec[0].total, cuentaDestino]
        );
      }
    }

    await connection.commit();

    return res.status(200).json({
      message: `El recibo se marcó como ${estado}.`,
      estado,
      fecha_cobro: fechaCobro,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error al cambiar estado:", error);
    return res.status(500).json({
      message: "Error al actualizar el estado de pago del recibo.",
    });
  } finally {
    connection.release();
  }
};

// ============================================================================
// 7. ELIMINAR RECIBO
// ============================================================================
export const eliminarRecibo = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM recibos WHERE id = ?", [id]);
    return res.status(200).json({ message: "Recibo eliminado exitosamente." });
  } catch (error) {
    console.error("Error al eliminar recibo:", error);
    return res.status(500).json({ message: "Error al eliminar el recibo." });
  }
};