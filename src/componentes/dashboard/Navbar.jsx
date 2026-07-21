import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

function Navbar() {
  const { user, logout } = useAuth();
  // Estado para controlar el modo oscuro
  const [darkMode, setDarkMode] = useState(() => {
    // Al cargar la página, comprueba si el usuario ya tenía una preferencia guardada
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }
    return false;
  });
  // Efecto para añadir/quitar la clase 'dark' al tag <html> y guardar la preferencia
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-brand-bg/80 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-30">
          {/* Logo / Nombre de marca */}
          <Link
            to="/"
            className="flex items-center justify-between h-16 gap-3 cursor-pointer"
          >
            <img
              src={
                darkMode
                  ? "/img/logo-la-finca.png"
                  : "/img/logo-la-finca-light.png"
              }
              alt="Logo La Finca"
              className={`w-auto object-contain transition-all duration-300 ${
                darkMode ? "h-44 scale-110 brightness-125" : "h-36"
              }`}
            />
          </Link>

          {/* Enlaces de Navegación (Centrados) */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#inicio"
              className="relative text-sm font-semibold text-brand-text hover:text-brand-gold transition-colors py-2 group"
            >
              Inicio
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-gold scale-x-100 transition-transform duration-300"></span>
            </a>
            <a
              href="#propiedades"
              className="relative text-sm font-semibold text-brand-muted hover:text-brand-gold transition-colors py-2 group"
            >
              Propiedades
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </a>
            <a
              href="#nosotros"
              className="relative text-sm font-semibold text-brand-muted hover:text-brand-gold transition-colors py-2 group"
            >
              Nosotros
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </a>
            <a
              href="#contacto"
              className="relative text-sm font-semibold text-brand-muted hover:text-brand-gold transition-colors py-2 group"
            >
              Contacto
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </a>
          </div>

          {/* Botones de Acción e Interruptor de Modo Oscuro (Derecha) */}
          <div className="flex items-center gap-4">
            {/* Botón de Modo Oscuro */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-brand-muted hover:text-brand-gold dark:text-gray-400 dark:hover:text-brand-gold hover:bg-gray-100/50 dark:hover:bg-slate-900/50 transition-all duration-300 cursor-pointer"
              aria-label="Cambiar modo de color"
            >
              {darkMode ? (
                // Icono de Sol Minimalista y Moderno (Lucide style)
                <svg
                  className="w-4.5 h-4.5 animate-pulse"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              ) : (
                // Icono de Luna Minimalista y Moderno (Lucide style)
                <svg
                  className="w-4.5 h-4.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                {user?.foto || user?.avatar ? (
                  <img
                    src={user.foto || user.avatar}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover border border-[#826229]/40 shadow-sm"
                  />
                ) : null}
                <span className="text-xs font-semibold text-brand-text">
                  Hola, {user.nombre}
                </span>
                {user.rol === "SECRETARIO" && (
                  <Link
                    to="/admin"
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-[#826229] dark:bg-[#C69B56] hover:bg-[#6e5220] dark:hover:bg-[#b08443] rounded-lg transition-all cursor-pointer"
                  >
                    Panel Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="px-3 py-1.5 text-xs font-semibold text-brand-muted hover:text-red-600 dark:hover:text-red-400 border border-gray-200 dark:border-gray-800 rounded-lg transition-all cursor-pointer bg-transparent"
                >
                  Salir
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-block px-4 py-2 text-xs font-semibold text-brand-blue dark:text-brand-gold border border-brand-blue/30 dark:border-brand-gold/30 rounded-lg hover:bg-brand-blue/5 dark:hover:bg-brand-gold/10 transition-all duration-300 cursor-pointer"
                >
                  Iniciar Gestión
                </Link>

                <Link
                  to="/registro"
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-blue dark:bg-brand-gold rounded-lg hover:shadow-lg hover:shadow-brand-blue/20 dark:hover:shadow-brand-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
