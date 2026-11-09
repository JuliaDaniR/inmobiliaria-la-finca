import { Router } from "express";
import {
  obtenerRecibos,
  obtenerReciboPorId,
  crearRecibo,
  copiarRecibo,
  editarRecibo,
  cambiarEstadoPago,
  eliminarRecibo,
} from "../controller/recibos.controller.js";
import { verificarTokenAcceso } from "../middleware/autenticar.middleware.js";

const router = Router();

// ============================================================================
// RUTAS DE RECIBOS (Protegidas con JWT)
// ============================================================================

// Obtener todos los recibos (admite filtros ?estado=PENDIENTE&id_inmueble=1)
router.get("/", verificarTokenAcceso, obtenerRecibos);

// Obtener un recibo por su ID
router.get("/:id", verificarTokenAcceso, obtenerReciboPorId);

// Generar nuevo recibo mensual (CU-01)
router.post("/", verificarTokenAcceso, crearRecibo);

// Copiar recibo del mes anterior (CU-02)
router.post("/:id/copiar", verificarTokenAcceso, copiarRecibo);

// Modificar datos y conceptos de un recibo existente (CU-03)
router.put("/:id", verificarTokenAcceso, editarRecibo);

// Cambiar estado de pago (PAGADO / PENDIENTE) (CU-04)
router.patch("/:id/estado", verificarTokenAcceso, cambiarEstadoPago);

// Eliminar un recibo
router.delete("/:id", verificarTokenAcceso, eliminarRecibo);

export default router;