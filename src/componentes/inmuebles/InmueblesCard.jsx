import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

const API_BASE = "http://localhost:4000";

const obtenerUrlFoto = (foto) => {
  if (!foto) return "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80";
  if (foto.startsWith("http")) return foto;
  return `${API_BASE}/${foto.replace(/^\/+/, "")}`;
};

function InmuebleCard({ inmueble }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mostrarModal, setMostrarModal] = useState(false);
  const estadoActual = inmueble.estado || "DISPONIBLE";

  const precioFormateado = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(inmueble.precio);

  return (
    <>
      {/* 1. TARJETA EN CATÁLOGO / HOME */}
      <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group h-full">
        <div>
          <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img
              src={obtenerUrlFoto(inmueble.fotos)}
              alt={inmueble.tipo_inmueble}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            <span
              className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                estadoActual === "DISPONIBLE"
                  ? "bg-emerald-500 text-white"
                  : estadoActual === "RESERVADO"
                  ? "bg-amber-500 text-white"
                  : "bg-slate-500 text-white"
              }`}
            >
              {estadoActual}
            </span>
          </div>

          <div className="p-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#826229] dark:text-[#C69B56]">
              {inmueble.tipo_inmueble}
            </span>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">
              {inmueble.direccion}
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {inmueble.localidad}
              {inmueble.provincia ? `, ${inmueble.provincia}` : ""}
            </p>
          </div>
        </div>

        <div className="p-5 pt-0">
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                Precio
              </span>

              <span className="text-lg font-extrabold text-[#024384] dark:text-blue-400">
                {precioFormateado}
              </span>
            </div>

            <button
              onClick={() => setMostrarModal(true)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#826229] dark:bg-[#C69B56] hover:bg-[#6c5120] dark:hover:bg-[#b08443] rounded-lg transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              Ver detalle
            </button>
          </div>
        </div>
      </div>

      {/* 2. MODAL DE DETALLE INFORMATIVO */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 max-h-[90vh] overflow-y-auto">
            {/* Cabecera del modal */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-bold text-[#826229] dark:text-[#C69B56] uppercase tracking-wider">
                  Ficha Técnica Inmobiliaria
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {inmueble.direccion}
                </h2>
                <p className="text-xs text-slate-500">
                  {inmueble.localidad}{inmueble.provincia ? `, ${inmueble.provincia}` : ""} • {inmueble.tipo_inmueble}
                </p>
              </div>

              {/* Botón único de cierre */}
              <button
                onClick={() => setMostrarModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl p-1 cursor-pointer"
                title="Cerrar"
              >
                ✕
              </button>
            </div>

            {/* Fotografía destacada */}
            <div className="relative h-64 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-6">
              <img
                src={obtenerUrlFoto(inmueble.fotos)}
                alt={inmueble.direccion}
                className="w-full h-full object-cover"
              />
              <span
                className={`absolute top-3 right-3 text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-wider shadow-md ${
                  estadoActual === "DISPONIBLE"
                    ? "bg-emerald-500 text-white"
                    : estadoActual === "RESERVADO"
                    ? "bg-amber-500 text-white"
                    : "bg-slate-600 text-white"
                }`}
              >
                {estadoActual}
              </span>
            </div>

            {/* Datos Clave */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 mb-6 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  Valor Publicado
                </span>
                <span className="text-base font-extrabold text-[#024384] dark:text-blue-400">
                  {precioFormateado}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  Tipo de Propiedad
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {inmueble.tipo_inmueble}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  Estado Actual
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {estadoActual}
                </span>
              </div>
            </div>

            {/* Observaciones y Comodidades */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Descripción y Características
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                {inmueble.observaciones ||
                  "Propiedad de primer nivel administrada de forma exclusiva por Inmobiliaria La Finca. Excelente ubicación con todos los servicios y accesos disponibles."}
              </p>
            </div>

            {/* Acción de Reserva o Redirección */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                {user
                  ? `Sesión iniciada como: ${user.nombre} (${user.rol})`
                  : "Inicia sesión para reservar o gestionar esta propiedad."}
              </span>

              <div className="flex gap-2 w-full sm:w-auto">
                {!user ? (
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-brand-blue dark:bg-brand-gold hover:bg-blue-900 dark:hover:bg-[#b08443] transition-colors shadow-sm cursor-pointer"
                  >
                    Iniciar Sesión para Consultar o Reservar
                  </button>
                ) : user.rol === "CLIENTE" ? (
                  <button
                    onClick={() => navigate("/portal")}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-[#826229] hover:bg-[#6c5120] transition-colors shadow-sm cursor-pointer"
                  >
                    Ir a Mi Portal para Reservar
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/admin/inmuebles")}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-[#826229] hover:bg-[#6c5120] transition-colors shadow-sm cursor-pointer"
                  >
                    Gestionar en Panel Admin
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default InmuebleCard;
