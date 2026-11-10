import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { getRecibos, cambiarEstadoRecibo } from "../../services/recibos.service";
import {
  getInmuebles,
  crearInmueble,
  solicitarOperacionInmueble,
} from "../../services/inmuebles.service";

const API_BASE = "http://localhost:4000";

const obtenerUrlFoto = (foto) => {
  if (!foto) return "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80";
  if (foto.startsWith("http") || foto.startsWith("data:image")) return foto;
  return `${API_BASE}/${foto.replace(/^\/+/, "")}`;
};

export default function PortalCliente() {
  const { user, logout } = useAuth();

  // Modo oscuro
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

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Pestaña activa: 'recibos' | 'catalogo' | 'publicar' | 'mis-propiedades'
  const [pestanaActiva, setPestanaActiva] = useState("recibos");

  // Estado de Datos
  const [recibos, setRecibos] = useState([]);
  const [inmuebles, setInmuebles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensajeAlerta, setMensajeAlerta] = useState({ tipo: "", texto: "" });

  // Modales
  const [reciboParaPagar, setReciboParaPagar] = useState(null);
  const [reciboParaVer, setReciboParaVer] = useState(null);
  const [inmuebleParaOperar, setInmuebleParaOperar] = useState(null); // { inmueble, tipo: 'ALQUILER' | 'COMPRA' }

  // Formulario de Pago
  const [metodoPago, setMetodoPago] = useState("TRANSFERENCIA");
  const [cuentaBancaria, setCuentaBancaria] = useState("1"); // 1: Santander, 2: Galicia
  const [datosTarjeta, setDatosTarjeta] = useState({
    numero: "",
    titular: "",
    vencimiento: "",
    cvv: "",
  });
  const [procesandoPago, setProcesandoPago] = useState(false);

  // Formulario de Solicitud (Alquilar / Comprar)
  const [datosSolicitud, setDatosSolicitud] = useState({
    plazoMeses: "24",
    tipoGarantia: "Recibo de Sueldo",
    propuestaMonto: "",
    observaciones: "",
  });
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);

  // Formulario de Publicación de Inmueble (Venta / Alquiler)
  const [nuevoInmueble, setNuevoInmueble] = useState({
    tipo_inmueble: "Casa",
    operacion: "VENTA",
    precio: "",
    direccion: "",
    localidad: "Rosario",
    provincia: "Santa Fe",
    observaciones: "",
  });
  const [archivoFoto, setArchivoFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [publicando, setPublicando] = useState(false);

  // Filtros de recibos e inmuebles
  const [filtroRecibo, setFiltroRecibo] = useState("TODOS");
  const [busquedaInmueble, setBusquedaInmueble] = useState("");

  // Carga inicial
  useEffect(() => {
    let activo = true;

    Promise.all([getRecibos(), getInmuebles()])
      .then(([recibosData, inmueblesData]) => {
        if (!activo) return;
        const listaRecibos = Array.isArray(recibosData)
          ? recibosData
          : recibosData?.recibos || [];
        const listaInmuebles = Array.isArray(inmueblesData)
          ? inmueblesData
          : inmueblesData?.inmuebles || [];

        setRecibos(listaRecibos);
        setInmuebles(listaInmuebles);
      })
      .catch((err) => {
        if (!activo) return;
        console.error("Error al cargar datos del cliente:", err);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const refrescarRecibos = async () => {
    try {
      const data = await getRecibos();
      setRecibos(Array.isArray(data) ? data : data?.recibos || []);
    } catch (err) {
      console.error("Error al refrescar recibos:", err);
    }
  };

  const refrescarInmuebles = async () => {
    try {
      const data = await getInmuebles();
      setInmuebles(Array.isArray(data) ? data : data?.inmuebles || []);
    } catch (err) {
      console.error("Error al refrescar inmuebles:", err);
    }
  };

  // ============================================================================
  // PAGOS DE RECIBOS (CU-04 / RF-14)
  // ============================================================================
  const confirmarPagoRecibo = async (e) => {
    e.preventDefault();
    if (!reciboParaPagar) return;

    setProcesandoPago(true);
    try {
      await cambiarEstadoRecibo(reciboParaPagar.id, "COBRADO", {
        id_cuenta: Number(cuentaBancaria),
      });

      setMensajeAlerta({
        tipo: "exito",
        texto: `¡Pago acreditado con éxito para el recibo ${reciboParaPagar.numero_recibo}! Se generó el comprobante correspondiente.`,
      });

      await refrescarRecibos();
      setReciboParaPagar(null);
    } catch (error) {
      setMensajeAlerta({
        tipo: "error",
        texto:
          error.message ||
          "No se pudo procesar el pago. Por favor intenta nuevamente.",
      });
    } finally {
      setProcesandoPago(false);
    }
  };

  // ============================================================================
  // PUBLICAR INMUEBLE (CU-20 / CU-25)
  // ============================================================================
  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setArchivoFoto(file);
      setPreviewFoto(URL.createObjectURL(file));
    }
  };

  const handlePublicarInmueble = async (e) => {
    e.preventDefault();

    if (!nuevoInmueble.direccion.trim() || !nuevoInmueble.precio) {
      setMensajeAlerta({
        tipo: "error",
        texto: "La dirección y el precio son obligatorios.",
      });
      return;
    }

    setPublicando(true);
    try {
      const formData = new FormData();
      formData.append("tipo_inmueble", nuevoInmueble.tipo_inmueble);
      formData.append("precio", nuevoInmueble.precio);
      formData.append("direccion", nuevoInmueble.direccion.trim());
      formData.append("localidad", nuevoInmueble.localidad.trim());
      formData.append("provincia", nuevoInmueble.provincia.trim());
      formData.append("estado", "DISPONIBLE");
      formData.append(
        "observaciones",
        `[Operación: ${nuevoInmueble.operacion}] ${nuevoInmueble.observaciones}`.trim()
      );

      if (archivoFoto) {
        formData.append("foto", archivoFoto);
      }

      await crearInmueble(formData);

      setMensajeAlerta({
        tipo: "exito",
        texto:
          "¡Propiedad enviada y registrada con éxito! Ya forma parte del catálogo de La Finca.",
      });

      setNuevoInmueble({
        tipo_inmueble: "Casa",
        operacion: "VENTA",
        precio: "",
        direccion: "",
        localidad: "Rosario",
        provincia: "Santa Fe",
        observaciones: "",
      });
      setArchivoFoto(null);
      setPreviewFoto(null);

      await refrescarInmuebles();
      setPestanaActiva("mis-propiedades");
    } catch (error) {
      setMensajeAlerta({
        tipo: "error",
        texto:
          error.response?.data?.message ||
          "Error al publicar el inmueble. Intenta nuevamente.",
      });
    } finally {
      setPublicando(false);
    }
  };

  // ==========================================
  // SOLICITUD DE ALQUILER O COMPRA (CU-19 / CU-22 / CU-24)
  // ==========================================
  const handleEnviarSolicitud = async (e) => {
    e.preventDefault();
    if (!inmuebleParaOperar) return;

    setSolicitudEnviada(true);
    try {
      await solicitarOperacionInmueble(inmuebleParaOperar.inmueble.id, {
        tipoOperacion: inmuebleParaOperar.tipo,
        plazoMeses: datosSolicitud.plazoMeses,
        tipoGarantia: datosSolicitud.tipoGarantia,
        propuestaMonto: datosSolicitud.propuestaMonto,
        observaciones: datosSolicitud.observaciones,
      });

      setMensajeAlerta({
        tipo: "exito",
        texto: `¡Tu solicitud de ${
          inmuebleParaOperar.tipo === "ALQUILER" ? "alquiler" : "compra"
        } para "${inmuebleParaOperar.inmueble.direccion}" fue enviada con éxito! La propiedad quedó en estado RESERVADO y se notificó al administrador.`,
      });

      await refrescarInmuebles();
      setInmuebleParaOperar(null);
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      setMensajeAlerta({
        tipo: "error",
        texto:
          error.response?.data?.message ||
          "Error al enviar la solicitud. Por favor intenta nuevamente.",
      });
    } finally {
      setSolicitudEnviada(false);
    }
  };

  // Inmuebles que el cliente alquiló o compró (solicitudes realizadas)
  const misOperaciones = inmuebles.filter(
    (inm) =>
      inm.id_usuario &&
      Number(inm.id_usuario) === Number(user?.id) &&
      inm.observaciones?.includes("[SOLICITUD")
  );

  // Inmuebles que el cliente publicó como propietario para comercializar
  const misPublicaciones = inmuebles.filter(
    (inm) =>
      inm.id_usuario &&
      Number(inm.id_usuario) === Number(user?.id) &&
      !inm.observaciones?.includes("[SOLICITUD")
  );

  const limpiarDescripcion = (texto) => {
    if (!texto) return "";
    return texto
      .replace(/\[SOLICITUD[^\]]*\]\s*/gi, "")
      .replace(/\[Operación:[^\]]*\]\s*/gi, "")
      .trim();
  };

  // Recibos filtrados
  const recibosFiltrados = recibos.filter((r) => {
    if (filtroRecibo === "TODOS") return true;
    return r.estado === filtroRecibo;
  });

  // Inmuebles para catálogo
  const catalogoFiltrado = inmuebles.filter((inm) => {
    const texto = `${inm.direccion} ${inm.tipo_inmueble} ${inm.localidad} ${inm.provincia}`.toLowerCase();
    return texto.includes(busquedaInmueble.toLowerCase().trim());
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-bg text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-300">
      {/* 1. BARRA SUPERIOR DEL PORTAL */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img
                src={darkMode ? "/img/logo-la-finca.png" : "/img/logo-la-finca-light.png"}
                alt="Logo La Finca"
                className="h-14 w-auto object-contain"
              />
            </Link>
            <div className="hidden sm:block border-l border-slate-200 dark:border-slate-800 pl-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#826229] dark:text-[#C69B56]">
                Portal del Cliente
              </span>
              <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {user?.nombre} {user?.apellido}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Alternar modo oscuro */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-slate-400 hover:text-[#826229] dark:hover:text-[#C69B56] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Cambiar tema"
            >
              {darkMode ? (
                <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Volver a la web pública */}
            <Link
              to="/"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Sitio Web
            </Link>

            {/* Salir */}
            <button
              onClick={logout}
              className="px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-lg transition-colors cursor-pointer"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* 2. ALERTA GLOBAL */}
      {mensajeAlerta.texto && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
          <div
            className={`p-4 rounded-xl border flex items-center justify-between text-sm shadow-sm transition-all ${
              mensajeAlerta.tipo === "exito"
                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">
                {mensajeAlerta.tipo === "exito" ? "✓" : "⚠️"}
              </span>
              <span>{mensajeAlerta.texto}</span>
            </div>
            <button
              onClick={() => setMensajeAlerta({ tipo: "", texto: "" })}
              className="text-xs font-bold hover:underline ml-4 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* 3. NAVEGACIÓN POR PESTAÑAS */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto space-x-2 sm:space-x-4 py-3">
          <button
            onClick={() => setPestanaActiva("recibos")}
            className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              pestanaActiva === "recibos"
                ? "bg-[#826229] text-white shadow-md shadow-[#826229]/20"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Mis Recibos y Pagos
            {recibos.filter((r) => r.estado === "PENDIENTE").length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {recibos.filter((r) => r.estado === "PENDIENTE").length}
              </span>
            )}
          </button>

          <button
            onClick={() => setPestanaActiva("catalogo")}
            className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              pestanaActiva === "catalogo"
                ? "bg-[#826229] text-white shadow-md shadow-[#826229]/20"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Alquilar / Comprar
          </button>

          <button
            onClick={() => setPestanaActiva("publicar")}
            className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              pestanaActiva === "publicar"
                ? "bg-[#826229] text-white shadow-md shadow-[#826229]/20"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Publicar Inmueble (Vender / Alquilar)
          </button>

          <button
            onClick={() => setPestanaActiva("mis-operaciones")}
            className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              pestanaActiva === "mis-operaciones"
                ? "bg-[#826229] text-white shadow-md shadow-[#826229]/20"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Mis Alquileres y Compras ({misOperaciones.length})
          </button>

          <button
            onClick={() => setPestanaActiva("mis-propiedades")}
            className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              pestanaActiva === "mis-propiedades"
                ? "bg-[#826229] text-white shadow-md shadow-[#826229]/20"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Mis Propiedades en Venta ({misPublicaciones.length})
          </button>
        </div>
      </div>

      {/* 4. CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {cargando ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#826229]"></div>
            <p className="mt-4 text-xs font-semibold text-slate-500">Cargando tus operaciones...</p>
          </div>
        ) : (
          <>
            {/* ================================================================= */}
            {/* PESTAÑA 1: MIS RECIBOS Y PAGOS (CU-04 / RF-14)                   */}
            {/* ================================================================= */}
            {pestanaActiva === "recibos" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                      Mis Recibos de Alquiler y Expensas
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Gestiona tus pagos en línea de forma segura por transferencia o tarjeta.
                    </p>
                  </div>

                  {/* Filtro de estado */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                    {["TODOS", "PENDIENTE", "COBRADO"].map((est) => (
                      <button
                        key={est}
                        onClick={() => setFiltroRecibo(est)}
                        className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                          filtroRecibo === est
                            ? "bg-[#826229] text-white shadow-xs"
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        {est === "TODOS" ? "Todos" : est === "PENDIENTE" ? "Pendientes" : "Abonados"}
                      </button>
                    ))}
                  </div>
                </div>

                {recibosFiltrados.length === 0 ? (
                  <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <svg className="w-12 h-12 mx-auto text-slate-400 stroke-1 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      No se encontraron recibos
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {filtroRecibo === "PENDIENTE"
                        ? "¡Estás al día! No tienes recibos pendientes de pago."
                        : "Aún no se han emitido recibos en tu cuenta."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recibosFiltrados.map((recibo) => (
                      <div
                        key={recibo.id}
                        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {recibo.numero_recibo}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                                recibo.estado === "COBRADO"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300"
                              }`}
                            >
                              {recibo.estado === "COBRADO" ? "Abonado" : "Pendiente"}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3">
                            {recibo.periodo}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {recibo.inmueble_direccion || "Inmueble La Finca"}
                          </p>

                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                            <div className="flex justify-between text-xs text-slate-500">
                              <span>Emisión:</span>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {recibo.fecha_emision ? String(recibo.fecha_emision).slice(0, 10) : "-"}
                              </span>
                            </div>
                            {recibo.fecha_cobro && (
                              <div className="flex justify-between text-xs text-slate-500">
                                <span>Fecha de Pago:</span>
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                  {String(recibo.fecha_cobro).slice(0, 10)}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between items-baseline pt-2">
                              <span className="text-xs font-bold text-slate-400 uppercase">
                                Total a Pagar
                              </span>
                              <span className="text-xl font-extrabold text-[#024384] dark:text-blue-400">
                                ${Number(recibo.total).toLocaleString("es-AR")}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex gap-2">
                          {recibo.estado === "PENDIENTE" ? (
                            <button
                              onClick={() => setReciboParaPagar(recibo)}
                              className="w-full bg-[#826229] hover:bg-[#6c5120] text-white py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                              Pagar Online
                            </button>
                          ) : (
                            <button
                              onClick={() => setReciboParaVer(recibo)}
                              className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Ver Comprobante
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ================================================================= */}
            {/* PESTAÑA 2: ALQUILAR / COMPRAR INMUEBLE (CU-19 / CU-22 / CU-24)   */}
            {/* ================================================================= */}
            {pestanaActiva === "catalogo" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                      Catálogo de Inmuebles Disponibles
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Elige la propiedad de tu interés y envía tu propuesta de alquiler o compra.
                    </p>
                  </div>

                  <div className="relative w-full sm:w-72">
                    <input
                      type="text"
                      placeholder="Buscar por tipo, ciudad..."
                      value={busquedaInmueble}
                      onChange={(e) => setBusquedaInmueble(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#826229]"
                    />
                    <svg className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {catalogoFiltrado.map((inm) => (
                    <div
                      key={inm.id}
                      className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-lg transition-all flex flex-col group"
                    >
                      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={obtenerUrlFoto(inm.fotos)}
                          alt={inm.tipo_inmueble}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-emerald-600 text-white shadow-sm">
                          {inm.estado || "DISPONIBLE"}
                        </span>
                        <span className="absolute bottom-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-black/60 backdrop-blur-xs text-white">
                          {inm.tipo_inmueble}
                        </span>
                      </div>

                      <div className="p-5 flex flex-col justify-between flex-1">
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                            {inm.direccion}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {inm.localidad}{inm.provincia ? `, ${inm.provincia}` : ""}
                          </p>
                          {inm.observaciones && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
                              {inm.observaciones}
                            </p>
                          )}
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex justify-between items-baseline mb-3">
                            <span className="text-[10px] font-bold uppercase text-slate-400">
                              Precio de Referencia
                            </span>
                            <span className="text-lg font-extrabold text-[#024384] dark:text-blue-400">
                              ${Number(inm.precio).toLocaleString("es-AR")} USD
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() =>
                                setInmuebleParaOperar({
                                  inmueble: inm,
                                  tipo: "ALQUILER",
                                })
                              }
                              className="bg-[#826229] hover:bg-[#6c5120] text-white py-2 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer text-center"
                            >
                              Alquilar (CU-19)
                            </button>
                            <button
                              onClick={() =>
                                setInmuebleParaOperar({
                                  inmueble: inm,
                                  tipo: "COMPRA",
                                })
                              }
                              className="bg-[#024384] hover:bg-blue-900 text-white py-2 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer text-center"
                            >
                              Comprar (CU-22)
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* PESTAÑA 3: PUBLICAR MI INMUEBLE (CU-20 / CU-25)                  */}
            {/* ================================================================= */}
            {pestanaActiva === "publicar" && (
              <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Publicar mi Propiedad con La Finca
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Pon a la venta o en alquiler tu departamento, casa o local comercial. Nuestro equipo gestionará las visitas y contratos.
                  </p>
                </div>

                <form onSubmit={handlePublicarInmueble} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Tipo de Operación *
                      </label>
                      <select
                        value={nuevoInmueble.operacion}
                        onChange={(e) =>
                          setNuevoInmueble({
                            ...nuevoInmueble,
                            operacion: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                      >
                        <option value="VENTA">Venta de Inmueble (CU-20)</option>
                        <option value="ALQUILER">Poner en Alquiler</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Tipo de Inmueble *
                      </label>
                      <select
                        value={nuevoInmueble.tipo_inmueble}
                        onChange={(e) =>
                          setNuevoInmueble({
                            ...nuevoInmueble,
                            tipo_inmueble: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                      >
                        <option value="Casa">Casa</option>
                        <option value="Departamento">Departamento</option>
                        <option value="Chalet">Chalet</option>
                        <option value="Oficina">Oficina</option>
                        <option value="Local Comercial">Local Comercial</option>
                        <option value="Penthouse">Penthouse</option>
                        <option value="Duplex">Duplex</option>
                        <option value="Terreno">Terreno</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Dirección del Inmueble *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Bv. Oroño 1420, Piso 3"
                        value={nuevoInmueble.direccion}
                        onChange={(e) =>
                          setNuevoInmueble({
                            ...nuevoInmueble,
                            direccion: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Precio Pretendido (USD) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="1000"
                        placeholder="Ej: 95000"
                        value={nuevoInmueble.precio}
                        onChange={(e) =>
                          setNuevoInmueble({
                            ...nuevoInmueble,
                            precio: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Localidad / Ciudad
                      </label>
                      <input
                        type="text"
                        value={nuevoInmueble.localidad}
                        onChange={(e) =>
                          setNuevoInmueble({
                            ...nuevoInmueble,
                            localidad: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Provincia
                      </label>
                      <input
                        type="text"
                        value={nuevoInmueble.provincia}
                        onChange={(e) =>
                          setNuevoInmueble({
                            ...nuevoInmueble,
                            provincia: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  {/* Fotografía */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Fotografía del Inmueble
                    </label>
                    <div className="flex items-center gap-4">
                      {previewFoto && (
                        <img
                          src={previewFoto}
                          alt="Previa"
                          className="w-20 h-20 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                        />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFotoChange}
                        className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#826229]/10 file:text-[#826229] dark:file:text-[#C69B56] hover:file:bg-[#826229]/20 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Observaciones */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Características y Observaciones
                    </label>
                    <textarea
                      rows="3"
                      placeholder="Detalla cantidad de dormitorios, baños, cochera, superficie en m², estado general..."
                      value={nuevoInmueble.observaciones}
                      onChange={(e) =>
                        setNuevoInmueble({
                          ...nuevoInmueble,
                          observaciones: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                    ></textarea>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={publicando}
                      className="w-full bg-[#826229] hover:bg-[#6c5120] disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                    >
                      {publicando ? "Publicando Inmueble..." : "Enviar Inmueble para Publicación"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ================================================================= */}
            {/* PESTAÑA 4: MIS ALQUILERES Y COMPRAS (OPERACIONES DEL CLIENTE)    */}
            {/* ================================================================= */}
            {pestanaActiva === "mis-operaciones" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                      Mis Alquileres y Compras Realizadas
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Propiedades que has solicitado alquilar o comprar a través de La Finca.
                    </p>
                  </div>

                  <button
                    onClick={() => setPestanaActiva("catalogo")}
                    className="inline-flex items-center gap-2 bg-[#826229] hover:bg-[#6c5120] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm cursor-pointer"
                  >
                    Ver más inmuebles
                  </button>
                </div>

                {misOperaciones.length === 0 ? (
                  <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <svg className="w-12 h-12 mx-auto text-slate-400 stroke-1 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      No tienes compras ni alquileres activos aún
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Explora nuestro catálogo para solicitar el alquiler o compra de tu próximo inmueble.
                    </p>
                    <button
                      onClick={() => setPestanaActiva("catalogo")}
                      className="mt-4 bg-[#826229] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#6c5120] cursor-pointer"
                    >
                      Explorar Catálogo
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {misOperaciones.map((inm) => {
                      const esCompra = inm.observaciones?.toUpperCase().includes("COMPRA");
                      const esVendido = inm.estado === "VENDIDO";
                      const esAlquilado = inm.estado === "ALQUILADO";

                      return (
                        <div
                          key={inm.id}
                          className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                        >
                          <div>
                            <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800">
                              <img
                                src={obtenerUrlFoto(inm.fotos)}
                                alt={inm.tipo_inmueble}
                                className="w-full h-full object-cover"
                              />
                              <span
                                className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm ${
                                  esVendido
                                    ? "bg-purple-600 text-white"
                                    : esAlquilado
                                    ? "bg-blue-600 text-white"
                                    : "bg-amber-500 text-white"
                                }`}
                              >
                                {esVendido
                                  ? "Compra Concretada"
                                  : esAlquilado
                                  ? "Alquiler Activo"
                                  : "Solicitud en Revisión"}
                              </span>
                              <span className="absolute bottom-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-black/60 backdrop-blur-xs text-white">
                                {esCompra ? "Operación de Compra" : "Operación de Alquiler"}
                              </span>
                            </div>

                            <div className="p-4">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#826229] dark:text-[#C69B56]">
                                {inm.tipo_inmueble}
                              </span>
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                                {inm.direccion}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {inm.localidad}, {inm.provincia}
                              </p>
                              <p className="text-base font-extrabold text-[#024384] dark:text-blue-400 mt-2">
                                ${Number(inm.precio).toLocaleString("es-AR")} USD
                              </p>
                              {inm.observaciones && (
                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
                                  {limpiarDescripcion(inm.observaciones)}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="p-4 pt-0">
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-2 text-[11px] text-slate-500 flex justify-between items-center">
                              <span>Rol: Comprador / Inquilino</span>
                              {esVendido && (
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                  ✓ Posesión lista
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ================================================================= */}
            {/* PESTAÑA 5: MIS PROPIEDADES EN VENTA (PUBLICACIONES DEL CLIENTE)  */}
            {/* ================================================================= */}
            {pestanaActiva === "mis-propiedades" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                      Mis Inmuebles en Venta / Alquiler
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Propiedades que eres titular y has puesto en comercialización con La Finca.
                    </p>
                  </div>

                  <button
                    onClick={() => setPestanaActiva("publicar")}
                    className="inline-flex items-center gap-2 bg-[#826229] hover:bg-[#6c5120] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Publicar otro inmueble
                  </button>
                </div>

                {misPublicaciones.length === 0 ? (
                  <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <svg className="w-12 h-12 mx-auto text-slate-400 stroke-1 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      No tienes propiedades publicadas en venta aún
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      ¿Tienes una casa, departamento o local que deseas vender o alquilar? Publícalo directamente desde aquí.
                    </p>
                    <button
                      onClick={() => setPestanaActiva("publicar")}
                      className="mt-4 bg-[#826229] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#6c5120] cursor-pointer"
                    >
                      Publicar Inmueble Ahora
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {misPublicaciones.map((inm) => (
                      <div
                        key={inm.id}
                        className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800">
                            <img
                              src={obtenerUrlFoto(inm.fotos)}
                              alt={inm.tipo_inmueble}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-emerald-600 text-white shadow-sm">
                              {inm.estado || "DISPONIBLE"}
                            </span>
                          </div>

                          <div className="p-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#826229] dark:text-[#C69B56]">
                              {inm.tipo_inmueble}
                            </span>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                              {inm.direccion}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {inm.localidad}, {inm.provincia}
                            </p>
                            <p className="text-base font-extrabold text-[#024384] dark:text-blue-400 mt-2">
                              ${Number(inm.precio).toLocaleString("es-AR")} USD
                            </p>
                            {inm.observaciones && (
                              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
                                {limpiarDescripcion(inm.observaciones)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="p-4 pt-0">
                          <span className="text-[10px] font-semibold text-slate-400 block border-t border-slate-100 dark:border-slate-800 pt-2">
                            Publicado bajo tu titularidad
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* ===================================================================== */}
      {/* MODAL 1: PAGAR RECIBO (CU-04 / RF-14)                                 */}
      {/* ===================================================================== */}
      {reciboParaPagar && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-bold text-[#826229] dark:text-[#C69B56] uppercase tracking-wider">
                  Pasarela de Pago Segura
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Abonar Recibo {reciboParaPagar.numero_recibo}
                </h3>
                <p className="text-xs text-slate-500">
                  Período: {reciboParaPagar.periodo} • {reciboParaPagar.inmueble_direccion}
                </p>
              </div>
              <button
                onClick={() => setReciboParaPagar(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Desglose de conceptos */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Conceptos a Liquidar
              </span>
              <div className="space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800/60">
                {reciboParaPagar.conceptos?.filter((c) => Number(c.monto) > 0).map((c) => (
                  <div key={c.id} className="flex justify-between text-xs pt-1.5 first:pt-0">
                    <span className="text-slate-600 dark:text-slate-300">{c.concepto}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      ${Number(c.monto).toLocaleString("es-AR")}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Total a Debitar:</span>
                <span className="text-xl font-extrabold text-[#024384] dark:text-blue-400">
                  ${Number(reciboParaPagar.total).toLocaleString("es-AR")}
                </span>
              </div>
            </div>

            <form onSubmit={confirmarPagoRecibo} className="space-y-4">
              {/* Selección de Método de Pago */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Selecciona Medio de Pago
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMetodoPago("TRANSFERENCIA")}
                    className={`py-2.5 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      metodoPago === "TRANSFERENCIA"
                        ? "border-[#826229] bg-[#826229]/10 text-[#826229] dark:text-[#C69B56]"
                        : "border-slate-200 dark:border-slate-800 text-slate-500"
                    }`}
                  >
                    Transferencia Bancaria
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetodoPago("TARJETA")}
                    className={`py-2.5 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      metodoPago === "TARJETA"
                        ? "border-[#826229] bg-[#826229]/10 text-[#826229] dark:text-[#C69B56]"
                        : "border-slate-200 dark:border-slate-800 text-slate-500"
                    }`}
                  >
                    Tarjeta Débito / Crédito
                  </button>
                </div>
              </div>

              {metodoPago === "TRANSFERENCIA" ? (
                <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-bold">Cuenta Receptora:</span>
                    <select
                      value={cuentaBancaria}
                      onChange={(e) => setCuentaBancaria(e.target.value)}
                      className="bg-white dark:bg-slate-800 text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-bold"
                    >
                      <option value="1">Banco Santander (LAFINCA.PROPIEDADES)</option>
                      <option value="2">Banco Galicia (LAFINCA.GALICIA)</option>
                    </select>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">CBU Destino:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {cuentaBancaria === "1" ? "0720458920000000458920" : "0070889130000000889123"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Titular:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Inmobiliaria La Finca S.A.</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1">
                    Al confirmar, el sistema conciliará automáticamente la transferencia bancaria y acreditará tu recibo.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Número de Tarjeta
                    </label>
                    <input
                      type="text"
                      placeholder="4500 •••• •••• 1234"
                      value={datosTarjeta.numero}
                      onChange={(e) =>
                        setDatosTarjeta({ ...datosTarjeta, numero: e.target.value })
                      }
                      className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Vencimiento
                      </label>
                      <input
                        type="text"
                        placeholder="MM/AA"
                        value={datosTarjeta.vencimiento}
                        onChange={(e) =>
                          setDatosTarjeta({ ...datosTarjeta, vencimiento: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Código CVC
                      </label>
                      <input
                        type="password"
                        maxLength="4"
                        placeholder="•••"
                        value={datosTarjeta.cvv}
                        onChange={(e) =>
                          setDatosTarjeta({ ...datosTarjeta, cvv: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setReciboParaPagar(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={procesandoPago}
                  className="w-1/2 bg-[#826229] hover:bg-[#6c5120] disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  {procesandoPago ? "Procesando..." : "Confirmar Pago"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: VER COMPROBANTE DE PAGO (RNF-09)                             */}
      {/* ===================================================================== */}
      {reciboParaVer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="border-b-2 border-[#826229] pb-4 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold font-serif text-[#024384] dark:text-blue-400">
                  INMOBILIARIA LA FINCA S.A.
                </h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">
                  Comprobante Oficial de Cobro de Alquiler
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  PAGADO
                </span>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">
                  {reciboParaVer.numero_recibo}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 text-xs border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Inquilino:</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {user?.nombre} {user?.apellido}
                </p>
                <p className="text-slate-500">DNI: {user?.dni || "-"}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Propiedad:</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {reciboParaVer.inmueble_direccion}
                </p>
                <p className="text-slate-500">Período: {reciboParaVer.periodo}</p>
              </div>
            </div>

            {/* Conceptos (omite montos 0 por RNF-09) */}
            <div className="py-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Detalle Liquidado
              </span>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-left">
                    <th className="py-1">Concepto</th>
                    <th className="py-1 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {reciboParaVer.conceptos
                    ?.filter((c) => Number(c.monto) > 0)
                    .map((c) => (
                      <tr key={c.id}>
                        <td className="py-2 text-slate-700 dark:text-slate-300">{c.concepto}</td>
                        <td className="py-2 text-right font-semibold text-slate-900 dark:text-white">
                          ${Number(c.monto).toLocaleString("es-AR")}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              <div className="mt-4 pt-3 border-t-2 border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Total Abonado:</span>
                <span className="text-2xl font-extrabold text-[#024384] dark:text-blue-400">
                  ${Number(reciboParaVer.total).toLocaleString("es-AR")}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg text-[10px] text-slate-500 space-y-1">
              <p>Fecha de liquidación: {reciboParaVer.fecha_cobro || "Acreditado"}</p>
              <p>Comprobante emitido electrónicamente por el sistema de gestión de Inmobiliaria La Finca.</p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => window.print()}
                className="w-1/2 bg-[#826229] hover:bg-[#6c5120] text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir Recibo
              </button>
              <button
                onClick={() => setReciboParaVer(null)}
                className="w-1/2 border border-slate-200 dark:border-slate-700 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: SOLICITUD DE ALQUILER O COMPRA (CU-19 / CU-22)              */}
      {/* ===================================================================== */}
      {inmuebleParaOperar && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#826229] dark:text-[#C69B56]">
                  {inmuebleParaOperar.tipo === "ALQUILER" ? "Solicitud de Alquiler (CU-19)" : "Propuesta de Compra (CU-22)"}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {inmuebleParaOperar.inmueble.direccion}
                </h3>
                <p className="text-xs text-slate-500">
                  {inmuebleParaOperar.inmueble.tipo_inmueble} • Valor: ${Number(inmuebleParaOperar.inmueble.precio).toLocaleString("es-AR")} USD
                </p>
              </div>
              <button
                onClick={() => setInmuebleParaOperar(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEnviarSolicitud} className="space-y-4">
              {inmuebleParaOperar.tipo === "ALQUILER" ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Plazo del Contrato
                      </label>
                      <select
                        value={datosSolicitud.plazoMeses}
                        onChange={(e) =>
                          setDatosSolicitud({ ...datosSolicitud, plazoMeses: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                      >
                        <option value="24">24 Meses (Estándar)</option>
                        <option value="36">36 Meses (Comercial)</option>
                        <option value="12">12 Meses (Temporal)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Garantía Presentada
                      </label>
                      <select
                        value={datosSolicitud.tipoGarantia}
                        onChange={(e) =>
                          setDatosSolicitud({ ...datosSolicitud, tipoGarantia: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                      >
                        <option value="Recibo de Sueldo">Recibo de Sueldo</option>
                        <option value="Garantía Propietaria">Garantía Propietaria</option>
                        <option value="Seguro de Caución Finaer">Seguro de Caución Finaer</option>
                        <option value="Aval Bancario">Aval Bancario</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                    <p className="font-bold">Estimación de Ingreso al Inmueble:</p>
                    <p>• Mes de Alquiler Inicial: ${Number(inmuebleParaOperar.inmueble.precio).toLocaleString("es-AR")}</p>
                    <p>• Mes de Depósito de Garantía: ${Number(inmuebleParaOperar.inmueble.precio).toLocaleString("es-AR")}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Monto de Oferta o Seña Inicial (USD)
                    </label>
                    <input
                      type="number"
                      required
                      min="1000"
                      placeholder={`Ej: ${Math.round(Number(inmuebleParaOperar.inmueble.precio) * 0.05)} (Seña 5%)`}
                      value={datosSolicitud.propuestaMonto}
                      onChange={(e) =>
                        setDatosSolicitud({ ...datosSolicitud, propuestaMonto: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-xs text-blue-800 dark:text-blue-300 space-y-1">
                    <p className="font-bold">Condiciones de Compra:</p>
                    <p>• Escrituración y posesión inmediata ante escribano público colegiado.</p>
                    <p>• La seña reserva el inmueble por 30 días corridos.</p>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notas adicionales o propuesta
                </label>
                <textarea
                  rows="2"
                  placeholder="Horarios disponibles para coordinar visita, propuesta de forma de pago..."
                  value={datosSolicitud.observaciones}
                  onChange={(e) =>
                    setDatosSolicitud({ ...datosSolicitud, observaciones: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                ></textarea>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setInmuebleParaOperar(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={solicitudEnviada}
                  className="w-1/2 bg-[#826229] hover:bg-[#6c5120] text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  {solicitudEnviada ? "Enviando Solicitud..." : "Confirmar Solicitud"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

