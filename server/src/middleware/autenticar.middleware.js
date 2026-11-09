/* global process */
import jwt from "jsonwebtoken";

export const verificarTokenAcceso = (req, res, siguientePaso) => {
  // El token se suele enviar en la cabecera: Authorization: Bearer <TOKEN>
  const cabeceraAutorizacion = req.headers["authorization"];
  const tokenExtraido =
    cabeceraAutorizacion && cabeceraAutorizacion.split(" ")[1];

  if (!tokenExtraido) {
    return res.status(401).json({
      mensaje: "Acceso denegado. Token no proporcionado.",
    });
  }

  try {
    // Validar el token usando nuestra clave secreta
    const datosDecodificados = jwt.verify(
      tokenExtraido,
      process.env.JWT_SECRET || "clave_secreta_super_segura_12345"
    );

    // Adjuntamos la info de usuario para usarla en los controladores
    req.usuarioAutenticado = datosDecodificados;

    // Permitimos avanzar
    siguientePaso();
  } catch (error) {
    console.error("Error al verificar token:", error);
    return res.status(403).json({
      mensaje: "Acceso denegado. Token inválido o expirado.",
    });
  }
};

