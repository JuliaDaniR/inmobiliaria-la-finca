
// ============================================================================
// CONTROLADOR DE USUARIOS (usuarios.controller.js)
// Registro, inicio de sesión y gestión de clientes.
// ============================================================================

import pool from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* ============================================================================
   REGISTRO DE USUARIO
   ============================================================================ */

export const registrarUsuario = async (req, res) => {
  const {
    nombre,
    apellido,
    email,
    telefono,
    password,
    dni,
    fechaNacimiento,
    genero,
    direccion,
    ciudad,
    provincia,
    observaciones,
    rol,
    foto,
  } = req.body;

  // 1. VALIDACIONES

  if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
    return res.status(400).json({
      message: "El nombre es obligatorio.",
    });
  }

  if (!apellido || typeof apellido !== "string" || !apellido.trim()) {
    return res.status(400).json({
      message: "El apellido es obligatorio.",
    });
  }

  if (!email || typeof email !== "string" || !email.trim()) {
    return res.status(400).json({
      message: "El email es obligatorio.",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "El formato de email no es válido.",
    });
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({
      message:
        "La contraseña es obligatoria y debe tener al menos 6 caracteres.",
    });
  }

  try {
    // 2. VERIFICAR SI EL EMAIL YA EXISTE

    const [existingUser] = await pool.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        message: "El email ya está registrado.",
      });
    }

    // 3. ENCRIPTAR CONTRASEÑA

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. ASIGNACIÓN DEL ROL

    const [totalRows] = await pool.query(
      "SELECT COUNT(*) AS total FROM usuarios"
    );

    const esPrimerUsuario = totalRows[0].total === 0;
    const esEmailSecretario = email.toLowerCase().includes("secretario");

    const rolAsignado =
      rol ||
      (esPrimerUsuario || esEmailSecretario
        ? "SECRETARIO"
        : "CLIENTE");

    // 5. INSERTAR USUARIO

    const sql = `
      INSERT INTO usuarios
      (
        nombre,
        apellido,
        email,
        telefono,
        password,
        dni,
        fechaNacimiento,
        genero,
        direccion,
        ciudad,
        provincia,
        observaciones,
        rol,
        foto
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      nombre,
      apellido,
      email,
      telefono || null,
      hashedPassword,
      dni || null,
      fechaNacimiento || null,
      genero || null,
      direccion || null,
      ciudad || null,
      provincia || null,
      observaciones || null,
      rolAsignado,
      foto || null,
    ];

    await pool.query(sql, values);

    return res.status(201).json({
      message: "Usuario registrado exitosamente.",
    });
  } catch (error) {
    console.error("Error al registrar el usuario:", error);

    return res.status(500).json({
      message: "Error interno del servidor.",
    });
  }
};

/* ============================================================================
   INICIO DE SESIÓN
   ============================================================================ */

export const loginUsuario = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "El email y la contraseña son obligatorios.",
    });
  }

  try {
    // 1. BUSCAR USUARIO

    const [rows] = await pool.query(
      "SELECT * FROM usuarios WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))",
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        message:
          "El correo electrónico ingresado no se encuentra registrado.",
      });
    }

    const usuario = rows[0];

    // 2. COMPROBAR CONTRASEÑA

    const match = await bcrypt.compare(password, usuario.password);

    if (!match) {
      return res.status(400).json({
        message: "La contraseña ingresada es incorrecta.",
      });
    }

    // 3. GENERAR TOKEN JWT

    const token = jwt.sign(
      {
        id: usuario.id,
        rol: usuario.rol,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    // No enviar contraseña al frontend

    delete usuario.password;

    return res.status(200).json({
      message: "Inicio de sesión exitoso",
      token,
      user: usuario,
    });
  } catch (error) {
    console.error("Error en el login:", error);

    return res.status(500).json({
      message: "Error interno del servidor al iniciar sesión.",
    });
  }
};

/* ============================================================================
   CRUD DE CLIENTES
   ============================================================================ */

/**
 * OBTENER TODOS LOS CLIENTES
 *
 * Obtiene únicamente los usuarios cuyo rol sea CLIENTE.
 */

export const obtenerClientes = async (req, res) => {
  try {
    const [clientes] = await pool.query(
      `SELECT
        id,
        nombre,
        apellido,
        email,
        telefono,
        dni,
        fechaNacimiento,
        genero,
        direccion,
        ciudad,
        provincia,
        observaciones,
        foto,
        rol
      FROM usuarios
      WHERE rol = 'CLIENTE'
      ORDER BY id DESC`
    );

    return res.status(200).json(clientes);
  } catch (error) {
    console.error("Error al obtener los clientes:", error);

    return res.status(500).json({
      message: "Error interno del servidor al obtener clientes.",
    });
  }
};

/**
 * OBTENER UN CLIENTE POR ID
 *
 * Busca un usuario específico, pero solamente si tiene rol CLIENTE.
 */

export const obtenerClientePorId = async (req, res) => {
  const { id } = req.params;

  try {
    const [clientes] = await pool.query(
      `SELECT
        id,
        nombre,
        apellido,
        email,
        telefono,
        dni,
        fechaNacimiento,
        genero,
        direccion,
        ciudad,
        provincia,
        observaciones,
        foto,
        rol
      FROM usuarios
      WHERE id = ? AND rol = 'CLIENTE'`,
      [id]
    );

    if (clientes.length === 0) {
      return res.status(404).json({
        message: "Cliente no encontrado.",
      });
    }

    return res.status(200).json(clientes[0]);
  } catch (error) {
    console.error("Error al obtener el cliente:", error);

    return res.status(500).json({
      message: "Error interno del servidor al obtener el cliente.",
    });
  }
};

//crear cliente:

export const crearCliente = async (req, res) => {
  const {
    nombre,
    apellido,
    email,
    telefono,
    dni,
    fechaNacimiento,
    genero,
    direccion,
    ciudad,
    provincia,
    observaciones,
    foto,
  } = req.body;

  // 1. VALIDACIONES

  if (!nombre || !nombre.trim()) {
    return res.status(400).json({
      message: "El nombre es obligatorio.",
    });
  }

  if (!apellido || !apellido.trim()) {
    return res.status(400).json({
      message: "El apellido es obligatorio.",
    });
  }

  if (!email || !email.trim()) {
    return res.status(400).json({
      message: "El email es obligatorio.",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "El formato de email no es válido.",
    });
  }

  try {
    // 2. COMPROBAR EMAIL DUPLICADO

    const [existingUser] = await pool.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email.trim()]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        message: "El email ya está registrado.",
      });
    }

    // 3. GENERAR CONTRASEÑA INTERNA

    const passwordInterna = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordInterna, salt);

    // 4. INSERTAR CLIENTE

    const sql = `
      INSERT INTO usuarios
      (
        nombre,
        apellido,
        email,
        telefono,
        password,
        dni,
        fechaNacimiento,
        genero,
        direccion,
        ciudad,
        provincia,
        observaciones,
        rol,
        foto
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CLIENTE', ?)
    `;

    const values = [
      nombre.trim(),
      apellido.trim(),
      email.trim(),
      telefono || null,
      hashedPassword,
      dni || null,
      fechaNacimiento || null,
      genero || null,
      direccion || null,
      ciudad || null,
      provincia || null,
      observaciones || null,
      foto || null,
    ];

    const [resultado] = await pool.query(sql, values);

    return res.status(201).json({
      message: "Cliente creado exitosamente.",
      id: resultado.insertId,
    });

  } catch (error) {
    console.error("Error al crear el cliente:", error);

    return res.status(500).json({
      message: "Error interno del servidor al crear el cliente.",
    });
  }
};
 /* EDITAR CLIENTE
 *
 * Modifica los datos de un cliente.
 * El rol no se modifica.
 */

export const editarCliente = async (req, res) => {
  const { id } = req.params;

  const {
    nombre,
    apellido,
    email,
    telefono,
    dni,
    fechaNacimiento,
    genero,
    direccion,
    ciudad,
    provincia,
    observaciones,
    foto,
  } = req.body;

  // 1. VALIDACIONES

  if (!nombre || !nombre.trim()) {
    return res.status(400).json({
      message: "El nombre es obligatorio.",
    });
  }

  if (!apellido || !apellido.trim()) {
    return res.status(400).json({
      message: "El apellido es obligatorio.",
    });
  }

  if (!email || !email.trim()) {
    return res.status(400).json({
      message: "El email es obligatorio.",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "El formato de email no es válido.",
    });
  }

  try {
    // 2. COMPROBAR QUE EL CLIENTE EXISTE

    const [cliente] = await pool.query(
      "SELECT id FROM usuarios WHERE id = ? AND rol = 'CLIENTE'",
      [id]
    );

    if (cliente.length === 0) {
      return res.status(404).json({
        message: "Cliente no encontrado.",
      });
    }

    // 3. COMPROBAR EMAIL DUPLICADO

    const [emailExistente] = await pool.query(
      "SELECT id FROM usuarios WHERE email = ? AND id != ?",
      [email, id]
    );

    if (emailExistente.length > 0) {
      return res.status(400).json({
        message: "El email ya está registrado por otro usuario.",
      });
    }

    // 4. ACTUALIZAR CLIENTE

    const sql = `
      UPDATE usuarios
      SET
        nombre = ?,
        apellido = ?,
        email = ?,
        telefono = ?,
        dni = ?,
        fechaNacimiento = ?,
        genero = ?,
        direccion = ?,
        ciudad = ?,
        provincia = ?,
        observaciones = ?,
        foto = ?
      WHERE id = ? AND rol = 'CLIENTE'
    `;

    const values = [
      nombre.trim(),
      apellido.trim(),
      email.trim(),
      telefono || null,
      dni || null,
      fechaNacimiento || null,
      genero || null,
      direccion || null,
      ciudad || null,
      provincia || null,
      observaciones || null,
      foto || null,
      id,
    ];

    await pool.query(sql, values);

    return res.status(200).json({
      message: "Cliente actualizado exitosamente.",
    });
  } catch (error) {
    console.error("Error al editar el cliente:", error);

    return res.status(500).json({
      message: "Error interno del servidor al editar el cliente.",
    });
  }
};

/**
 * ELIMINAR CLIENTE
 *
 * Elimina únicamente usuarios cuyo rol sea CLIENTE.
 */

export const eliminarCliente = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. COMPROBAR QUE SEA CLIENTE

    const [cliente] = await pool.query(
      "SELECT id FROM usuarios WHERE id = ? AND rol = 'CLIENTE'",
      [id]
    );

    if (cliente.length === 0) {
      return res.status(404).json({
        message: "Cliente no encontrado.",
      });
    }

    // 2. ELIMINAR

    await pool.query(
      "DELETE FROM usuarios WHERE id = ? AND rol = 'CLIENTE'",
      [id]
    );

    return res.status(200).json({
      message: "Cliente eliminado exitosamente.",
    });
  } catch (error) {
    console.error("Error al eliminar el cliente:", error);

    return res.status(500).json({
      message: "Error interno del servidor al eliminar el cliente.",
    });
  }
};

