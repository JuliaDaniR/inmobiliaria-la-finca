
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

const router = Router();

// ============================================================================
// RUTAS DE USUARIOS
// ============================================================================

router.post("/registro", registrarUsuario);

router.post("/login", loginUsuario);

// ============================================================================
// CRUD DE CLIENTES
// ============================================================================

// Obtener todos los clientes
router.get("/clientes", obtenerClientes);

// Obtener un cliente por ID
router.get("/clientes/:id", obtenerClientePorId);

// Crear un nuevo cliente
router.post("/clientes", crearCliente);

// Editar un cliente
router.put("/clientes/:id", editarCliente);

// Eliminar un cliente
router.delete("/clientes/:id", eliminarCliente);

export default router;

