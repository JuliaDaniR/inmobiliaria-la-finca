// ============================================================================
// COMPONENTE DE INICIO DE SESIÓN (Login.jsx)
// Gestiona la interfaz del formulario de Login, validación en tiempo real,
// comunicación con AuthProvider y redirección según el ROL del usuario.
// ============================================================================

import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

function Login() {
  // HOOKS Y ESTADOS
  const { login } = useAuth();                  // Obtenemos la función de login compartida por el AuthProvider
  const location = useLocation();              // Permite leer el estado pasado mediante la redirección (ej: mensaje de registro exitoso)
  const navigate = useNavigate();                // Hook de React Router para redirigir entre páginas de forma programática
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || "");
  const [isLoading, setIsLoading] = useState(false);

  // EFECTO: Ocultar el cartel verde de éxito automáticamente pasados 5 segundos (5000ms)
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer); // Limpiamos el temporizador si el componente se desmonta
    }
  }, [successMessage]);

  /**
   * MANEJADOR DEL ENVÍO DEL FORMULARIO
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evitamos la recarga completa de la página propia de los formularios HTML estándar
    setError("");
    setSuccessMessage("");

    // Validaciones básicas de presencia de datos
    if (!email || !password) {
      setError("Por favor, complete todos los campos.");
      return;
    }

    if (!email.includes("@")) {
      setError("Por favor, ingrese un correo electrónico corporativo válido.");
      return;
    }

    setIsLoading(true);
    try {
      // Intentamos autenticar llamando a la función del AuthProvider
      const loggedUser = await login(email, password);

      // REDIRECCIÓN CONDICIONAL SEGÚN EL ROL DEL USUARIO
      if (loggedUser.rol === "SECRETARIO") {
        navigate("/admin"); // Los secretarios (administradores) ingresan al Panel de Control
      } else {
        navigate("/");      // Los clientes son redirigidos a la página principal pública
      }
    } catch (err) {
      // Capturamos el error devuelto por la API backend y lo mostramos en el banner rojo
      setError(err.message || "Credenciales incorrectas o error en el inicio de sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  const [darkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        document.documentElement.classList.contains("dark") ||
        localStorage.getItem("theme") === "dark"
      );
    }
    return false;
  });

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8F9FA] dark:bg-brand-bg transition-colors duration-300">
      {/* PANEL IZQUIERDO: Visual & Branding */}
      <div
        className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-16 text-white bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: "url('/img/inicio-la-finca.png')" }}
      >
        {/* Capa de superposición con gradiente premium azul marino */}
        <div className="absolute inset-0 bg-linear-to-b from-[#024384]/90 via-[#0a1e36]/85 to-[#05101e]/95 dark:from-[#0b1320]/95 dark:via-[#0c1a30]/90 dark:to-[#070d18]/98" />

        {/* Gráfico decorativo de fondo: líneas y puntos de analítica / conexión */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="grad-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#826229" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#826229" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="80%" cy="30%" r="150" fill="url(#grad-glow)" />

          {/* Líneas de red decorativas */}
          <path
            d="M-50,200 Q200,150 400,280 T800,200"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1.5"
          />
          <path
            d="M-50,300 Q150,400 500,250 T900,450"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
            strokeDasharray="5,5"
          />

          {/* Puntos de conexión flotantes */}
          <circle
            cx="400"
            cy="280"
            r="4"
            fill="#826229"
            className="animate-pulse"
          />
          <circle cx="500" cy="250" r="3" fill="#ffffff" />
          <circle cx="650" cy="310" r="4.5" fill="#826229" />
        </svg>

        {/* Elemento decorativo superior: Iconos de Geolocalización y Reportes conectados */}
        <div className="relative z-10 flex items-center justify-between w-full max-w-sm mx-auto mt-8">
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </div>

          <div className="flex-1 border-t-2 border-dashed border-white/20 mx-4 relative">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#826229] dark:bg-[#C69B56]" />
          </div>

          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Textos inferiores */}
        <div className="relative z-10 mt-auto max-w-lg">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6 leading-tight font-sans">
            Excelencia en Gestión Inmobiliaria
          </h1>
          <p className="text-slate-200 text-base lg:text-lg leading-relaxed font-light">
            Descubra un estándar superior en administración de propiedades de
            lujo. La Finca ofrece herramientas precisas y una interfaz
            sofisticada diseñada para los profesionales inmobiliarios más
            exigentes.
          </p>

          {/* Indicadores de slider */}
          <div className="flex gap-2.5 mt-8 items-center">
            <span className="w-9 h-1.5 bg-[#826229] dark:bg-[#C69B56] rounded-full transition-all duration-300" />
            <span className="w-2.5 h-1.5 bg-white/30 rounded-full hover:bg-white/50 cursor-pointer transition-all duration-300" />
            <span className="w-2.5 h-1.5 bg-white/30 rounded-full hover:bg-white/50 cursor-pointer transition-all duration-300" />
          </div>
        </div>
      </div>

      {/* PANEL DERECHO: Formulario de Login */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-8 md:p-10 bg-white dark:bg-brand-bg transition-colors duration-300">
        <div className="w-full max-w-md">
          {/* Contenedor del Logo */}
          {/* Logo y Botón de Volver al Dashboard */}
          <div className="flex justify-between items-center w-full">
            <Link to="/">
              <img
                src={
                  darkMode
                    ? "/img/logo-la-finca.png"
                    : "/img/logo-la-finca-light.png"
                }
                alt="La Finca"
                className="h-36 w-auto object-contain dark:brightness-125"
              />
            </Link>

            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-[#5A6B82] dark:text-brand-muted hover:text-[#826229] dark:hover:text-brand-gold transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Volver al Dashboard
            </Link>
          </div>

          {/* Cabecera */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#0A1128] dark:text-brand-text tracking-tight">
              Bienvenido de nuevo
            </h2>
            <p className="mt-2 text-sm text-[#5A6B82] dark:text-brand-muted">
              Acceda al portal de{" "}
              <span className="font-semibold text-[#826229] dark:text-brand-gold">
                Gestión Inmobiliaria - La Finca
              </span>
              .
            </p>
          </div>

          {/* Alerta de Éxito */}
          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500 rounded-r-lg text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <svg
                className="w-5 h-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Alerta de Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500 rounded-r-lg text-sm text-red-700 dark:text-red-300 flex items-center gap-2 animate-shake">
              <svg
                className="w-5 h-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Formulario */}
          <form
            className="space-y-4"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            {/* Input Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-[11px] font-bold uppercase tracking-wider text-[#5A6B82] dark:text-brand-muted mb-2"
              >
                Email corporativo
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  {/* Icono de Email */}
                  <svg
                    className="w-5 h-5 text-slate-400 dark:text-slate-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="ejemplo@lafinca.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#826229]/20 dark:focus:ring-[#C69B56]/20 focus:border-[#826229] dark:focus:border-[#C69B56] transition-all bg-slate-50/30 dark:bg-slate-900/20 focus:bg-white dark:focus:bg-slate-950 text-sm"
                />
              </div>
            </div>

            {/* Input Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-[11px] font-bold uppercase tracking-wider text-[#5A6B82] dark:text-brand-muted mb-2"
              >
                Contraseña
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  {/* Icono de Candado */}
                  <svg
                    className="w-5 h-5 text-slate-400 dark:text-slate-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="block w-full pl-11 pr-12 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#826229]/20 dark:focus:ring-[#C69B56]/20 focus:border-[#826229] dark:focus:border-[#C69B56] transition-all bg-slate-50/30 dark:bg-slate-900/20 focus:bg-white dark:focus:bg-slate-950 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none"
                >
                  {/* Icono Ojo (Mostrar/Ocultar) */}
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Recordar & Olvidó Contraseña */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#826229] dark:text-[#C69B56] border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-[#826229] dark:focus:ring-[#C69B56] cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-[#5A6B82] dark:text-brand-muted">
                  Recordarme en este equipo
                </span>
              </label>

              <a
                href="#"
                className="text-xs sm:text-sm text-[#826229] dark:text-brand-gold hover:underline font-semibold transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Botón de Iniciar Sesión */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#826229] dark:bg-[#C69B56] hover:bg-[#6e5220] dark:hover:bg-[#b08443] text-white py-2.5 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed group cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <circle
                      className="opacity-75"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeDasharray="30 150"
                    />
                  </svg>
                  <span>Ingresando...</span>
                </>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <svg
                    className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer de Registro / Contacto */}
          <div className="mt-8 text-center space-y-3">
            <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              ¿No tiene una cuenta?{" "}
              <Link
                to="/registro"
                className="text-[#826229] dark:text-brand-gold hover:underline font-semibold transition-colors"
              >
                Regístrese aquí
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
