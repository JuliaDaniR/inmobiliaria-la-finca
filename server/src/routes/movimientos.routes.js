import { Router } from "express";
import {
  obtenerCuentas,
  crearCuenta,
  obtenerMovimientos,
  registrarMovimiento,
  obtenerResumenFinanciero,
  eliminarMovimiento,
} from "../controller/movimientos.controller.js";
import { verificarTokenAcceso } from "../middleware/autenticar.middleware.js";

const router = Router();

// ============================================================================
// RUTAS DE MOVIMIENTOS BANCARIOS Y CUENTAS (Protegidas con JWT)
// ============================================================================

// 1. Cuentas bancarias
router.get("/cuentas", verificarTokenAcceso, obtenerCuentas);
router.post("/cuentas", verificarTokenAcceso, crearCuenta);

// 2. Movimientos bancarios (ingresos y gastos)
// Admite filtros: ?tipo=INGRESO&id_cuenta=1&fecha_desde=2026-01-01&fecha_hasta=2026-12-31
router.get("/", verificarTokenAcceso, obtenerMovimientos);
router.post("/", verificarTokenAcceso, registrarMovimiento);
router.delete("/:id", verificarTokenAcceso, eliminarMovimiento);

// 3. Resumen financiero para informes (ingresos, gastos, balance)
router.get("/resumen", verificarTokenAcceso, obtenerResumenFinanciero);

export default router;