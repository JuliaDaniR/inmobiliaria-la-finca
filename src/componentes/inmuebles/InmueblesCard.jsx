import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { solicitarOperacionInmueble } from "../../services/inmuebles.service";

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
  const [modoOperacion, setModoOperacion] = useState(null); // 'ALQUILER' | 'COMPRA'
  const [estadoActual, setEstadoActual] = useState(inmueble.estado || "DISPONIBLE");

  // Formulario de Solicitud
  const [plazoMeses, setPlazoMeses] = useState("24");
  const [tipoGarantia, setTipoGarantia] = useState("Recibo de Sueldo");
  const [propuestaMonto, setPropuestaMonto] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeError, setMensajeError] = useState("");

  const precioFormateado = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(inmueble.precio);

  const manejarEnviarSolicitud = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    setEnviando(true);
    try {
      await solicitarOperacionInmueble(inmueble.id, {
        tipoOperacion: modoOperacion,
        plazoMeses,
        tipoGarantia,
        propuestaMonto,
        observaciones,
      });

      setEstadoActual("RESERVADO");
      setMensajeExito(
        `¡Solicitud de ${modoOperacion.toLowerCase()} enviada con éxito! La propiedad ha quedado en estado RESERVADO y fue notificada al administrador.`
      );
      setMensajeError("");
      setModoOperacion(null);
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      setMensajeError(
        error.response?.data?.message ||
          "Error al enviar la solicitud. Por favor intenta nuevamente."
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      {/* 1. TARJETA EN CATÁLOGO / HOME */}
      <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group">
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

        <div className="p-5 flex flex-col justify-between flex-1">
          <div>
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

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                Precio
              </span>

              <span className="text-lg font-extrabold text-[#024384] dark:text-blue-400">
                {precioFormateado}
              </span>
            </div>

            <button
              onClick={() => {
                setMensajeExito("");
                setModoOperacion(null);
                setMostrarModal(true);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#826229] dark:bg-[#C69B56] hover:bg-[#6c5120] dark:hover:bg-[#b08443] rounded-lg transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              Ver detalle
            </button>
          </div>
        </div>
      </div>

      {/* 2. MODAL DE DETALLE Y OPERACIÓN */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
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

              <button
                onClick={() => setMostrarModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg p-1 cursor-pointer"
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

            {/* Mensaje de éxito tras reserva */}
            {mensajeExito && (
              <div className="p-4 mb-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-3">
                <span className="text-lg">✓</span>
                <span>{mensajeExito}</span>
              </div>
            )}

            {/* Mensaje de error */}
            {mensajeError && (
              <div className="p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs flex items-center gap-3">
                <span className="text-lg">⚠️</span>
                <span>{mensajeError}</span>
              </div>
            )}

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
                  Estado
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

            {/* FORMULARIO DE RESERVA O BOTONES DE ACCIÓN */}
            {modoOperacion ? (
              <form
                onSubmit={manejarEnviarSolicitud}
                className="p-5 rounded-xl border border-[#826229]/30 bg-amber-50/20 dark:bg-amber-950/10 space-y-4 mb-4"
              >
                <div className="flex justify-between items-center border-b border-amber-200/40 dark:border-amber-900/40 pb-2">
                  <h4 className="text-xs font-bold text-[#826229] dark:text-[#C69B56] uppercase tracking-wider">
                    {modoOperacion === "ALQUILER"
                      ? "Solicitar Alquiler del Inmueble (CU-19)"
                      : "Presentar Propuesta de Compra (CU-22)"}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setModoOperacion(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Volver
                  </button>
                </div>

                {modoOperacion === "ALQUILER" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Plazo Contractual
                      </label>
                      <select
                        value={plazoMeses}
                        onChange={(e) => setPlazoMeses(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                      >
                        <option value="24">24 Meses (Habitacional)</option>
                        <option value="36">36 Meses (Comercial)</option>
                        <option value="12">12 Meses (Temporal)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Garantía a Presentar
                      </label>
                      <select
                        value={tipoGarantia}
                        onChange={(e) => setTipoGarantia(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                      >
                        <option value="Recibo de Sueldo">Recibo de Sueldo</option>
                        <option value="Garantía Propietaria">Garantía Propietaria</option>
                        <option value="Seguro de Caución Finaer">Seguro de Caución Finaer</option>
                        <option value="Aval Bancario">Aval Bancario</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Monto de Seña / Reserva Inicial (USD)
                    </label>
                    <input
                      type="number"
                      required
                      min="1000"
                      placeholder={`Ej: ${Math.round(Number(inmueble.precio) * 0.05)}`}
                      value={propuestaMonto}
                      onChange={(e) => setPropuestaMonto(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold"
                    />
                  </div>
                )}

                <div className="text-xs">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mensaje / Horarios disponibles para visita
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Escribe aquí tu consulta o disponibilidad..."
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModoOperacion(null)}
                    className="w-1/2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={enviando}
                    className="w-1/2 bg-[#826229] hover:bg-[#6c5120] text-white py-2 rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    {enviando ? "Enviando Solicitud..." : "Confirmar y Reservar"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  {user
                    ? `Operando como: ${user.nombre} (${user.rol})`
                    : "Inicia sesión para operar con este inmueble."}
                </span>

                <div className="flex gap-2 w-full sm:w-auto">
                  {estadoActual === "DISPONIBLE" ? (
                    user ? (
                      <>
                        <button
                          onClick={() => setModoOperacion("ALQUILER")}
                          className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-[#826229] hover:bg-[#6c5120] transition-colors shadow-sm cursor-pointer"
                        >
                          Solicitar Alquiler
                        </button>
                        <button
                          onClick={() => setModoOperacion("COMPRA")}
                          className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-[#024384] hover:bg-blue-900 transition-colors shadow-sm cursor-pointer"
                        >
                          Solicitar Compra
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => navigate("/login")}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-brand-blue dark:bg-brand-gold hover:bg-blue-900 dark:hover:bg-[#b08443] transition-colors shadow-sm cursor-pointer"
                      >
                        Iniciar Sesión para Operar
                      </button>
                    )
                  ) : (
                    <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                      Propiedad en estado {estadoActual}
                    </span>
                  )}

                  <button
                    onClick={() => setMostrarModal(false)}
                    className="px-4 py-2.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default InmuebleCard;
