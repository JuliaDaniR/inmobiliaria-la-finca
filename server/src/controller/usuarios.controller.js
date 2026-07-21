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
      rol || "CLIENTE", // Por defecto se registra como cliente
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

  try {
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      return res.status(400).json({
        message: "Credenciales inválidas(email o password son incorrectos",
      });
    }

    const usuario = rows[0];

    //Verificar contraseña encriptada
    const match = await bcrypt.compare(password, usuario.password);
    if (!match) {
      return res.status(400).json({
        message: "Credenciales invalidas, intente nuevamente",
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
