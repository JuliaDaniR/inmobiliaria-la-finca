
import { Router } from "express";

import {
  registrarUsuario,
  loginUsuario,
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  editarCliente,
  eliminarCliente,
} from "../controller/usuarios.controller.js";
import { verificarTokenAcceso } from "../middleware/autenticar.middleware.js";
import { cargarImagen } from "../middleware/subirImagen.middleware.js";

const router = Router();

// ============================================================================
// RUTAS DE USUARIOS / AUTENTICACIÓN
// ============================================================================

router.post("/registro", registrarUsuario);
router.post("/login", loginUsuario);

// ============================================================================
// CRUD DE CLIENTES (siguiendo el-dogo)
// ============================================================================

// Obtener todos los clientes
router.get("/clientes", obtenerClientes);

// Obtener un cliente por ID (protegido)
router.get("/clientes/:id", verificarTokenAcceso, obtenerClientePorId);

// Crear un nuevo cliente (protegido con subida de imagen)
router.post(
  "/clientes",
  verificarTokenAcceso,
  cargarImagen.single("foto"),
  crearCliente
);

// Editar un cliente (protegido con subida de imagen)
router.put(
  "/clientes/:id",
  verificarTokenAcceso,
  cargarImagen.single("foto"),
  editarCliente
);

// Eliminar un cliente (protegido)
router.delete("/clientes/:id", verificarTokenAcceso, eliminarCliente);

export default router;

