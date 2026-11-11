import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthProvider";
import { useState, useEffect, useRef } from "react"; 
import { getRecibos } from "../../services/recibos.service"; 
import { getInmuebles } from "../../services/inmuebles.service"; 

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Estado para el modal de confirmación de salida
  const [mostrarConfirmacionSalir, setMostrarConfirmacionSalir] = useState(false);

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

  // Estado para el menú desplegable de notificaciones
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const notifRef = useRef(null);

  // Cargar alertas automáticas basadas en el estado real del sistema
  useEffect(() => {
    let activo = true;

    Promise.all([getRecibos(), getInmuebles()])
      .then(([dataRecibos, dataInmuebles]) => {
        if (!activo) return;
        const recibos = Array.isArray(dataRecibos) ? dataRecibos : dataRecibos?.recibos || [];
        const pendientes = recibos.filter((r) => r.estado === "PENDIENTE");

        const inmuebles = Array.isArray(dataInmuebles) ? dataInmuebles : dataInmuebles?.inmuebles || [];
        const pendientesRevision = inmuebles.filter((i) => i.estado === "PENDIENTE");
        const reservados = inmuebles.filter((i) => i.estado === "RESERVADO");

        const listaAlertas = [];

        // 1. Alertas de propiedades pendientes de revisión/aprobación (CU-20 / CU-25)
        pendientesRevision.forEach((inm) => {
          const clienteNom = inm.cliente_nombre
            ? `${inm.cliente_nombre} ${inm.cliente_apellido}`
            : "Cliente";

          listaAlertas.push({
            id: `revision-${inm.id}`,
            titulo: `Propiedad para Revisión: ${inm.direccion}`,
            detalle: `${clienteNom} publicó/modificó ${inm.tipo_inmueble} ($${Number(
              inm.precio
            ).toLocaleString("es-AR")} USD). Requiere aprobación.`,
            ruta: "/admin/inmuebles",
            tipo: "urgente",
            tiempo: "Pendiente revisión",
          });
        });

        // 2. Alertas individuales para cada propiedad reservada (CU-19 / CU-22)
        reservados.forEach((inm) => {
          const clienteNom = inm.cliente_nombre
            ? `${inm.cliente_nombre} ${inm.cliente_apellido}`
            : "Cliente";
          const esCompra = inm.observaciones?.toUpperCase().includes("COMPRA");
          const tipoOp = esCompra ? "Compra" : "Alquiler";

          listaAlertas.push({
            id: `reserva-${inm.id}`,
            titulo: `Pedido de ${tipoOp}: ${inm.direccion}`,
            detalle: `${clienteNom} solicitó ${tipoOp.toLowerCase()} (${inm.tipo_inmueble} - $${Number(
              inm.precio
            ).toLocaleString("es-AR")} USD).`,
            ruta: "/admin/inmuebles",
            tipo: "urgente",
            tiempo: "Pendiente confirmación",
          });
        });

        // 3. Alerta de Recibos Pendientes de cobro
        if (pendientes.length > 0) {
          listaAlertas.push({
            id: "recibos",
            titulo: "Recibos Pendientes de Cobro",
            detalle: `Hay ${pendientes.length} recibo(s) con cobro pendiente este mes.`,
            ruta: "/admin/recibos",
            tipo: "urgente",
            tiempo: "Atención requerida",
          });
        }

        setNotificaciones(listaAlertas);
      })
      .catch((err) => {
        console.error("Error al cargar notificaciones:", err);
      });

    return () => {
      activo = false;
    };
  }, []);

  // Cerrar el menú si se hace clic fuera de él
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setMostrarNotificaciones(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
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
                     {/* Campana de Notificaciones con Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
                className={`p-2 rounded-lg text-slate-400 hover:text-[#826229] dark:hover:text-brand-gold hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors cursor-pointer ${
                  mostrarNotificaciones ? "bg-slate-100 dark:bg-slate-800 text-[#826229] dark:text-brand-gold" : ""
                }`}
                title="Notificaciones"
              >
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

                {/* Badge con la cantidad de notificaciones */}
                {notificaciones.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
                    {notificaciones.length}
                  </span>
                )}
              </button>

              {/* Menú Desplegable (Dropdown) */}
              {mostrarNotificaciones && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        Notificaciones
                      </span>
                      <span className="text-[10px] font-bold bg-[#826229]/10 text-[#826229] dark:text-[#C69B56] px-2 py-0.5 rounded-full">
                        {notificaciones.length} activas
                      </span>
                    </div>
                    <button
                      onClick={() => setMostrarNotificaciones(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                    >
                      Cerrar
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                    {notificaciones.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No tienes notificaciones pendientes.
                      </div>
                    ) : (
                      notificaciones.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            setMostrarNotificaciones(false);
                            navigate(n.ruta);
                          }}
                          className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer flex gap-3 text-left"
                        >
                          <div
                            className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                              n.tipo === "urgente"
                                ? "bg-red-500"
                                : n.tipo === "info"
                                ? "bg-blue-500"
                                : "bg-emerald-500"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                {n.titulo}
                              </h4>
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {n.tiempo}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                              {n.detalle}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 text-center">
                    <button
                      onClick={() => {
                        setMostrarNotificaciones(false);
                        navigate("/admin/recibos");
                      }}
                      className="text-xs font-semibold text-[#826229] dark:text-[#C69B56] hover:underline cursor-pointer"
                    >
                      Ver todos los recibos y movimientos
                    </button>
                  </div>
                </div>
              )}
            </div>
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
                {user?.foto || user?.avatar ? (
                  <img
                    src={user.foto || user.avatar}
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

              {/* Botón Salir */}
              <button
                type="button"
                onClick={() => setMostrarConfirmacionSalir(true)}
                className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                title="Cerrar sesión"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </header>
        {/* CONTENIDO INTERNO DE LAS RUTAS */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          <Outlet />
        </main>
      </div>

      {/* Modal de confirmación de cierre de sesión */}
      {mostrarConfirmacionSalir && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl text-red-600 dark:text-red-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  ¿Cerrar Sesión?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ¿Estás seguro de que deseas salir del Panel de Control?
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMostrarConfirmacionSalir(false)}
                className="flex-1 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setMostrarConfirmacionSalir(false);
                  logout();
                  navigate("/login");
                }}
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-sm transition-colors"
              >
                Sí, Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
