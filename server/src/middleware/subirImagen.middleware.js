import multer from "multer";
import path from "path";
import fs from "fs";

// Asegurar que la carpeta uploads exista
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración del almacenamiento
const almacenamiento = multer.diskStorage({
  destination: (peticion, archivo, callback) => {
    callback(null, "uploads/");
  },
  filename: (peticion, archivo, callback) => {
    const extension = path.extname(archivo.originalname);
    const nombreUnico = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    callback(null, nombreUnico);
  },
});

// Filtro para aceptar solo imágenes
const filtroImagenes = (peticion, archivo, callback) => {
  if (archivo.mimetype && archivo.mimetype.startsWith("image/")) {
    callback(null, true);
  } else {
    callback(new Error("El archivo subido no es una imagen válida"), false);
  }
};

export const cargarImagen = multer({
  storage: almacenamiento,
  fileFilter: filtroImagenes,
  limits: {
    fileSize: 5 * 1024 * 1024, // Máximo 5MB
  },
});

