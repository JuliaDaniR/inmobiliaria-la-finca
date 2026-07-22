# Inmobiliaria La Finca

Aplicación web integral para la gestión de inmuebles de "La Finca". El proyecto cuenta con un frontend desarrollado en **React** (utilizando Vite y TailwindCSS) y un backend en **Node.js** con **Express** y **MySQL**.

## Requisitos Previos
- [Node.js](https://nodejs.org/)
- MySQL (ej. a través de XAMPP, WAMP, o instalación local)

## Pasos para la Instalación y Ejecución

1. **Configuración de la Base de Datos:**
   - Asegúrate de tener el servicio de MySQL en ejecución.
   - Importa el archivo `inmobiliaria-la-finca.sql` (ubicado en la raíz del proyecto) en tu gestor de base de datos (por ejemplo, a través de phpMyAdmin o la consola de MySQL). Esto creará las tablas necesarias y cargará datos de prueba, incluyendo inmuebles y usuarios.

2. **Configuración de Variables de Entorno (Backend):**
   - Dirígete a la carpeta `server/` y asegúrate de tener un archivo `.env` correctamente configurado con las credenciales de tu base de datos local. Por defecto debería lucir algo así:
     ```env
     PORT=4000
     DB_NAME_LA_FINCA=inmobiliaria-la-finca
     DB_USER_LA_FINCA=root
     DB_PASSWORD_LA_FINCA=
     DB_HOST_LA_FINCA=127.0.0.1
     JWT_SECRET=clave_secreta_super_segura_12345
     ```

3. **Instalación de Dependencias:**
   - En la **raíz del proyecto** (donde se ubica el frontend), instala las dependencias ejecutando:
     ```bash
     npm install
     ```
   - Luego, ingresa a la carpeta **`server/`** y haz lo mismo para el backend:
     ```bash
     cd server
     npm install
     cd ..
     ```

4. **Ejecutar el Proyecto:**
   - Desde la raíz del proyecto, puedes iniciar simultáneamente tanto el Frontend como el Backend utilizando el siguiente comando:
     ```bash
     npm run dev:all
     ```
   - El frontend estará disponible (por lo general) en `http://localhost:5173/` y la API del backend estará corriendo en el puerto configurado (ej. `http://localhost:4000/`).

## Usuarios de Prueba

El script de la base de datos (`inmobiliaria-la-finca.sql`) incluye usuarios ya registrados para que puedas probar los distintos perfiles de la plataforma:

- **Rol Secretario / Administrador:**
  - **Email:** `secretario@lafinca.com`
  - **Contraseña:** `123456` *(Contraseña estándar de prueba)*

- **Rol Cliente:**
  - **Email:** `cliente@lafinca.com`
  - **Contraseña:** `123456` *(Contraseña estándar de prueba)*
