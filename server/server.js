import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
/* global process */
import usuariosRouter from './src/routes/usuarios.routes.js';
import inmueblesRouter from './src/routes/inmuebles.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/usuarios', usuariosRouter);
app.use('/api/inmuebles', inmueblesRouter);

app.get('/', (req, res) => {
  res.send('API de Inmobiliaria La Finca funcionando!');
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});