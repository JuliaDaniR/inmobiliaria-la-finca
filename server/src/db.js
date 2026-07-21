/* global process */
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST_LA_FINCA,
  user: process.env.DB_USER_LA_FINCA,
  password: process.env.DB_PASSWORD_LA_FINCA,
  database: process.env.DB_NAME_LA_FINCA,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testConnection() {
  try {
    await pool.getConnection();
    console.log('Conexión exitosa a la base de datos');
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error.message);
    process.exit(1);
  }
}

testConnection();

export default pool;