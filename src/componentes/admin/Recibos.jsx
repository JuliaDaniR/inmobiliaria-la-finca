import { useEffect, useState, useCallback } from "react";
import {
  getRecibos,
  crearRecibo,
  copiarRecibo,
  editarRecibo,
  cambiarEstadoRecibo,
  eliminarRecibo,
} from "../../services/recibos.service";
import { getInmuebles } from "../../services/inmuebles.service";
import { getClientes } from "../../services/clientes.service";

export default function Recibos() {
  const [recibos, setRecibos] = useState([]);
  const [inmuebles, setInmuebles] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState(null);

  // Estados de formularios y modales
  const [mostrarForm, setMostrarForm] = useState(false);
  const [reciboEditando, setReciboEditando] = useState(null);
  const [reciboImprimir, setReciboImprimir] = useState(null);
  const [modalClonar, setModalClonar] = useState(null);
  const [periodoClonar, setPeriodoClonar] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Conceptos iniciales estándar
  const conceptosBase = [
    { concepto: "Alquiler Mensual", monto: "", es_obligatorio: true },
    { concepto: "Expensas Comunes", monto: "", es_obligatorio: true },
    { concepto: "Agua Corriente", monto: "", es_obligatorio: false },
    { concepto: "Energía Eléctrica (Luz)", monto: "", es_obligatorio: false },
    { concepto: "Gas Natural", monto: "", es_obligatorio: false },
    { concepto: "Impuestos Inmobiliarios", monto: "", es_obligatorio: false },
    { concepto: "IVA (si corresponde)", monto: "", es_obligatorio: false },
  ];

  const [form, setForm] = useState({
    numero_recibo: "",
    id_inmueble: "",
    id_cliente: "",
    fecha_emision: new Date().toISOString().split("T")[0],
    periodo: "",
    observaciones: "",
    conceptos: conceptosBase,
  });

  const cargarDatos = useCallback(async () => {
    try {
      const [resRecibos, resInmuebles, resClientes] = await Promise.all([
        getRecibos(),
        getInmuebles().catch(() => []),
        getClientes().catch(() => []),
      ]);
      setRecibos(Array.isArray(resRecibos) ? resRecibos : []);
      setInmuebles(Array.isArray(resInmuebles) ? resInmuebles : []);
      setClientes(Array.isArray(resClientes) ? resClientes : []);
    } catch (err) {
      console.error("Error al cargar datos:", err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    let activo = true;
    Promise.all([
      getRecibos(),
      getInmuebles().catch(() => []),
      getClientes().catch(() => []),
    ])
      .then(([resRecibos, resInmuebles, resClientes]) => {
        if (activo) {
          setRecibos(Array.isArray(resRecibos) ? resRecibos : []);
          setInmuebles(Array.isArray(resInmuebles) ? resInmuebles : []);
          setClientes(Array.isArray(resClientes) ? resClientes : []);
          setCargando(false);
        }
      })
      .catch((err) => {
        console.error("Error al cargar datos:", err);
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  // Manejador de conceptos dinámicos
  const handleConceptoChange = (index, field, value) => {
    const nuevos = [...form.conceptos];
    nuevos[index][field] = value;
    setForm({ ...form, conceptos: nuevos });
  };

  const agregarConcepto = () => {
    setForm({
      ...form,
      conceptos: [
        ...form.conceptos,
        { concepto: "", monto: "", es_obligatorio: false },
      ],
    });
  };

  const quitarConcepto = (index) => {
    setForm({
      ...form,
      conceptos: form.conceptos.filter((_, i) => i !== index),
    });
  };

  // Total calculado
  const totalCalculado = form.conceptos.reduce(
    (sum, c) => sum + (parseFloat(c.monto) || 0),
    0
  );

  const abrirNuevoRecibo = () => {
    setReciboEditando(null);
    setForm({
      numero_recibo: `REC-${Date.now().toString().slice(-6)}`,
      id_inmueble: "",
      id_cliente: "",
      fecha_emision: new Date().toISOString().split("T")[0],
      periodo: "",
      observaciones: "",
      conceptos: conceptosBase,
    });
    setMostrarForm(true);
  };

  const abrirEditarRecibo = (r) => {
    setReciboEditando(r);
    const conceptosCargados =
      r.conceptos && r.conceptos.length > 0
        ? r.conceptos.map((c) => ({
            concepto: c.concepto,
            monto: c.monto,
            es_obligatorio: Boolean(c.es_obligatorio),
          }))
        : conceptosBase;

    setForm({
      numero_recibo: r.numero_recibo,
      id_inmueble: r.id_inmueble,
      id_cliente: r.id_cliente || "",
      fecha_emision: r.fecha_emision ? r.fecha_emision.split("T")[0] : "",
      periodo: r.periodo,
      observaciones: r.observaciones || "",
      conceptos: conceptosCargados,
    });
    setMostrarForm(true);
  };

  const guardarReciboSubmit = async (e) => {
    e.preventDefault();
    if (!form.id_inmueble || !form.periodo) {
      alert("Por favor completa el inmueble y período.");
      return;
    }

    setGuardando(true);
    setMensaje(null);

    try {
      const payload = {
        ...form,
        conceptos: form.conceptos.filter((c) => c.concepto.trim() !== ""),
      };

      if (reciboEditando) {
        await editarRecibo(reciboEditando.id, payload);
        setMensaje({ tipo: "exito", texto: "Recibo actualizado correctamente." });
      } else {
        await crearRecibo(payload);
        setMensaje({ tipo: "exito", texto: "Recibo mensual generado con éxito." });
      }

      setMostrarForm(false);
      cargarDatos();
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message });
    } finally {
      setGuardando(false);
    }
  };

  // CU-02: Copiar recibo del mes anterior
  const handleConfirmarClonar = async () => {
    if (!periodoClonar.trim()) {
      alert("Ingresa el nuevo período.");
      return;
    }

    try {
      await copiarRecibo(modalClonar.id, { nuevo_periodo: periodoClonar.trim() });
      setMensaje({
        tipo: "exito",
        texto: `Recibo clonado exitosamente para el período "${periodoClonar}".`,
      });
      setModalClonar(null);
      setPeriodoClonar("");
      cargarDatos();
    } catch (err) {
      alert(err.message);
    }
  };

  // CU-04: Cambiar estado de pago
  const handleToggleEstado = async (recibo) => {
    const nuevoEstado = recibo.estado === "COBRADO" ? "PENDIENTE" : "COBRADO";
    try {
      await cambiarEstadoRecibo(recibo.id, nuevoEstado);
      cargarDatos();
    } catch (err) {
      alert(err.message);
    }
  };

  // Eliminar
  const handleEliminar = async (id, num) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el recibo ${num}?`)) return;
    try {
      await eliminarRecibo(id);
      cargarDatos();
    } catch (err) {
      alert(err.message);
    }
  };

  // Filtros
  const recibosFiltrados = recibos.filter((r) => {
    if (filtroEstado !== "TODOS" && r.estado !== filtroEstado) return false;
    const q = busqueda.toLowerCase().trim();
    if (!q) return true;
    const num = (r.numero_recibo || "").toLowerCase();
    const inquilino = `${r.inquilino_nombre || ""} ${r.inquilino_apellido || ""}`.toLowerCase();
    const dir = (r.inmueble_direccion || "").toLowerCase();
    const per = (r.periodo || "").toLowerCase();
    return num.includes(q) || inquilino.includes(q) || dir.includes(q) || per.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Módulo de Facturación y Recibos
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generación mensual, copia de conceptos previos, cobranzas e impresión de comprobantes.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirNuevoRecibo}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#826229] hover:bg-[#6d511f] text-white text-sm font-semibold shadow-sm transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Generar Recibo
        </button>
      </div>

      {/* MENSAJES */}
      {mensaje && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between border ${
            mensaje.tipo === "exito"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
              : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
          }`}
        >
          <span className="text-sm font-medium">{mensaje.texto}</span>
          <button
            type="button"
            onClick={() => setMensaje(null)}
            className="text-xs font-bold underline ml-4"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* FORMULARIO DE GENERACIÓN / EDICIÓN */}
      {mostrarForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {reciboEditando ? "Editar Recibo" : "Generar Recibo Mensual"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Detalla los conceptos correspondientes al mes para el inmueble alquilado.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMostrarForm(false)}
              className="text-slate-400 hover:text-slate-200"
            >
              ✕
            </button>
          </div>

          <form onSubmit={guardarReciboSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  N° de Recibo (Único) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.numero_recibo}
                  onChange={(e) => setForm({ ...form, numero_recibo: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Inmueble Alquilado <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.id_inmueble}
                  onChange={(e) => setForm({ ...form, id_inmueble: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  <option value="">Seleccionar propiedad...</option>
                  {inmuebles.map((inm) => (
                    <option key={inm.id} value={inm.id}>
                      {inm.tipo_inmueble} - {inm.direccion} ({inm.localidad})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Inquilino / Cliente
                </label>
                <select
                  value={form.id_cliente}
                  onChange={(e) => setForm({ ...form, id_cliente: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  <option value="">Seleccionar cliente...</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} {c.apellido} (DNI: {c.dni || "S/D"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Período / Mes <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Noviembre 2026"
                  value={form.periodo}
                  onChange={(e) => setForm({ ...form, periodo: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* TABLA DE CONCEPTOS */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Conceptos y Desglose de Importes
                </h3>
                <button
                  type="button"
                  onClick={agregarConcepto}
                  className="text-xs font-semibold text-[#826229] hover:underline"
                >
                  + Agregar otro concepto
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {form.conceptos.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800"
                  >
                    <input
                      type="text"
                      placeholder="Concepto (ej. Luz, Alquiler...)"
                      value={item.concepto}
                      onChange={(e) =>
                        handleConceptoChange(idx, "concepto", e.target.value)
                      }
                      className="flex-1 px-3 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    />

                    <div className="relative w-36">
                      <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs text-slate-400">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={item.monto}
                        onChange={(e) =>
                          handleConceptoChange(idx, "monto", e.target.value)
                        }
                        className="w-full pl-6 pr-2 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-right font-semibold"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => quitarConcepto(idx)}
                      className="text-red-500 hover:text-red-700 px-2 py-1 text-xs"
                      title="Eliminar concepto"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* TOTAL */}
              <div className="flex justify-end items-center gap-4 pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Total del Recibo:
                </span>
                <span className="text-2xl font-bold text-[#826229]">
                  ${totalCalculado.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* BOTONES */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setMostrarForm(false)}
                className="px-4 py-2 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="px-5 py-2 text-sm font-semibold rounded-lg bg-[#826229] hover:bg-[#6d511f] text-white shadow-sm disabled:opacity-50"
              >
                {guardando ? "Guardando..." : reciboEditando ? "Actualizar Recibo" : "Emitir Recibo"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FILTROS Y BÚSQUEDA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por N°, inquilino, dirección o mes..."
            className="w-full sm:w-80 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2">
          {["TODOS", "PENDIENTE", "COBRADO"].map((est) => (
            <button
              key={est}
              type="button"
              onClick={() => setFiltroEstado(est)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filtroEstado === est
                  ? "bg-[#826229] text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              {est}
            </button>
          ))}
        </div>
      </div>

      {/* LISTADO DE RECIBOS */}
      {cargando ? (
        <div className="p-12 text-center text-slate-500">Cargando recibos...</div>
      ) : recibosFiltrados.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500">
          No hay recibos registrados con los filtros actuales.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recibosFiltrados.map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:border-[#826229]/60 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#826229]">
                      {r.numero_recibo}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {r.periodo}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleEstado(r)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition ${
                      r.estado === "COBRADO"
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:opacity-80"
                        : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:opacity-80"
                    }`}
                  >
                    ● {r.estado}
                  </button>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mb-4">
                  <p>
                    <strong className="text-slate-700 dark:text-slate-300">Inmueble:</strong>{" "}
                    {r.inmueble_direccion || "Inmueble no asignado"}
                  </p>
                  <p>
                    <strong className="text-slate-700 dark:text-slate-300">Inquilino:</strong>{" "}
                    {r.inquilino_nombre
                      ? `${r.inquilino_nombre} ${r.inquilino_apellido}`
                      : "Sin inquilino asignado"}
                  </p>
                  <p>
                    <strong className="text-slate-700 dark:text-slate-300">Emisión:</strong>{" "}
                    {r.fecha_emision ? new Date(r.fecha_emision).toLocaleDateString() : "-"}
                  </p>
                  {r.fecha_cobro && (
                    <p className="text-emerald-600 dark:text-emerald-400">
                      Cobrado el: {new Date(r.fecha_cobro).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Conceptos resumen */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-500 font-medium">Conceptos incluidos:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {r.conceptos?.filter((c) => parseFloat(c.monto) > 0).map((c, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      >
                        {c.concepto}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Total y Acciones */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Total
                  </span>
                  <p className="text-lg font-bold text-[#826229]">
                    ${parseFloat(r.total || 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* CU-02: Copiar recibo */}
                  <button
                    type="button"
                    title="Copiar conceptos al mes siguiente"
                    onClick={() => {
                      setModalClonar(r);
                      setPeriodoClonar("");
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-[#826229] hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    📋
                  </button>

                  {/* RNF-09: Imprimir */}
                  <button
                    type="button"
                    title="Imprimir recibo"
                    onClick={() => setReciboImprimir(r)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    🖨️
                  </button>

                  {/* Editar */}
                  <button
                    type="button"
                    title="Modificar recibo"
                    onClick={() => abrirEditarRecibo(r)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-[#826229] hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    ✎
                  </button>

                  {/* Eliminar */}
                  <button
                    type="button"
                    title="Eliminar recibo"
                    onClick={() => handleEliminar(r.id, r.numero_recibo)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CLONAR RECIBO (CU-02) */}
      {modalClonar && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Copiar Recibo del Mes Anterior
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Se creará un recibo idéntico con los mismos conceptos y valores del recibo{" "}
              <strong>{modalClonar.numero_recibo}</strong> para el nuevo período indicado.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nuevo Período / Mes
              </label>
              <input
                type="text"
                autoFocus
                placeholder="Ej. Diciembre 2026"
                value={periodoClonar}
                onChange={(e) => setPeriodoClonar(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalClonar(null)}
                className="px-3 py-1.5 text-xs rounded-lg text-slate-600 dark:text-slate-400"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarClonar}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#826229] hover:bg-[#6d511f] text-white"
              >
                Clonar Recibo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IMPRESIÓN RNF-09 (Oculta conceptos en cero) */}
      {reciboImprimir && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl p-8 max-w-xl w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[#826229]">
                  INMOBILIARIA LA FINCA
                </h2>
                <p className="text-xs text-slate-500">Comprobante de Recibo de Alquiler</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold">{reciboImprimir.numero_recibo}</span>
                <p className="text-xs text-slate-500">Período: {reciboImprimir.periodo}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-semibold text-slate-500">Inmueble:</span>
                <p className="font-bold">{reciboImprimir.inmueble_direccion}</p>
                <p className="text-slate-600">{reciboImprimir.inmueble_localidad}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Inquilino:</span>
                <p className="font-bold">
                  {reciboImprimir.inquilino_nombre
                    ? `${reciboImprimir.inquilino_nombre} ${reciboImprimir.inquilino_apellido}`
                    : "No registrado"}
                </p>
                <p className="text-slate-600">DNI: {reciboImprimir.inquilino_dni || "S/D"}</p>
              </div>
            </div>

            {/* TABLA DE CONCEPTOS (RNF-09: Solo importes mayores a cero) */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 border-b">
                  <tr>
                    <th className="text-left p-2.5 font-semibold text-slate-600">Concepto</th>
                    <th className="text-right p-2.5 font-semibold text-slate-600">Importe</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {reciboImprimir.conceptos
                    ?.filter((c) => parseFloat(c.monto) > 0)
                    .map((c, i) => (
                      <tr key={i}>
                        <td className="p-2.5">{c.concepto}</td>
                        <td className="p-2.5 text-right font-medium">
                          ${parseFloat(c.monto).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t font-bold">
                  <tr>
                    <td className="p-2.5 text-sm">TOTAL ABONADO</td>
                    <td className="p-2.5 text-right text-base text-[#826229]">
                      ${parseFloat(reciboImprimir.total || 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t">
              <span>Estado: <strong>{reciboImprimir.estado}</strong></span>
              <span>Emisión: {new Date(reciboImprimir.fecha_emision).toLocaleDateString()}</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReciboImprimir(null)}
                className="px-4 py-2 text-xs rounded-lg border border-slate-300 text-slate-700"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#826229] text-white"
              >
                🖨️ Mandar a Imprimir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}