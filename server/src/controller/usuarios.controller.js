import pool from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
/* global process */

//Registro usuario
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

  // Validaciones básicas
  if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
    return res.status(400).json({ message: "El nombre es obligatorio." });
  }
  if (!apellido || typeof apellido !== 'string' || !apellido.trim()) {
    return res.status(400).json({ message: "El apellido es obligatorio." });
  }
  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ message: "El email es obligatorio." });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "El formato de email no es válido." });
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ message: "La contraseña es obligatoria y debe tener al menos 6 caracteres." });
  }

  try {
    //Validar si el email existe
    const [existingUser] = await pool.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email],
    );
    if (existingUser.length > 0) {
      return res.status(400).json({
        message: "El email ya está registrado",
      });
    }

    //Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Verificar si es el primer usuario en registrarse o si el correo contiene 'secretario'
    const [totalRows] = await pool.query("SELECT COUNT(*) AS total FROM usuarios");
    const esPrimerUsuario = totalRows[0].total === 0;
    const esEmailSecretario = email.toLowerCase().includes("secretario");

    const rolAsignado = rol || (esPrimerUsuario || esEmailSecretario ? "SECRETARIO" : "CLIENTE");

    //Crear usuario
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

// Iniciar Sesión
export const loginUsuario = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "El email y la contraseña son obligatorios."
    });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))", [
      email,
    ]);
    if (rows.length === 0) {
      return res.status(400).json({
        message: "El correo electrónico ingresado no se encuentra registrado.",
      });
    }

    const usuario = rows[0];

    //Verificar contraseña encriptada
    const match = await bcrypt.compare(password, usuario.password);
    if (!match) {
      return res.status(400).json({
        message: "La contraseña ingresada es incorrecta.",
      });
    }

    //Genera Token JWT
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "2h" },
    );

   delete usuario.password;

    return res.status(200).json({
      message: " Inicio se sesión exitoso",
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
