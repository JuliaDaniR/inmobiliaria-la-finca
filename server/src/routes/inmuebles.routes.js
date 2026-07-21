import { Router } from "express";
import { obtenerInmuebles, obtenerInmueblePorId } from "../controller/inmuebles.controller.js";

const router = Router();

// Rutas GET únicamente
router.get("/", obtenerInmuebles);
router.get("/:id", obtenerInmueblePorId);

export default router;
