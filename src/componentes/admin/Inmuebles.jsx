
import { useEffect, useMemo, useState } from "react";

import {
  getInmuebles,
  crearInmueble,
  editarInmueble,
  eliminarInmueble,
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

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [inmuebleEditando, setInmuebleEditando] = useState(null);

  const [formulario, setFormulario] = useState(formularioInicial);
  const [archivoFoto, setArchivoFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);

  const [guardando, setGuardando] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState("");

  // ==========================================
  // CARGAR INMUEBLES
  // ==========================================
  const cargarInmuebles = async () => {
    setCargando(true);

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
    cargarInmuebles();
  }, []);

  // ==========================================
  // BUSCADOR
  // ==========================================
  const inmueblesFiltrados = useMemo(() => {
    const termino = busqueda.toLowerCase().trim();

    if (!termino) return inmuebles;

    return inmuebles.filter((inmueble) =>
      [
        inmueble.tipo_inmueble,
        inmueble.direccion,
        inmueble.localidad,
        inmueble.provincia,
        inmueble.estado,
      ]
        .filter(Boolean)
        .some((valor) =>
          String(valor).toLowerCase().includes(termino)
        )
    );
  }, [inmuebles, busqueda]);

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
  const manejarEliminar = async (id) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que querés eliminar este inmueble?"
    );

    if (!confirmar) return;

    try {
      await eliminarInmueble(id);
      setMensajeAlerta("Inmueble eliminado correctamente.");
      await cargarInmuebles();
    } catch (error) {
      console.error("Error al eliminar inmueble:", error);

      setMensajeAlerta(
        error.response?.data?.mensaje ||
        "No se pudo eliminar el inmueble."
      );
    }
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

      {/* MENSAJE */}
      {mensajeAlerta && (
        <div className="p-4 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
          {mensajeAlerta}

          <button
            onClick={() => setMensajeAlerta("")}
            className="float-right font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* BUSCADOR */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">

        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por tipo, dirección, localidad o estado..."
          className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-700"
        />

        <p className="text-sm text-slate-500 mt-3">
          {inmueblesFiltrados.length} inmueble(s) encontrado(s)
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
              className="overflow-hidden bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300 hover:border-[#826229] hover:shadow-lg hover:-translate-y-1"
            >

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

                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-800">
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

                {inmueble.observaciones && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3">
                    {inmueble.observaciones}
                  </p>
                )}

                {/* ACCIONES */}
                <div className="flex gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">

                  <button
                    onClick={() => abrirFormularioEditar(inmueble)}
                   className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold bg-red-100 text-red-700 transition-all duration-300 hover:bg-red-200 hover:shadow-md hover:-translate-y-0.5"
                    style={{ backgroundColor: "#826229" }}
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => manejarEliminar(inmueble.id)}
                    className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold bg-red-100 text-red-700 transition-all duration-300 hover:bg-red-200 hover:shadow-md hover:-translate-y-0.5"
                  >s
                    Eliminar
                  </button>

                </div>

              </div>
            </article>

          ))}

        </div>
      )}

    </div>
  );
}

export default Inmuebles;
