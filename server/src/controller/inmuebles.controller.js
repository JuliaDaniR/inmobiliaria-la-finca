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
    const sql = `
      SELECT 
        i.*,
        u.nombre AS cliente_nombre,
        u.apellido AS cliente_apellido,
        u.email AS cliente_email,
        u.telefono AS cliente_telefono,
        u.dni AS cliente_dni
      FROM inmuebles i
      LEFT JOIN usuarios u ON i.id_usuario = u.id
      ORDER BY i.id DESC
    `;
    const [inmuebles] = await pool.query(sql);
    
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
   SOLICITAR OPERACIÓN (ALQUILAR / COMPRAR INMUEBLE) (CU-19 / CU-22)
   ============================================================================ */

export const solicitarOperacionInmueble = async (req, res) => {
  if (!req.usuarioAutenticado) {
    return res.status(401).json({
      message: "Debes iniciar sesión para solicitar alquilar o comprar un inmueble.",
    });
  }

  const { id } = req.params;
  const { tipoOperacion, plazoMeses, tipoGarantia, propuestaMonto, observaciones } = req.body;

  try {
    const [inmuebles] = await pool.query("SELECT * FROM inmuebles WHERE id = ?", [id]);

    if (inmuebles.length === 0) {
      return res.status(404).json({ message: "Inmueble no encontrado." });
    }

    const clienteId = req.usuarioAutenticado.id;
    let clienteNombre = `${req.usuarioAutenticado.nombre || ""} ${req.usuarioAutenticado.apellido || ""}`.trim();

    if (!clienteNombre || clienteNombre === "undefined undefined") {
      const [uRows] = await pool.query(
        "SELECT nombre, apellido FROM usuarios WHERE id = ?",
        [clienteId]
      );
      if (uRows.length > 0) {
        clienteNombre = `${uRows[0].nombre} ${uRows[0].apellido}`.trim();
      }
    }
    if (!clienteNombre) clienteNombre = "Cliente";
    const obsPrevias = inmuebles[0].observaciones || "";

    const detalleSolicitud = `[SOLICITUD ${tipoOperacion || 'RESERVA'} - Cliente: ${clienteNombre} (ID: ${clienteId}) - ${
      tipoOperacion === 'ALQUILER'
        ? `Plazo: ${plazoMeses || 24} meses, Garantía: ${tipoGarantia || 'Recibo de sueldo'}`
        : `Propuesta/Seña: $${propuestaMonto || 'A convenir'}`
    }${observaciones ? ` - Notas: ${observaciones}` : ''}] ${obsPrevias}`.trim();

    await pool.query(
      "UPDATE inmuebles SET estado = 'RESERVADO', id_usuario = ?, observaciones = ? WHERE id = ?",
      [clienteId, detalleSolicitud, id]
    );

    return res.status(200).json({
      message: `¡Solicitud de ${tipoOperacion === 'COMPRA' ? 'compra' : 'alquiler'} enviada con éxito! La propiedad quedó en estado RESERVADO para revisión del administrador.`,
      estado: "RESERVADO",
    });
  } catch (error) {
    console.error("Error al registrar solicitud de inmueble:", error);
    return res.status(500).json({
      message: "Error interno del servidor al procesar la solicitud.",
    });
  }
};

/* ============================================================================
   RESOLVER OPERACIÓN (CONFIRMAR ALQUILER / CONFIRMAR VENTA / RECHAZAR) (ADMIN)
   ============================================================================ */

export const resolverOperacionInmueble = async (req, res) => {
  if (req.usuarioAutenticado?.rol !== "SECRETARIO") {
    return res.status(403).json({
      message: "Solo el administrador puede confirmar o rechazar solicitudes de inmuebles.",
    });
  }

  const { id } = req.params;
  const { accion, id_cuenta } = req.body; // 'CONFIRMAR_VENTA' | 'CONFIRMAR_ALQUILER' | 'RECHAZAR'

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [inmuebles] = await connection.query(
      `SELECT i.*, u.nombre, u.apellido 
       FROM inmuebles i 
       LEFT JOIN usuarios u ON i.id_usuario = u.id 
       WHERE i.id = ?`,
      [id]
    );

    if (inmuebles.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Inmueble no encontrado." });
    }

    const inm = inmuebles[0];
    const clienteNom = inm.nombre ? `${inm.nombre} ${inm.apellido}` : "Cliente";
    const hoy = new Date().toISOString().split("T")[0];

    if (accion === "CONFIRMAR_VENTA") {
      // 1. Marcar como VENDIDO
      await connection.query("UPDATE inmuebles SET estado = 'VENDIDO' WHERE id = ?", [id]);

      // 2. Registrar cobro bancario de comisión por venta (3% estándar)
      const cuenta = id_cuenta || 1; // Santander por defecto
      const comisionVenta = Math.round(Number(inm.precio) * 0.03);

      await connection.query(
        `INSERT INTO movimientos_bancarios (id_cuenta, id_inmueble, tipo, categoria, monto, fecha, descripcion)
         VALUES (?, ?, 'INGRESO', 'Comisión por Venta', ?, ?, ?)`,
        [
          cuenta,
          id,
          comisionVenta,
          hoy,
          `Comisión por venta concretada de ${inm.tipo_inmueble} (${inm.direccion}) a ${clienteNom}`,
        ]
      );

      await connection.query(
        "UPDATE cuentas_bancarias SET saldo = saldo + ? WHERE id = ?",
        [comisionVenta, cuenta]
      );

      // 3. Emitir automáticamente recibo oficial de Seña de Reserva / Boleto de Compraventa
      let reciboGenerado = "";
      if (inm.id_usuario) {
        reciboGenerado = `REC-VTA-${Math.floor(1000 + Math.random() * 9000)}`;
        const senaMonto = Math.round(Number(inm.precio) * 0.05); // 5% de seña / anticipo de reserva
        const [recRes] = await connection.query(
          `INSERT INTO recibos (numero_recibo, id_inmueble, id_cliente, fecha_emision, periodo, total, estado, observaciones)
           VALUES (?, ?, ?, ?, 'Operación Venta', ?, 'COBRADO', ?)`,
          [
            reciboGenerado,
            id,
            inm.id_usuario,
            hoy,
            senaMonto,
            `Seña de Reserva y Boleto de Compraventa para ${clienteNom} - Inmueble ${inm.direccion}`,
          ]
        );

        await connection.query(
          `INSERT INTO conceptos_recibo (id_recibo, concepto, monto, es_obligatorio)
           VALUES (?, 'Seña de Reserva y Boleto de Compraventa', ?, 1)`,
          [recRes.insertId, senaMonto]
        );
      }

      await connection.commit();
      return res.status(200).json({
        message: `¡Venta de "${inm.direccion}" confirmada exitosamente! Se emitió el recibo oficial de Seña para ${clienteNom} y se acreditó la comisión de $${comisionVenta.toLocaleString("es-AR")} USD en la cuenta bancaria.`,
        estado: "VENDIDO",
      });
    } else if (accion === "CONFIRMAR_ALQUILER") {
      // 1. Marcar como ALQUILADO
      await connection.query("UPDATE inmuebles SET estado = 'ALQUILADO' WHERE id = ?", [id]);

      // 2. Generar el primer recibo mensual para el cliente si está asignado
      if (inm.id_usuario) {
        const numRecibo = `REC-2026-${Math.floor(100 + Math.random() * 900)}`;
        const mesActual = new Date().toLocaleString("es-ES", { month: "long" });
        const periodoActual = `${mesActual.charAt(0).toUpperCase() + mesActual.slice(1)} 2026`;

        const [recRes] = await connection.query(
          `INSERT INTO recibos (numero_recibo, id_inmueble, id_cliente, fecha_emision, periodo, total, estado, observaciones)
           VALUES (?, ?, ?, ?, ?, ?, 'PENDIENTE', ?)`,
          [
            numRecibo,
            id,
            inm.id_usuario,
            hoy,
            periodoActual,
            inm.precio,
            `Primer recibo de locación para ${clienteNom}`,
          ]
        );

        // Concepto de alquiler
        await connection.query(
          `INSERT INTO conceptos_recibo (id_recibo, concepto, monto, es_obligatorio)
           VALUES (?, 'Alquiler Mensual', ?, 1)`,
          [recRes.insertId, inm.precio]
        );
      }

      await connection.commit();
      return res.status(200).json({
        message: `¡Alquiler de "${inm.direccion}" confirmado! Se emitió el recibo mensual para ${clienteNom}.`,
        estado: "ALQUILADO",
      });
    } else if (accion === "APROBAR_PUBLICACION") {
      // Aprobar publicación enviada por cliente: pasa a DISPONIBLE en el catálogo público
      await connection.query(
        "UPDATE inmuebles SET estado = 'DISPONIBLE' WHERE id = ?",
        [id]
      );

      await connection.commit();
      return res.status(200).json({
        message: `¡La publicación de "${inm.direccion}" fue aprobada y ahora está DISPONIBLE en el catálogo público!`,
        estado: "DISPONIBLE",
      });
    } else if (accion === "RECHAZAR_PUBLICACION") {
      // Rechazar publicación
      await connection.query(
        "UPDATE inmuebles SET estado = 'RECHAZADO' WHERE id = ?",
        [id]
      );

      await connection.commit();
      return res.status(200).json({
        message: `La publicación de "${inm.direccion}" fue rechazada por el administrador.`,
        estado: "RECHAZADO",
      });
    } else if (accion === "RECHAZAR") {
      // Volver a DISPONIBLE y remover la reserva
      await connection.query(
        "UPDATE inmuebles SET estado = 'DISPONIBLE' WHERE id = ?",
        [id]
      );

      await connection.commit();
      return res.status(200).json({
        message: `La solicitud fue rechazada y "${inm.direccion}" volvió a estar DISPONIBLE en el catálogo.`,
        estado: "DISPONIBLE",
      });
    } else {
      connection.release();
      return res.status(400).json({ message: "Acción no reconocida." });
    }
  } catch (error) {
    await connection.rollback();
    console.error("Error al resolver operación de inmueble:", error);
    return res.status(500).json({
      message: "Error interno al procesar la operación.",
    });
  } finally {
    connection.release();
  }
};

/* ============================================================================
   CREAR INMUEBLE
   ============================================================================ */

export const crearInmueble = async (req, res) => {
  // Los usuarios autenticados (SECRETARIO o CLIENTE) pueden publicar inmuebles.
  if (!req.usuarioAutenticado) {
    return res.status(401).json({
      message: "Debes iniciar sesión para publicar un inmueble.",
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

    const esCliente = req.usuarioAutenticado.rol === "CLIENTE";
    // Las publicaciones enviadas por clientes quedan en revisión (PENDIENTE) del administrador
    const estadoFinal = esCliente ? "PENDIENTE" : (estado || "DISPONIBLE");

    const values = [
      req.usuarioAutenticado.id,
      tipo_inmueble.trim(),
      precio,
      direccion.trim(),
      localidad || null,
      provincia || null,
      estadoFinal,
      rutaFoto,
      observaciones || null,
    ];

    const [resultado] = await pool.query(sql, values);

    return res.status(201).json({
      message: esCliente
        ? "Propiedad enviada a revisión del administrador exitosamente."
        : "Inmueble creado exitosamente.",
      id: resultado.insertId,
      estado: estadoFinal,
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
  if (!req.usuarioAutenticado) {
    return res.status(401).json({
      message: "Debes iniciar sesión para editar un inmueble.",
    });
  }

  const { id } = req.params;

  try {
    const [inmuebles] = await pool.query(
      "SELECT id, fotos, id_usuario, estado FROM inmuebles WHERE id = ?",
      [id]
    );

    if (inmuebles.length === 0) {
      return res.status(404).json({
        message: "Inmueble no encontrado.",
      });
    }

    const inmuebleExistente = inmuebles[0];
    const esAdmin = req.usuarioAutenticado.rol === "SECRETARIO";
    const esDuenio =
      inmuebleExistente.id_usuario &&
      Number(inmuebleExistente.id_usuario) === Number(req.usuarioAutenticado.id);

    // Solo el administrador o el cliente propietario pueden editar
    if (!esAdmin && !esDuenio) {
      return res.status(403).json({
        message: "No tienes permisos para editar este inmueble.",
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

    // Si no se sube otra imagen, se conserva la fotografía actual.
    let rutaFoto = inmuebleExistente.fotos;

    if (req.file) {
      rutaFoto = `/uploads/${req.file.filename}`;
    } else if (fotos !== undefined) {
      rutaFoto = fotos || null;
    }

    // Si quien edita es un CLIENTE, la propiedad pasa a PENDIENTE para revisión del admin
    const estadoFinal = esAdmin
      ? (estado || inmuebleExistente.estado || "DISPONIBLE")
      : "PENDIENTE";

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
      estadoFinal,
      rutaFoto,
      observaciones || null,
      id,
    ];

    await pool.query(sql, values);

    return res.status(200).json({
      message: esAdmin
        ? "Inmueble actualizado exitosamente."
        : "Inmueble actualizado y enviado a revisión del administrador.",
      estado: estadoFinal,
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
