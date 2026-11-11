import { useEffect, useState, useCallback } from "react";
import {
  getClientes,
  crearCliente,
  editarCliente,
  eliminarCliente,
} from "../../services/clientes.service";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [archivoFoto, setArchivoFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState(null);
  const [dialogoConfirmacion, setDialogoConfirmacion] = useState(null);

  const [formulario, setFormulario] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    dni: "",
    fechaNacimiento: "",
    genero: "",
    direccion: "",
    ciudad: "",
    provincia: "",
    observaciones: "",
    foto: "",
  });

  const cargarClientes = useCallback(async () => {
    try {
      const datos = await getClientes();
      setClientes(Array.isArray(datos) ? datos : []);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    let activo = true;
    getClientes()
      .then((datos) => {
        if (activo) {
          setClientes(Array.isArray(datos) ? datos : []);
          setCargando(false);
        }
      })
      .catch((error) => {
        console.error("Error al cargar clientes:", error);
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setArchivoFoto(file);
      setPreviewFoto(URL.createObjectURL(file));
    }
  };

  const abrirNuevoCliente = () => {
    setClienteEditando(null);
    setArchivoFoto(null);
    setPreviewFoto("");
    setFormulario({
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      dni: "",
      fechaNacimiento: "",
      genero: "",
      direccion: "",
      ciudad: "",
      provincia: "",
      observaciones: "",
      foto: "",
    });
    setMostrarFormulario(true);
  };

  const abrirEditarCliente = (cliente) => {
    setClienteEditando(cliente);
    setArchivoFoto(null);
    const fotoActual = cliente.foto
      ? cliente.foto.startsWith("http")
        ? cliente.foto
        : `http://localhost:4000${cliente.foto}`
      : "";
    setPreviewFoto(fotoActual);

    // Formatear fecha para el input tipo date (YYYY-MM-DD)
    let fechaFormateada = "";
    if (cliente.fechaNacimiento) {
      fechaFormateada = new Date(cliente.fechaNacimiento)
        .toISOString()
        .split("T")[0];
    }

    setFormulario({
      nombre: cliente.nombre || "",
      apellido: cliente.apellido || "",
      email: cliente.email || "",
      telefono: cliente.telefono || "",
      dni: cliente.dni || "",
      fechaNacimiento: fechaFormateada,
      genero: cliente.genero || "",
      direccion: cliente.direccion || "",
      ciudad: cliente.ciudad || "",
      provincia: cliente.provincia || "",
      observaciones: cliente.observaciones || "",
      foto: cliente.foto || "",
    });
    setMostrarFormulario(true);
  };

  const cancelarFormulario = () => {
    setMostrarFormulario(false);
    setClienteEditando(null);
    setArchivoFoto(null);
    setPreviewFoto("");
  };

  const guardarCliente = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensajeAlerta(null);

    try {
      let dataToSend;

      // Si se seleccionó un archivo físico, enviamos FormData con la imagen
      if (archivoFoto instanceof File) {
        const formData = new FormData();
        formData.append("nombre", formulario.nombre);
        formData.append("apellido", formulario.apellido);
        formData.append("email", formulario.email);
        formData.append("telefono", formulario.telefono || "");
        formData.append("dni", formulario.dni || "");
        formData.append("fechaNacimiento", formulario.fechaNacimiento || "");
        formData.append("genero", formulario.genero || "");
        formData.append("direccion", formulario.direccion || "");
        formData.append("ciudad", formulario.ciudad || "");
        formData.append("provincia", formulario.provincia || "");
        formData.append("observaciones", formulario.observaciones || "");
        formData.append("foto", archivoFoto);
        dataToSend = formData;
      } else {
        dataToSend = { ...formulario };
      }

      if (clienteEditando) {
        await editarCliente(clienteEditando.id, dataToSend);
        setMensajeAlerta({
          tipo: "exito",
          texto: "Cliente actualizado con éxito.",
        });
      } else {
        await crearCliente(dataToSend);
        setMensajeAlerta({
          tipo: "exito",
          texto: "Cliente registrado con éxito.",
        });
      }

      cancelarFormulario();
      cargarClientes();
    } catch (error) {
      setMensajeAlerta({
        tipo: "error",
        texto: error.message || "Ocurrió un error al guardar el cliente.",
      });
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarCliente = (cliente) => {
    setDialogoConfirmacion({
      titulo: "¿Eliminar Cliente?",
      mensaje: `¿Estás seguro de que deseas eliminar permanentemente a ${cliente.nombre} ${cliente.apellido}?`,
      onConfirmar: async () => {
        try {
          await eliminarCliente(cliente.id);
          setMensajeAlerta({
            tipo: "exito",
            texto: "Cliente eliminado correctamente.",
          });
          cargarClientes();
        } catch (error) {
          setMensajeAlerta({
            tipo: "error",
            texto: error.response?.data?.message || error.message || "Error al eliminar el cliente.",
          });
        } finally {
          setDialogoConfirmacion(null);
        }
      },
    });
  };

  // Filtrado de clientes por búsqueda
  const clientesFiltrados = clientes.filter((c) => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return true;
    const nombreCompleto = `${c.nombre || ""} ${c.apellido || ""}`.toLowerCase();
    const email = (c.email || "").toLowerCase();
    const dni = (c.dni || "").toLowerCase();
    const telefono = (c.telefono || "").toLowerCase();
    return (
      nombreCompleto.includes(q) ||
      email.includes(q) ||
      dni.includes(q) ||
      telefono.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* ENCABEZADO Y ACCIONES */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Gestión de Clientes
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Administra altas, modificaciones y consultas de personas interesadas (inquilinos, compradores y propietarios).
          </p>
        </div>

        <button
          type="button"
          onClick={abrirNuevoCliente}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#826229] hover:bg-[#6d511f] text-white text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#826229] focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Cliente
        </button>
      </div>

      {/* MENSAJE DE ALERTA */}
      {mensajeAlerta && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between border ${
            mensajeAlerta.tipo === "exito"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
              : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
          }`}
        >
          <span className="text-sm font-medium">{mensajeAlerta.texto}</span>
          <button
            type="button"
            onClick={() => setMensajeAlerta(null)}
            className="text-xs font-bold underline ml-4"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* MODAL / FORMULARIO FLOTANTE O DESPLEGADO */}
      {mostrarFormulario && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl transition-all">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#826229]/10 text-[#826229] flex items-center justify-center font-bold">
                {clienteEditando ? "✎" : "+"}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {clienteEditando ? "Editar Cliente" : "Registrar Nuevo Cliente"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Completa los datos personales y carga la fotografía del cliente.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={cancelarFormulario}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              ✕
            </button>
          </div>

          <form onSubmit={guardarCliente} className="space-y-6">
            {/* SECCIÓN 1: FOTO DEL CLIENTE */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 border-2 border-[#826229] flex items-center justify-center shrink-0">
                {previewFoto ? (
                  <img
                    src={previewFoto}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-10 h-10 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                )}
              </div>

              <div className="flex-1 w-full text-center sm:text-left">
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Foto de Perfil del Cliente
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Formatos permitidos: JPG, PNG, WEBP (máx. 5MB).
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                    <svg
                      className="w-4 h-4 text-[#826229]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Seleccionar Imagen
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFotoChange}
                      className="hidden"
                    />
                  </label>
                  {previewFoto && (
                    <button
                      type="button"
                      onClick={() => {
                        setArchivoFoto(null);
                        setPreviewFoto("");
                        setFormulario({ ...formulario, foto: "" });
                      }}
                      className="text-xs text-red-600 dark:text-red-400 hover:underline"
                    >
                      Quitar foto
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: CAMPOS PERSONALES EN GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formulario.nombre}
                  placeholder="Ej. Luis"
                  onChange={(e) =>
                    setFormulario({ ...formulario, nombre: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#826229]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formulario.apellido}
                  placeholder="Ej. González"
                  onChange={(e) =>
                    setFormulario({ ...formulario, apellido: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#826229]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formulario.email}
                  placeholder="luis@ejemplo.com"
                  onChange={(e) =>
                    setFormulario({ ...formulario, email: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#826229]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  DNI / Documento
                </label>
                <input
                  type="text"
                  value={formulario.dni}
                  placeholder="Ej. 34567890"
                  onChange={(e) =>
                    setFormulario({ ...formulario, dni: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#826229]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={formulario.telefono}
                  placeholder="Ej. +54 341 555-5555"
                  onChange={(e) =>
                    setFormulario({ ...formulario, telefono: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#826229]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  value={formulario.fechaNacimiento}
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      fechaNacimiento: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#826229]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Género
                </label>
                <select
                  value={formulario.genero}
                  onChange={(e) =>
                    setFormulario({ ...formulario, genero: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#826229]"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formulario.direccion}
                  placeholder="Calle y número"
                  onChange={(e) =>
                    setFormulario({ ...formulario, direccion: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#826229]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ciudad / Localidad
                </label>
                <input
                  type="text"
                  value={formulario.ciudad}
                  placeholder="Ej. Rosario"
                  onChange={(e) =>
                    setFormulario({ ...formulario, ciudad: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#826229]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Provincia
                </label>
                <input
                  type="text"
                  value={formulario.provincia}
                  placeholder="Ej. Santa Fe"
                  onChange={(e) =>
                    setFormulario({ ...formulario, provincia: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#826229]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Observaciones (Aval bancario, contrato, garantías, etc.)
                </label>
                <textarea
                  rows="2"
                  value={formulario.observaciones}
                  placeholder="Detalles adicionales, referencias crediticias o garantes..."
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      observaciones: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#826229]"
                />
              </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={cancelarFormulario}
                className="px-4 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="px-5 py-2 text-sm font-semibold rounded-lg bg-[#826229] hover:bg-[#6d511f] text-white shadow-sm transition disabled:opacity-50"
              >
                {guardando
                  ? "Guardando..."
                  : clienteEditando
                  ? "Actualizar Cliente"
                  : "Guardar Cliente"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* BARRA DE BÚSQUEDA Y TOTAL */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, DNI, teléfono o email..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#826229]"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 self-end sm:self-center">
          Total de clientes registrados:{" "}
          <span className="text-[#826229] font-bold text-sm">
            {clientesFiltrados.length}
          </span>
        </div>
      </div>

      {/* LISTADO DE CLIENTES */}
      {cargando ? (
        <div className="p-12 text-center text-slate-500 dark:text-slate-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#826229] border-t-transparent mb-3" />
          <p className="text-sm">Cargando clientes...</p>
        </div>
      ) : clientesFiltrados.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400">
          <p className="text-base font-semibold">No se encontraron clientes.</p>
          <p className="text-xs mt-1">
            {busqueda
              ? "Prueba modificando los criterios de búsqueda."
              : "Comienza registrando tu primer cliente haciendo clic en '+ Nuevo Cliente'."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {clientesFiltrados.map((cliente) => {
            const fotoUrl = cliente.foto
              ? cliente.foto.startsWith("http")
                ? cliente.foto
                : `http://localhost:4000${cliente.foto}`
              : null;

            return (
              <div
                key={cliente.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#826229]/60 dark:hover:border-[#826229]/60 rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* CABECERA TARJETA */}
                  <div className="flex items-start gap-3.5 mb-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-[#826229]/40 flex items-center justify-center shrink-0">
                      {fotoUrl ? (
                        <img
                          src={fotoUrl}
                          alt={`${cliente.nombre} ${cliente.apellido}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-base font-bold text-[#826229]">
                          {cliente.nombre?.[0]}
                          {cliente.apellido?.[0]}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                        {cliente.nombre} {cliente.apellido}
                      </h3>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#826229]/15 text-[#826229]">
                        Cliente
                      </span>
                    </div>
                  </div>

                  {/* DATOS */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="flex items-center gap-2 truncate">
                      <span className="font-semibold text-slate-500 dark:text-slate-500 w-16">
                        Email:
                      </span>
                      <span className="text-slate-800 dark:text-slate-200 truncate">
                        {cliente.email}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-semibold text-slate-500 dark:text-slate-500 w-16">
                        Teléfono:
                      </span>
                      <span className="text-slate-800 dark:text-slate-200">
                        {cliente.telefono || "No registrado"}
                      </span>
                    </p>
                    {cliente.dni && (
                      <p className="flex items-center gap-2">
                        <span className="font-semibold text-slate-500 dark:text-slate-500 w-16">
                          DNI:
                        </span>
                        <span className="text-slate-800 dark:text-slate-200">
                          {cliente.dni}
                        </span>
                      </p>
                    )}
                    {(cliente.ciudad || cliente.direccion) && (
                      <p className="flex items-center gap-2 truncate">
                        <span className="font-semibold text-slate-500 dark:text-slate-500 w-16">
                          Ubicación:
                        </span>
                        <span className="text-slate-800 dark:text-slate-200 truncate">
                          {[cliente.direccion, cliente.ciudad, cliente.provincia]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </p>
                    )}
                    {cliente.observaciones && (
                      <p className="text-[11px] italic text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                        "{cliente.observaciones}"
                      </p>
                    )}
                  </div>
                </div>

                {/* ACCIONES */}
                <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => abrirEditarCliente(cliente)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#826229]/10 hover:bg-[#826229]/20 text-[#826229] dark:text-[#a5813f] transition cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEliminarCliente(cliente)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-300 transition cursor-pointer"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR CLIENTE */}
      {dialogoConfirmacion && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl text-red-600 dark:text-red-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {dialogoConfirmacion.titulo}
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {dialogoConfirmacion.mensaje}
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDialogoConfirmacion(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={dialogoConfirmacion.onConfirmar}
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-sm"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
