// ============================================================================
// CONTROLADOR DE USUARIOS (usuarios.controller.js)
// Este archivo contiene la lógica de negocio para registrar e iniciar sesión usuarios.
// ============================================================================

import pool from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
/* global process */

/**
 * REGISTRO DE USUARIO
 * Recibe los datos del cliente, los valida, encripta la contraseña y guarda el usuario en MySQL.
 */
export const registrarUsuario = async (req, res) => {
  // Desestructuramos los campos enviados en la petición HTTP (req.body)
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

  // 1. VALIDACIONES DE ENTRADA
  // Verificamos que los datos requeridos no lleguen vacíos antes de tocar la base de datos
  if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
    return res.status(400).json({ message: "El nombre es obligatorio." });
  }
  if (!apellido || typeof apellido !== 'string' || !apellido.trim()) {
    return res.status(400).json({ message: "El apellido es obligatorio." });
  }
  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ message: "El email es obligatorio." });
  }

  // Expresión regular para validar formato de correo electrónico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "El formato de email no es válido." });
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ message: "La contraseña es obligatoria y debe tener al menos 6 caracteres." });
  }

  try {
    // 2. VERIFICACIÓN DE DUPLICADOS EN MYSQL
    // Comprobamos si el correo electrónico ya está registrado en la tabla de usuarios
    const [existingUser] = await pool.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email],
    );
    if (existingUser.length > 0) {
      return res.status(400).json({
        message: "El email ya está registrado",
      });
    }

    // 3. SEGURIDAD: ENCRIPTACIÓN DE CONTRASEÑA
    // Generamos un 'salt' (semilla aleatoria) de 10 rondas y creamos un hash seguro de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. ASIGNACIÓN AUTOMÁTICA DE ROL
    // Si la base de datos no tiene usuarios registrados (es el 1º) o si el correo contiene 'secretario',
    // le asignamos el rol 'SECRETARIO'. En caso contrario, será un 'CLIENTE'.
    const [totalRows] = await pool.query("SELECT COUNT(*) AS total FROM usuarios");
    const esPrimerUsuario = totalRows[0].total === 0;
    const esEmailSecretario = email.toLowerCase().includes("secretario");

    const rolAsignado = rol || (esPrimerUsuario || esEmailSecretario ? "SECRETARIO" : "CLIENTE");

    // 5. INSERCIÓN EN LA BASE DE DATOS
    // Usamos consultas preparadas con el símbolo '?' para prevenir ataques de Inyección SQL
    const sql = `
INSERT INTO usuarios(nombre, apellido, email, telefono, password, dni, fechaNacimiento, genero, direccion, ciudad, provincia, observaciones, rol, foto)
 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

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

    // Respuesta HTTP 201 (Creado) al frontend
    return res.status(201).json({
      message: "Usuario registrado exitosamente",
    });
  } catch (error) {
    console.error("Error al registrar el usuario: ", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

/**
 * INICIO DE SESIÓN (LOGIN)
 * Valida credenciales, comprueba la contraseña encriptada y genera un Token JWT.
 */
export const loginUsuario = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "El email y la contraseña son obligatorios."
    });
  }

  try {
    // 1. BUSCAR USUARIO POR EMAIL
    // Convertimos a minúsculas y eliminamos espacios al buscar en la base de datos
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))", [
      email,
    ]);
    if (rows.length === 0) {
      return res.status(400).json({
        message: "El correo electrónico ingresado no se encuentra registrado.",
      });
    }

    const usuario = rows[0];

    // 2. VERIFICACIÓN DE CONTRASEÑA
    // Comparamos la contraseña en texto plano ingresada con la contraseña encriptada de la BD usando bcrypt.compare
    const match = await bcrypt.compare(password, usuario.password);
    if (!match) {
      return res.status(400).json({
        message: "La contraseña ingresada es incorrecta.",
      });
    }

    // 3. GENERACIÓN DE TOKEN DE AUTENTICACIÓN (JWT)
    // Firmamos un token que contiene el ID y el ROL del usuario con una expiración de 2 horas
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "2h" },
    );

    // Eliminamos la contraseña del objeto usuario antes de enviarlo por seguridad
    delete usuario.password;

    // Respuesta exitosa HTTP 200 con el token y los datos del usuario
    return res.status(200).json({
      message: "Inicio de sesión exitoso",
      token,
      user: usuario,
    });
  } catch (error) {
    console.error("Error en el login ", error);
    return res
      .status(500)
      .json({ message: "Error interno del servidor al iniciar sesión." });
  }
};
