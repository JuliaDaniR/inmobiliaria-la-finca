import pool from '../src/db.js';

async function checkDatabase() {
  try {
    const [rows] = await pool.query("SHOW TABLES LIKE 'usuarios'");
    if (rows.length > 0) {
      console.log("TABLE_EXISTS: La tabla 'usuarios' ya existe.");
      const [columns] = await pool.query("DESCRIBE usuarios");
      console.log("Columnas de 'usuarios':", columns.map(c => c.Field));
    } else {
      console.log("TABLE_NOT_FOUND: La tabla 'usuarios' no existe.");
    }
  } catch (error) {
    console.error("DATABASE_ERROR:", error.message);
  } finally {
    await pool.end();
  }
}

checkDatabase();
