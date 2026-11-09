
import axios from "axios";

const clienteApi = axios.create({
  baseURL: "http://localhost:4000/api",
});

// Interceptor de petición: adjunta el token JWT.
clienteApi.interceptors.request.use(
  (configuracion) => {
    const tokenGuardado =
      localStorage.getItem("la_finca_token") ||
      localStorage.getItem("tokenAcceso");

    if (tokenGuardado) {
      configuracion.headers.Authorization = `Bearer ${tokenGuardado}`;
    }

    return configuracion;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta: detecta tokens inválidos o expirados.
clienteApi.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 ||
        error.response.status === 403)
    ) {
      console.warn(
        "Sesión expirada o token no válido. Cerrando sesión..."
      );

      localStorage.removeItem("la_finca_token");
      localStorage.removeItem("la_finca_user");
      localStorage.removeItem("tokenAcceso");
      localStorage.removeItem("datosUsuario");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default clienteApi;
