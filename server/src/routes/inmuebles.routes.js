
import { Router } from "express";

import {
  obtenerInmuebles,
  obtenerInmueblePorId,
  crearInmueble,
  editarInmueble,
  eliminarInmueble,
} from "../controller/inmuebles.controller.js";

import { verificarTokenAcceso } from "../middleware/autenticar.middleware.js";
import { cargarImagen } from "../middleware/subirImagen.middleware.js";

const router = Router();

// CONSULTAS: se mantienen las rutas GET existentes.
router.get("/", obtenerInmuebles);
router.get("/:id", obtenerInmueblePorId);

// GESTIÓN DE INMUEBLES: operaciones protegidas con JWT.
router.post(
  "/",
  verificarTokenAcceso,
  cargarImagen.single("foto"),
  crearInmueble
);

router.put(
  "/:id",
  verificarTokenAcceso,
  cargarImagen.single("foto"),
  editarInmueble
);

router.delete(
  "/:id",
  verificarTokenAcceso,
  eliminarInmueble
);

export default router;
