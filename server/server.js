// ============================================================================
// ARCHIVO PRINCIPAL DEL SERVIDOR BACKEND (server.js)
// Este archivo inicia la aplicación Node.js con Express y configura la API.
// ============================================================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
/* global process */
import usuariosRouter from './src/routes/usuarios.routes.js';
import inmueblesRouter from './src/routes/inmuebles.routes.js';
import recibosRouter from './src/routes/recibos.routes.js';
import movimientosRouter from './src/routes/movimientos.routes.js';

// Carga las variables de entorno definidas en el archivo .env (base de datos, puerto, clave secreta JWT)
dotenv.config();

// Inicializamos la aplicación de Express
const app = express();
const PORT = process.env.PORT || 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos subidos (imágenes de clientes, inmuebles, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// RUTAS PRINCIPALES DE LA API
app.use('/api/usuarios', usuariosRouter);
app.use('/api/autenticacion', usuariosRouter); // Compatibilidad con el proyecto del profesor (el-dogo)
app.use('/api/auth', usuariosRouter);
app.use('/api/inmuebles', inmueblesRouter);
app.use('/api/recibos', recibosRouter);
app.use('/api/movimientos', movimientosRouter);

// Ruta de prueba inicial para comprobar que el servidor responde correctamente en la raíz '/'
app.get('/', (req, res) => {
  res.send('API de Inmobiliaria La Finca funcionando!');
});

// Iniciamos la escucha del servidor en el puerto configurado (4000)
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});