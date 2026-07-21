// ============================================================================
// ARCHIVO PRINCIPAL DEL SERVIDOR BACKEND (server.js)
// Este archivo inicia la aplicación Node.js con Express y configura la API.
// ============================================================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
/* global process */
import usuariosRouter from './src/routes/usuarios.routes.js';
import inmueblesRouter from './src/routes/inmuebles.routes.js';

// Carga las variables de entorno definidas en el archivo .env (base de datos, puerto, clave secreta JWT)
dotenv.config();

// Inicializamos la aplicación de Express
const app = express();
const PORT = process.env.PORT || 4000;

// MIDDLEWARES (Funciones intermedias que procesan las peticiones antes de llegar a las rutas)
// 1. CORS: Permite que el cliente frontend (React en puerto 5173) se comunique con este servidor (puerto 4000)
app.use(cors());
// 2. express.json(): Permite que el servidor entienda y lea datos enviados en formato JSON en el cuerpo (body) de las peticiones HTTP
app.use(express.json());

// RUTAS PRINCIPALES DE LA API
// Conectamos los enrutadores específicos a sus prefijos de URL
app.use('/api/usuarios', usuariosRouter);    // Todo lo relativo a usuarios: /api/usuarios/registro, /api/usuarios/login
app.use('/api/inmuebles', inmueblesRouter);  // Todo lo relativo a inmuebles: /api/inmuebles

// Ruta de prueba inicial para comprobar que el servidor responde correctamente en la raíz '/'
app.get('/', (req, res) => {
  res.send('API de Inmobiliaria La Finca funcionando!');
});

// Iniciamos la escucha del servidor en el puerto configurado (4000)
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});