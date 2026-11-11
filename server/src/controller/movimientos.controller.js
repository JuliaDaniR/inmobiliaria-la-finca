/* global process */
import pool from "../db.js";

// ============================================================================
// 1. OBTENER TODAS LAS CUENTAS BANCARIAS Y SUS SALDOS
// ============================================================================
export const obtenerCuentas = async (req, res) => {
  try {
    let [cuentas] = await pool.query(
      "SELECT * FROM cuentas_bancarias ORDER BY banco ASC"
    );

    // Si no hay cuentas registradas (ej: instalación limpia o pruebas), inicializamos las cuentas corporativas por defecto
    if (cuentas.length === 0) {
      await pool.query(
        `INSERT INTO cuentas_bancarias (banco, numero_cuenta, cbu_alias, titular, tipo_cuenta, saldo) VALUES
         ('Banco Santander', 'CC-084-382914/2', 'FINCA.SANTANDER.PESOS', 'Inmobiliaria La Finca S.A.', 'Cuenta Corriente', 450000.00),
         ('Banco Galicia', 'CA-120-918234/7', 'FINCA.GALICIA.PESOS', 'Inmobiliaria La Finca S.A.', 'Caja de Ahorro', 280000.00)`
      );

      const [cuentasIniciales] = await pool.query(
        "SELECT * FROM cuentas_bancarias ORDER BY banco ASC"
      );
      cuentas = cuentasIniciales;
    }

    return res.status(200).json(cuentas);
  } catch (error) {
    console.error("Error al obtener cuentas bancarias:", error);
    return res.status(500).json({
      message: "Error interno al obtener las cuentas bancarias.",
    });
  }
};

// ============================================================================
// 2. CREAR NUEVA CUENTA BANCARIA
// ============================================================================
export const crearCuenta = async (req, res) => {
  const { banco, numero_cuenta, cbu_alias, titular, tipo_cuenta, saldo } = req.body;

  if (!banco || !numero_cuenta || !titular) {
    return res.status(400).json({
      message: "Banco, número de cuenta y titular son obligatorios.",
    });
  }

  try {
    const [resultado] = await pool.query(
      `INSERT INTO cuentas_bancarias (banco, numero_cuenta, cbu_alias, titular, tipo_cuenta, saldo)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        banco.trim(),
        numero_cuenta.trim(),
        cbu_alias ? cbu_alias.trim() : null,
        titular.trim(),
        tipo_cuenta || "Cuenta Corriente",
        parseFloat(saldo) || 0.0,
      ]
    );

    return res.status(201).json({
      message: "Cuenta bancaria registrada con éxito.",
      id: resultado.insertId,
    });
  } catch (error) {
    console.error("Error al crear cuenta bancaria:", error);
    return res.status(500).json({ message: "Error al crear la cuenta bancaria." });
  }
};

// ============================================================================
// 3. OBTENER LISTADO DE MOVIMIENTOS BANCARIOS (con filtros opcionales)
// ============================================================================
export const obtenerMovimientos = async (req, res) => {
  const { tipo, id_cuenta, id_inmueble, fecha_desde, fecha_hasta } = req.query;

  try {
    let sql = `
      SELECT 
        m.*,
        cb.banco,
        cb.numero_cuenta,
        cb.titular AS titular_cuenta,
        i.direccion AS inmueble_direccion,
        i.tipo_inmueble
      FROM movimientos_bancarios m
      JOIN cuentas_bancarias cb ON m.id_cuenta = cb.id
      LEFT JOIN inmuebles i ON m.id_inmueble = i.id
      WHERE 1=1
    `;
    const params = [];

    if (tipo) {
      sql += " AND m.tipo = ?";
      params.push(tipo);
    }

    if (id_cuenta) {
      sql += " AND m.id_cuenta = ?";
      params.push(id_cuenta);
    }

    if (id_inmueble) {
      sql += " AND m.id_inmueble = ?";
      params.push(id_inmueble);
    }

    if (fecha_desde) {
      sql += " AND m.fecha >= ?";
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      sql += " AND m.fecha <= ?";
      params.push(fecha_hasta);
    }

    sql += " ORDER BY m.fecha DESC, m.id DESC";

    const [movimientos] = await pool.query(sql, params);
    return res.status(200).json(movimientos);
  } catch (error) {
    console.error("Error al obtener movimientos:", error);
    return res.status(500).json({
      message: "Error interno al obtener los movimientos bancarios.",
    });
  }
};

// ============================================================================
// 4. REGISTRAR MOVIMIENTO (CU-05 Ingreso / CU-06 Gasto / CU-07 Asociar)
// ============================================================================
export const registrarMovimiento = async (req, res) => {
  const {
    id_cuenta,
    id_inmueble,
    id_recibo,
    tipo,
    categoria,
    monto,
    fecha,
    descripcion,
  } = req.body;

  if (!id_cuenta || !tipo || !categoria || !monto || !fecha) {
    return res.status(400).json({
      message: "Cuenta bancaria, tipo (INGRESO/GASTO), categoría, monto y fecha son obligatorios.",
    });
  }

  if (!["INGRESO", "GASTO"].includes(tipo)) {
    return res.status(400).json({ message: "El tipo debe ser 'INGRESO' o 'GASTO'." });
  }

  const montoNumerico = parseFloat(monto);
  if (isNaN(montoNumerico) || montoNumerico <= 0) {
    return res.status(400).json({ message: "El monto debe ser un valor positivo mayor a cero." });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Insertar el movimiento
    const [resultado] = await connection.query(
      `INSERT INTO movimientos_bancarios 
        (id_cuenta, id_inmueble, id_recibo, tipo, categoria, monto, fecha, descripcion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_cuenta,
        id_inmueble || null,
        id_recibo || null,
        tipo,
        categoria.trim(),
        montoNumerico,
        fecha,
        descripcion || null,
      ]
    );

    // 2. Actualizar el saldo de la cuenta bancaria (aumenta con ingreso, disminuye con gasto)
    const operador = tipo === "INGRESO" ? "+" : "-";
    await connection.query(
      `UPDATE cuentas_bancarias 
       SET saldo = saldo ${operador} ? 
       WHERE id = ?`,
      [montoNumerico, id_cuenta]
    );

    // 3. Obtener el nuevo saldo actualizado
    const [cuentaActualizada] = await connection.query(
      "SELECT saldo FROM cuentas_bancarias WHERE id = ?",
      [id_cuenta]
    );

    await connection.commit();

    return res.status(201).json({
      message: `Movimiento de ${tipo.toLowerCase()} registrado correctamente.`,
      id: resultado.insertId,
      nuevo_saldo: cuentaActualizada[0]?.saldo,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error al registrar movimiento:", error);
    return res.status(500).json({ message: "Error interno al registrar movimiento." });
  } finally {
    connection.release();
  }
};

// ============================================================================
// 5. RESUMEN FINANCIERO (Para informes de ingresos, gastos y declaración)
// ============================================================================
export const obtenerResumenFinanciero = async (req, res) => {
  const { anio } = req.query;
  const anioFiltro = anio || new Date().getFullYear();

  try {
    const [resumen] = await pool.query(
      `SELECT 
        tipo,
        SUM(monto) AS total,
        COUNT(id) AS cantidad
       FROM movimientos_bancarios
       WHERE YEAR(fecha) = ?
       GROUP BY tipo`,
      [anioFiltro]
    );

    const ingresos = resumen.find((r) => r.tipo === "INGRESO")?.total || 0;
    const gastos = resumen.find((r) => r.tipo === "GASTO")?.total || 0;
    const balanceNeto = parseFloat(ingresos) - parseFloat(gastos);

    return res.status(200).json({
      anio: anioFiltro,
      ingresos: parseFloat(ingresos),
      gastos: parseFloat(gastos),
      balanceNeto,
    });
  } catch (error) {
    console.error("Error al calcular resumen financiero:", error);
    return res.status(500).json({
      message: "Error al calcular balance financiero.",
    });
  }
};

// ============================================================================
// 6. ELIMINAR MOVIMIENTO (Revierte el saldo de la cuenta)
// ============================================================================
export const eliminarMovimiento = async (req, res) => {
  const { id } = req.params;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [mov] = await connection.query(
      "SELECT id_cuenta, tipo, monto FROM movimientos_bancarios WHERE id = ?",
      [id]
    );

    if (mov.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Movimiento no encontrado." });
    }

    const { id_cuenta, tipo, monto } = mov[0];

    // Revertir el saldo (si era ingreso, restamos; si era gasto, devolvemos)
    const operador = tipo === "INGRESO" ? "-" : "+";
    await connection.query(
      `UPDATE cuentas_bancarias SET saldo = saldo ${operador} ? WHERE id = ?`,
      [monto, id_cuenta]
    );

    // Borrar el movimiento
    await connection.query("DELETE FROM movimientos_bancarios WHERE id = ?", [id]);

    await connection.commit();
    return res.status(200).json({ message: "Movimiento eliminado y saldo revertido." });
  } catch (error) {
    await connection.rollback();
    console.error("Error al eliminar movimiento:", error);
    return res.status(500).json({ message: "Error al eliminar el movimiento." });
  } finally {
    connection.release();
  }
};