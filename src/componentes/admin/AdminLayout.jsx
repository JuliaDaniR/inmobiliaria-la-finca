import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthProvider";
import { useState, useEffect } from "react";

export default function AdminLayout() {
  const { user, logout } = useAuth();

  // Estado para el modo oscuro
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }
    return false;
  });
  // Sincronizar clase .dark en el elemento html y localStorage
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
    <div className="min-h-screen flex bg-slate-50 dark:bg-brand-bg text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* 1. BARRA LATERAL (Sidebar) */}
      <Sidebar />
      {/* 2. CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* BARRA SUPERIOR (Navbar) */}
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 lg:px-8 z-10 shadow-sm transition-colors duration-300">
          {/* Buscador (Lado izquierdo) */}
          <div className="flex-1 max-w-lg hidden sm:block">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Buscar inmuebles, clientes o recibos..."
                className="block w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#826229] focus:border-[#826229] transition-all"
              />
            </div>
          </div>
          {/* Iconos y Perfil de Usuario (Lado derecho) */}
          <div className="flex items-center gap-4 ml-auto">
            {/* NUEVO: Botón de Alternancia de Tema */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-slate-400 hover:text-[#826229] dark:hover:text-brand-gold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 cursor-pointer"
              aria-label="Cambiar modo de color"
            >
              {darkMode ? (
                // Icono de Sol (Modo Oscuro Activo)
                <svg
                  className="w-5 h-5 animate-pulse"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              ) : (
                // Icono de Luna (Modo Claro Activo)
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              )}
            </button>
            {/* Campana de Notificaciones */}
            <button className="p-2 rounded-lg text-slate-400 hover:text-[#826229] dark:hover:text-brand-gold hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors cursor-pointer">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {/* Punto de notificación rojo */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
            </button>
            {/* Divisor */}
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
            {/* Tarjeta de Usuario Logueado */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-950 dark:text-brand-text">
                  {user?.nombre} {user?.apellido}
                </p>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-brand-muted uppercase tracking-wider">
                  {user?.rol}
                </p>
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-[#826229]/20 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden shadow-sm">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-[#826229] uppercase">
                    {user?.nombre?.charAt(0)}
                    {user?.apellido?.charAt(0)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>
        {/* CONTENIDO INTERNO DE LAS RUTAS */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
