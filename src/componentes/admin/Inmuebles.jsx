
import { useEffect, useMemo, useState } from "react";

import {
  getInmuebles,
  crearInmueble,
  editarInmueble,
  eliminarInmueble,
  resolverOperacionInmueble,
} from "../../services/inmuebles.service";

const API_BASE = "http://localhost:4000";

const formularioInicial = {
  tipo_inmueble: "",
  precio: "",
  direccion: "",
  localidad: "",
  provincia: "",
  estado: "DISPONIBLE",
  fotos: "",
  observaciones: "",
};

function obtenerUrlFoto(foto) {
  if (!foto) return null;

  if (foto.startsWith("http")) {
    return foto;
  }

  return `${API_BASE}${foto.startsWith("/") ? "" : "/"}${foto}`;
}

function Inmuebles() {
  const [inmuebles, setInmuebles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [inmuebleEditando, setInmuebleEditando] = useState(null);

  const [formulario, setFormulario] = useState(formularioInicial);
  const [archivoFoto, setArchivoFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);

  const [guardando, setGuardando] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState("");
  const [dialogoConfirmacion, setDialogoConfirmacion] = useState(null);

  // ==========================================
  // CARGAR INMUEBLES
  // ==========================================
  const cargarInmuebles = async () => {
    try {
      const datos = await getInmuebles();

      const lista = Array.isArray(datos)
        ? datos
        : datos?.inmuebles || datos?.data || [];

      setInmuebles(lista);
    } catch (error) {
      console.error("Error al cargar inmuebles:", error);
      setInmuebles([]);
      setMensajeAlerta("No se pudieron cargar los inmuebles.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let activo = true;

    getInmuebles()
      .then((datos) => {
        if (!activo) return;
        const lista = Array.isArray(datos)
          ? datos
          : datos?.inmuebles || datos?.data || [];
        setInmuebles(lista);
      })
      .catch((error) => {
        if (!activo) return;
        console.error("Error al cargar inmuebles:", error);
        setInmuebles([]);
        setMensajeAlerta("No se pudieron cargar los inmuebles.");
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  // ==========================================
  // RESOLVER OPERACIÓN (CONFIRMAR ALQUILER / VENTA / RECHAZAR)
  // ==========================================
  const pedirConfirmacionOperacion = (inmueble, accion) => {
    const esVenta = accion === "CONFIRMAR_VENTA";
    const esAlquiler = accion === "CONFIRMAR_ALQUILER";
    const esAprobar = accion === "APROBAR_PUBLICACION";
    const esRechazarPub = accion === "RECHAZAR_PUBLICACION";

    let titulo;
    let mensaje;
    let textoBoton;
    let colorBoton = "bg-emerald-600 hover:bg-emerald-700";

    if (esVenta) {
      titulo = "¿Confirmar Venta del Inmueble?";
      mensaje = `La propiedad en "${inmueble.direccion}" pasará a estado VENDIDO, se emitirá automáticamente el recibo oficial de seña para el comprador y se acreditará la comisión del 3% ($${Math.round(
        Number(inmueble.precio) * 0.03
      ).toLocaleString("es-AR")} USD) en la cuenta bancaria.`;
      textoBoton = "Confirmar Venta";
    } else if (esAlquiler) {
      titulo = "¿Confirmar Alquiler del Inmueble?";
      mensaje = `La propiedad en "${inmueble.direccion}" pasará a estado ALQUILADO y se emitirá automáticamente el recibo de locación mensual para el inquilino.`;
      textoBoton = "Confirmar Alquiler";
    } else if (esAprobar) {
      titulo = "¿Aprobar Publicación del Inmueble?";
      mensaje = `La propiedad en "${inmueble.direccion}" presentada por el cliente quedará aprobada y visible como DISPONIBLE en el catálogo general.`;
      textoBoton = "Aprobar y Publicar";
    } else if (esRechazarPub) {
      titulo = "¿Rechazar Publicación?";
      mensaje = `La propiedad "${inmueble.direccion}" quedará en estado RECHAZADO y no se mostrará en el catálogo general.`;
      textoBoton = "Rechazar Publicación";
      colorBoton = "bg-red-600 hover:bg-red-700";
    } else {
      titulo = "¿Rechazar Solicitud de Reserva?";
      mensaje = `La reserva quedará cancelada y "${inmueble.direccion}" volverá a estar DISPONIBLE en el catálogo.`;
      textoBoton = "Rechazar Reserva";
      colorBoton = "bg-red-600 hover:bg-red-700";
    }

    setDialogoConfirmacion({
      titulo,
      mensaje,
      textoBoton,
      colorBoton,
      onConfirmar: async () => {
        try {
          const resp = await resolverOperacionInmueble(inmueble.id, { accion });
          setMensajeAlerta({
            tipo: "exito",
            texto: resp.message || "Operación procesada con éxito.",
          });
          await cargarInmuebles();
        } catch (error) {
          console.error("Error al resolver operación:", error);
          setMensajeAlerta({
            tipo: "error",
            texto:
              error.response?.data?.message || "Error al procesar la operación.",
          });
        } finally {
          setDialogoConfirmacion(null);
        }
      },
    });
  };

  // ==========================================
  // BUSCADOR Y FILTROS
  // ==========================================
  const inmueblesFiltrados = useMemo(() => {
    let lista = inmuebles;
    if (filtroEstado !== "TODOS") {
      lista = lista.filter((i) => i.estado === filtroEstado);
    }

    const termino = busqueda.toLowerCase().trim();
    if (!termino) return lista;

    return lista.filter((inmueble) =>
      [
        inmueble.tipo_inmueble,
        inmueble.direccion,
        inmueble.localidad,
        inmueble.provincia,
        inmueble.estado,
        inmueble.cliente_nombre,
        inmueble.cliente_apellido,
      ]
        .filter(Boolean)
        .some((valor) =>
          String(valor).toLowerCase().includes(termino)
        )
    );
  }, [inmuebles, busqueda, filtroEstado]);

  // ==========================================
  // MANEJAR CAMBIOS DEL FORMULARIO
  // ==========================================
  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  // ==========================================
  // SELECCIONAR FOTOGRAFÍA
  // ==========================================
  const manejarFoto = (e) => {
    const archivo = e.target.files[0];

    if (!archivo) return;

    if (!archivo.type.startsWith("image/")) {
      setMensajeAlerta("Seleccioná un archivo de imagen válido.");
      e.target.value = "";
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      setMensajeAlerta("La imagen no puede superar los 5 MB.");
      e.target.value = "";
      return;
    }

    setArchivoFoto(archivo);
    setPreviewFoto(URL.createObjectURL(archivo));
    setMensajeAlerta("");
  };

  // ==========================================
  // ABRIR FORMULARIO PARA NUEVO INMUEBLE
  // ==========================================
  const abrirFormularioNuevo = () => {
    setInmuebleEditando(null);
    setFormulario(formularioInicial);
    setArchivoFoto(null);
    setPreviewFoto(null);
    setMensajeAlerta("");
    setMostrarFormulario(true);
  };

  // ==========================================
  // ABRIR FORMULARIO PARA EDITAR
  // ==========================================
  const abrirFormularioEditar = (inmueble) => {
    setInmuebleEditando(inmueble);

    setFormulario({
      tipo_inmueble: inmueble.tipo_inmueble || "",
      precio: inmueble.precio ?? "",
      direccion: inmueble.direccion || "",
      localidad: inmueble.localidad || "",
      provincia: inmueble.provincia || "",
      estado: inmueble.estado || "DISPONIBLE",
      fotos: inmueble.fotos || "",
      observaciones: inmueble.observaciones || "",
    });

    setArchivoFoto(null);
    setPreviewFoto(obtenerUrlFoto(inmueble.fotos));
    setMensajeAlerta("");
    setMostrarFormulario(true);
  };

  // ==========================================
  // CERRAR FORMULARIO
  // ==========================================
  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setInmuebleEditando(null);
    setFormulario(formularioInicial);
    setArchivoFoto(null);
    setPreviewFoto(null);
    setMensajeAlerta("");
  };

  // ==========================================
  // GUARDAR INMUEBLE
  // ==========================================
  const manejarGuardar = async (e) => {
    e.preventDefault();

    setMensajeAlerta("");

    if (
      !formulario.tipo_inmueble.trim() ||
      !formulario.direccion.trim() ||
      formulario.precio === "" ||
      Number(formulario.precio) < 0 ||
      !Number.isFinite(Number(formulario.precio))
    ) {
      setMensajeAlerta(
        "Completá el tipo de inmueble, la dirección y un precio válido."
      );
      return;
    }

    setGuardando(true);

    try {
      let datosInmueble;

      if (archivoFoto) {
        datosInmueble = new FormData();

        Object.entries(formulario).forEach(([campo, valor]) => {
          datosInmueble.append(campo, valor);
        });

        datosInmueble.append("foto", archivoFoto);
      } else {
        datosInmueble = {
          ...formulario,
          precio: Number(formulario.precio),
        };
      }

      if (inmuebleEditando) {
        await editarInmueble(inmuebleEditando.id, datosInmueble);
        setMensajeAlerta("Inmueble actualizado correctamente.");
      } else {
        await crearInmueble(datosInmueble);
        setMensajeAlerta("Inmueble registrado correctamente.");
      }

      cerrarFormulario();
      await cargarInmuebles();
    } catch (error) {
      console.error("Error al guardar inmueble:", error);

      setMensajeAlerta(
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        "No se pudo guardar el inmueble. Revisá los datos e intentá nuevamente."
      );
    } finally {
      setGuardando(false);
    }
  };

  // ==========================================
  // ELIMINAR INMUEBLE
  // ==========================================
  const pedirConfirmacionEliminar = (inmueble) => {
    setDialogoConfirmacion({
      titulo: "¿Eliminar Inmueble?",
      mensaje: `¿Estás seguro de que deseas eliminar permanentemente el inmueble en "${inmueble.direccion}"? Esta acción no se puede deshacer.`,
      textoBoton: "Eliminar Definitivamente",
      colorBoton: "bg-red-600 hover:bg-red-700",
      onConfirmar: async () => {
        try {
          await eliminarInmueble(inmueble.id);
          setMensajeAlerta({
            tipo: "exito",
            texto: "Inmueble eliminado correctamente.",
          });
          await cargarInmuebles();
        } catch (error) {
          console.error("Error al eliminar inmueble:", error);
          setMensajeAlerta({
            tipo: "error",
            texto:
              error.response?.data?.mensaje ||
              "No se pudo eliminar el inmueble.",
          });
        } finally {
          setDialogoConfirmacion(null);
        }
      },
    });
  };

  // ==========================================
  // FORMATEAR PRECIO
  // ==========================================
  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(Number(precio) || 0);
  };

  // ==========================================
  // INTERFAZ
  // ==========================================
  return (
    <div className="space-y-6">

      {/* ENCABEZADO */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Gestión de Inmuebles
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Administrá las propiedades de La Finca.
          </p>
        </div>

        <button
          onClick={abrirFormularioNuevo}
          className="px-5 py-3 rounded-lg text-white font-semibold shadow-sm transition hover:opacity-90"
          style={{ backgroundColor: "#826229" }}
        >
          + Agregar inmueble
        </button>

      </div>

      {/* MENSAJE DE ALERTA PERSONALIZADO */}
      {mensajeAlerta && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm shadow-sm transition-all ${
            typeof mensajeAlerta === "object" && mensajeAlerta.tipo === "error"
              ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
              : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">
              {typeof mensajeAlerta === "object" && mensajeAlerta.tipo === "error"
                ? "⚠️"
                : "✓"}
            </span>
            <span>
              {typeof mensajeAlerta === "string"
                ? mensajeAlerta
                : mensajeAlerta.texto}
            </span>
          </div>

          <button
            onClick={() => setMensajeAlerta("")}
            className="text-xs font-bold hover:underline cursor-pointer ml-4"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* BUSCADOR Y FILTROS POR ESTADO */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "TODOS", label: "Todos", count: inmuebles.length },
            {
              id: "RESERVADO",
              label: "Reservas / Solicitudes",
              count: inmuebles.filter((i) => i.estado === "RESERVADO").length,
              urgente: true,
            },
            {
              id: "DISPONIBLE",
              label: "Disponibles",
              count: inmuebles.filter(
                (i) => i.estado === "DISPONIBLE" || !i.estado
              ).length,
            },
            {
              id: "ALQUILADO",
              label: "Alquilados",
              count: inmuebles.filter((i) => i.estado === "ALQUILADO").length,
            },
            {
              id: "VENDIDO",
              label: "Vendidos",
              count: inmuebles.filter((i) => i.estado === "VENDIDO").length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFiltroEstado(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filtroEstado === tab.id
                  ? "bg-[#826229] text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  tab.urgente && tab.count > 0
                    ? "bg-red-500 text-white font-extrabold"
                    : filtroEstado === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por tipo, dirección, cliente solicitante, localidad o estado..."
          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#826229] text-xs"
        />

        <p className="text-xs text-slate-500">
          Mostrando {inmueblesFiltrados.length} de {inmuebles.length} inmuebles
        </p>
      </div>

      {/* FORMULARIO */}
      {mostrarFormulario && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">

          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
            {inmuebleEditando ? "Editar inmueble" : "Registrar inmueble"}
          </h2>

          <form onSubmit={manejarGuardar} className="space-y-5">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* TIPO */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                  Tipo de inmueble *
                </label>

                <input
                  type="text"
                  name="tipo_inmueble"
                  value={formulario.tipo_inmueble}
                  onChange={manejarCambio}
                  placeholder="Ej.: Casa, departamento, terreno..."
                  required
                  className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              {/* PRECIO */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                  Precio *
                </label>

                <input
                  type="number"
                  name="precio"
                  value={formulario.precio}
                  onChange={manejarCambio}
                  min="0"
                  step="0.01"
                  placeholder="Ej.: 150000"
                  required
                  className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              {/* DIRECCIÓN */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                  Dirección *
                </label>

                <input
                  type="text"
                  name="direccion"
                  value={formulario.direccion}
                  onChange={manejarCambio}
                  placeholder="Dirección del inmueble"
                  required
                  className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              {/* LOCALIDAD */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                  Localidad
                </label>

                <input
                  type="text"
                  name="localidad"
                  value={formulario.localidad}
                  onChange={manejarCambio}
                  placeholder="Localidad"
                  className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              {/* PROVINCIA */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                  Provincia
                </label>

                <input
                  type="text"
                  name="provincia"
                  value={formulario.provincia}
                  onChange={manejarCambio}
                  placeholder="Provincia"
                  className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              {/* ESTADO */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                  Estado
                </label>

                <select
                  name="estado"
                  value={formulario.estado}
                  onChange={manejarCambio}
                  className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  <option value="DISPONIBLE">Disponible</option>
                  <option value="RESERVADO">Reservado</option>
                  <option value="ALQUILADO">Alquilado</option>
                  <option value="VENDIDO">Vendido</option>
                </select>
              </div>

            </div>

            {/* FOTO */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                Fotografía del inmueble
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  id="foto-inmueble"
                  type="file"
                  accept="image/*"
                  onChange={manejarFoto}
                  className="hidden"
                />

                <label
                  htmlFor="foto-inmueble"
                  className="inline-flex items-center px-5 py-3 rounded-lg text-white font-semibold cursor-pointer hover:opacity-90 transition"
                  style={{ backgroundColor: "#826229" }}
                >
                  Seleccionar fotografía
                </label>

                {archivoFoto && (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {archivoFoto.name}
                  </span>
                )}
              </div>
              {previewFoto && (
                <div className="mt-4">
                  <img
                    src={previewFoto}
                    alt="Vista previa del inmueble"
                    className="w-full max-w-xs h-48 object-cover rounded-lg border border-slate-200"
                  />
                </div>
              )}

              <p className="text-xs text-slate-500 mt-2">
                Formatos de imagen. Tamaño máximo: 5 MB.
              </p>
            </div>

            {/* OBSERVACIONES */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                Observaciones
              </label>

              <textarea
                name="observaciones"
                value={formulario.observaciones}
                onChange={manejarCambio}
                rows="4"
                placeholder="Características y detalles del inmueble..."
                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
              />
            </div>

            {/* BOTONES */}
            <div className="flex flex-wrap gap-3 pt-2">

              <button
                type="submit"
                disabled={guardando}
                className="px-6 py-3 rounded-lg text-white font-semibold disabled:opacity-50"
                style={{ backgroundColor: "#826229" }}
              >
                {guardando
                  ? "Guardando..."
                  : inmuebleEditando
                    ? "Guardar cambios"
                    : "Registrar inmueble"}
              </button>

              <button
                type="button"
                onClick={cerrarFormulario}
                disabled={guardando}
                className="px-6 py-3 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white font-semibold"
              >
                Cancelar
              </button>

            </div>

          </form>
        </div>
      )}

      {/* LISTADO */}
      {cargando ? (
        <p className="text-center py-10 text-slate-500">
          Cargando inmuebles...
        </p>
      ) : inmueblesFiltrados.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400">
            No se encontraron inmuebles.
          </p>
        </div>
      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {inmueblesFiltrados.map((inmueble) => (

            <article
              key={inmueble.id}
              className="overflow-hidden bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300 hover:border-[#826229] hover:shadow-lg flex flex-col justify-between h-full"
            >
              <div>
                {/* IMAGEN */}
                {inmueble.fotos ? (
                  <img
                    src={obtenerUrlFoto(inmueble.fotos)}
                    alt={inmueble.tipo_inmueble}
                    className="w-full h-52 object-cover"
                  />
                ) : (
                  <div className="w-full h-52 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    Sin fotografía
                  </div>
                )}

                {/* INFORMACIÓN */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                      {inmueble.tipo_inmueble}
                    </h3>

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                        inmueble.estado === "DISPONIBLE"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : inmueble.estado === "PENDIENTE"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 ring-2 ring-blue-400/50"
                          : inmueble.estado === "RESERVADO"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 ring-2 ring-amber-400/50"
                          : inmueble.estado === "ALQUILADO"
                          ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300"
                          : "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300"
                      }`}
                    >
                      {inmueble.estado || "DISPONIBLE"}
                    </span>
                  </div>

                  <p className="text-xl font-bold" style={{ color: "#826229" }}>
                    {formatearPrecio(inmueble.precio)}
                  </p>

                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    <strong>Dirección:</strong> {inmueble.direccion}
                  </p>

                  {(inmueble.localidad || inmueble.provincia) && (
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {[inmueble.localidad, inmueble.provincia]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}

                  {/* BLOQUE DE SOLICITUD / RESERVA ACTIVA (CU-19 / CU-22) */}
                  {inmueble.estado === "RESERVADO" && (
                    <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-950 dark:text-amber-200 space-y-2">
                      <div className="flex items-center justify-between border-b border-amber-200/50 dark:border-amber-800/50 pb-1.5">
                        <span className="font-bold flex items-center gap-1.5">
                          <span>🔔</span>
                          <span>
                            {inmueble.observaciones?.toUpperCase().includes("COMPRA")
                              ? "PEDIDO DE COMPRA (CU-22)"
                              : "PEDIDO DE ALQUILER (CU-19)"}
                          </span>
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900/60 font-bold">
                          RESERVADO
                        </span>
                      </div>

                      <div className="space-y-0.5 text-slate-700 dark:text-slate-300">
                        <p>
                          <strong className="text-slate-900 dark:text-white">Cliente Solicitante:</strong>{" "}
                          {inmueble.cliente_nombre
                            ? `${inmueble.cliente_nombre} ${inmueble.cliente_apellido}`
                            : "Cliente registrado"}
                        </p>
                        {inmueble.cliente_email && (
                          <p className="text-[11px] text-slate-500">
                            <strong>Email:</strong> {inmueble.cliente_email}
                          </p>
                        )}
                        {inmueble.cliente_telefono && (
                          <p className="text-[11px] text-slate-500">
                            <strong>Tel:</strong> {inmueble.cliente_telefono}
                          </p>
                        )}
                        {inmueble.cliente_dni && (
                          <p className="text-[11px] text-slate-500">
                            <strong>DNI:</strong> {inmueble.cliente_dni}
                          </p>
                        )}
                      </div>

                      {/* Botones para resolver la operación */}
                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={() =>
                            pedirConfirmacionOperacion(
                              inmueble,
                              inmueble.observaciones?.toUpperCase().includes("COMPRA")
                                ? "CONFIRMAR_VENTA"
                                : "CONFIRMAR_ALQUILER"
                            )
                          }
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer text-center"
                        >
                          {inmueble.observaciones?.toUpperCase().includes("COMPRA")
                            ? "Confirmar Venta"
                            : "Confirmar Alquiler"}
                        </button>

                        <button
                          onClick={() => pedirConfirmacionOperacion(inmueble, "RECHAZAR")}
                          className="py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                        >
                          Rechazar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* BLOQUE DE REVISIÓN PARA PUBLICACIONES DE CLIENTES (CU-20 / CU-25) */}
                  {inmueble.estado === "PENDIENTE" && (
                    <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/80 text-xs text-blue-950 dark:text-blue-200 space-y-2">
                      <div className="flex items-center justify-between border-b border-blue-200/50 dark:border-blue-800/50 pb-1.5">
                        <span className="font-bold flex items-center gap-1.5">
                          <span>📋</span>
                          <span>PUBLICACIÓN EN REVISIÓN</span>
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-200 dark:bg-blue-900/60 font-bold">
                          PENDIENTE
                        </span>
                      </div>

                      <div className="space-y-0.5 text-slate-700 dark:text-slate-300">
                        <p>
                          <strong className="text-slate-900 dark:text-white">Propietario / Cliente:</strong>{" "}
                          {inmueble.cliente_nombre
                            ? `${inmueble.cliente_nombre} ${inmueble.cliente_apellido}`
                            : "Cliente registrado"}
                        </p>
                        {inmueble.cliente_email && (
                          <p className="text-[11px] text-slate-500">
                            <strong>Email:</strong> {inmueble.cliente_email}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={() => pedirConfirmacionOperacion(inmueble, "APROBAR_PUBLICACION")}
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer text-center"
                        >
                          Aprobar Publicación
                        </button>

                        <button
                          onClick={() => pedirConfirmacionOperacion(inmueble, "RECHAZAR_PUBLICACION")}
                          className="py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                        >
                          Rechazar
                        </button>
                      </div>
                    </div>
                  )}

                  {inmueble.observaciones && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3">
                      {inmueble.observaciones}
                    </p>
                  )}
                </div>
              </div>

              {/* ACCIONES ALINEADAS ABAJO */}
              <div className="p-5 pt-0">
                <div className="flex gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => abrirFormularioEditar(inmueble)}
                    className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer text-center"
                    style={{ backgroundColor: "#826229" }}
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => pedirConfirmacionEliminar(inmueble)}
                    className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 transition-all duration-300 hover:bg-red-200 dark:hover:bg-red-900/60 hover:shadow-md hover:-translate-y-0.5 cursor-pointer text-center"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </article>

          ))}

        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN PERSONALIZADO (Reemplaza window.confirm) */}
      {dialogoConfirmacion && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#826229]/10 rounded-xl text-[#826229] dark:text-[#C69B56]">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {dialogoConfirmacion.titulo}
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {dialogoConfirmacion.mensaje}
            </p>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setDialogoConfirmacion(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={dialogoConfirmacion.onConfirmar}
                className={`w-1/2 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-colors cursor-pointer ${dialogoConfirmacion.colorBoton}`}
              >
                {dialogoConfirmacion.textoBoton}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Inmuebles;
