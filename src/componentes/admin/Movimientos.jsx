import { useEffect, useState, useCallback } from "react";
import {
  getCuentasBancarias,
  crearCuentaBancaria,
  getMovimientos,
  registrarMovimiento,
  eliminarMovimiento,
} from "../../services/movimientos.service";
import { getInmuebles } from "../../services/inmuebles.service";

export default function Movimientos() {
  const [cuentas, setCuentas] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [inmuebles, setInmuebles] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState("TODOS");
  const [filtroCuenta, setFiltroCuenta] = useState("TODAS");
  const [busqueda, setBusqueda] = useState("");

  // Modales y formularios
  const [mostrarFormMov, setMostrarFormMov] = useState(false);
  const [mostrarFormCuenta, setMostrarFormCuenta] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  // Formulario de Movimiento
  const [formMov, setFormMov] = useState({
    id_cuenta: "",
    id_inmueble: "",
    tipo: "INGRESO",
    categoria: "Cobro de Alquiler",
    monto: "",
    fecha: new Date().toISOString().split("T")[0],
    descripcion: "",
  });

  // Formulario de Cuenta
  const [formCuenta, setFormCuenta] = useState({
    banco: "",
    numero_cuenta: "",
    cbu_alias: "",
    titular: "Inmobiliaria La Finca S.A.",
    tipo_cuenta: "Cuenta Corriente",
    saldo: "0.00",
  });

  const cargarDatos = useCallback(async () => {
    try {
      const [resCuentas, resMovs, resInms] = await Promise.all([
        getCuentasBancarias(),
        getMovimientos(),
        getInmuebles().catch(() => []),
      ]);
      setCuentas(Array.isArray(resCuentas) ? resCuentas : []);
      setMovimientos(Array.isArray(resMovs) ? resMovs : []);
      setInmuebles(Array.isArray(resInms) ? resInms : []);

      if (resCuentas.length > 0) {
        setFormMov((prev) => (prev.id_cuenta ? prev : { ...prev, id_cuenta: resCuentas[0].id }));
      }
    } catch (err) {
      console.error("Error al cargar datos bancarios:", err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    let activo = true;
    Promise.all([
      getCuentasBancarias(),
      getMovimientos(),
      getInmuebles().catch(() => []),
    ])
      .then(([resCuentas, resMovs, resInms]) => {
        if (activo) {
          setCuentas(Array.isArray(resCuentas) ? resCuentas : []);
          setMovimientos(Array.isArray(resMovs) ? resMovs : []);
          setInmuebles(Array.isArray(resInms) ? resInms : []);
          if (resCuentas.length > 0) {
            setFormMov((prev) => (prev.id_cuenta ? prev : { ...prev, id_cuenta: resCuentas[0].id }));
          }
          setCargando(false);
        }
      })
      .catch((err) => {
        console.error("Error al cargar datos bancarios:", err);
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  // Submit de Movimiento
  const handleSubmitMovimiento = async (e) => {
    e.preventDefault();
    if (!formMov.id_cuenta || !formMov.monto || !formMov.categoria) {
      alert("Por favor completa cuenta, categoría y monto.");
      return;
    }

    setGuardando(true);
    setMensaje(null);

    try {
      await registrarMovimiento(formMov);
      setMensaje({
        tipo: "exito",
        texto: `Movimiento de ${formMov.tipo.toLowerCase()} registrado y saldo bancario actualizado.`,
      });
      setMostrarFormMov(false);
      setFormMov({
        id_cuenta: cuentas[0]?.id || "",
        id_inmueble: "",
        tipo: "INGRESO",
        categoria: "Cobro de Alquiler",
        monto: "",
        fecha: new Date().toISOString().split("T")[0],
        descripcion: "",
      });
      cargarDatos();
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message });
    } finally {
      setGuardando(false);
    }
  };

  // Submit de Nueva Cuenta
  const handleSubmitCuenta = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await crearCuentaBancaria(formCuenta);
      setMensaje({ tipo: "exito", texto: "Nueva cuenta bancaria dada de alta." });
      setMostrarFormCuenta(false);
      setFormCuenta({
        banco: "",
        numero_cuenta: "",
        cbu_alias: "",
        titular: "Inmobiliaria La Finca S.A.",
        tipo_cuenta: "Cuenta Corriente",
        saldo: "0.00",
      });
      cargarDatos();
    } catch (err) {
      alert(err.message);
    } finally {
      setGuardando(false);
    }
  };

  // Eliminar movimiento (revierte saldo)
  const handleEliminarMov = async (id) => {
    if (
      !window.confirm(
        "¿Eliminar este movimiento? Se revertirá automáticamente el saldo de la cuenta bancaria."
      )
    )
      return;

    try {
      await eliminarMovimiento(id);
      cargarDatos();
    } catch (err) {
      alert(err.message);
    }
  };

  // Totales financieros
  const totalIngresos = movimientos
    .filter((m) => m.tipo === "INGRESO")
    .reduce((sum, m) => sum + parseFloat(m.monto || 0), 0);

  const totalGastos = movimientos
    .filter((m) => m.tipo === "GASTO")
    .reduce((sum, m) => sum + parseFloat(m.monto || 0), 0);

  const balanceNeto = totalIngresos - totalGastos;

  // Filtrado de movimientos
  const movimientosFiltrados = movimientos.filter((m) => {
    if (filtroTipo !== "TODOS" && m.tipo !== filtroTipo) return false;
    if (filtroCuenta !== "TODAS" && String(m.id_cuenta) !== String(filtroCuenta))
      return false;
    const q = busqueda.toLowerCase().trim();
    if (!q) return true;
    const cat = (m.categoria || "").toLowerCase();
    const desc = (m.descripcion || "").toLowerCase();
    const inm = (m.inmueble_direccion || "").toLowerCase();
    return cat.includes(q) || desc.includes(q) || inm.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Movimientos Bancarios y Cuentas
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gestión de ingresos, gastos asociados a propiedades y saldos de cuentas bancarias.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMostrarFormCuenta(true)}
            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition"
          >
            + Nueva Cuenta
          </button>
          <button
            type="button"
            onClick={() => setMostrarFormMov(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#826229] hover:bg-[#6d511f] text-white text-xs font-semibold shadow-sm transition"
          >
            + Registrar Movimiento
          </button>
        </div>
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

      {/* TARJETAS DE SALDOS Y CUENTAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cuentas.map((c) => {
          const saldoNum = parseFloat(c.saldo || 0);
          return (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>{c.tipo_cuenta}</span>
                  <span className="font-mono">{c.numero_cuenta}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {c.banco}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Titular: {c.titular} {c.cbu_alias && `• Alias: ${c.cbu_alias}`}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-semibold text-slate-400">
                  Saldo Disponible ({saldoNum >= 0 ? "Acreedor" : "Deudor"})
                </span>
                <p
                  className={`text-2xl font-bold ${
                    saldoNum >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  ${saldoNum.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          );
        })}

        {/* MÉTRICAS GLOBALES */}
        <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Balance General del Ejercicio
          </span>
          <div className="space-y-1 my-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Ingresos Totales:</span>
              <span className="font-semibold text-emerald-600">
                +${totalIngresos.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Gastos Totales:</span>
              <span className="font-semibold text-red-500">
                -${totalGastos.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Neto:
            </span>
            <span
              className={`text-xl font-bold ${
                balanceNeto >= 0 ? "text-[#826229]" : "text-red-600"
              }`}
            >
              ${balanceNeto.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* MODAL REGISTRAR MOVIMIENTO (CU-05 / CU-06 / CU-07) */}
      {mostrarFormMov && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl max-w-2xl w-full space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Registrar Movimiento Bancario
                </h2>
                <p className="text-xs text-slate-500">
                  Registra un ingreso o gasto y vincúlalo a un inmueble para actualizar el saldo bancario.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMostrarFormMov(false)}
                className="text-slate-400 hover:text-slate-200 text-lg cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

          <form onSubmit={handleSubmitMovimiento} className="space-y-4">
            {/* TIPO: INGRESO O GASTO */}
            <div className="flex gap-4">
              <label
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer font-bold text-xs transition ${
                  formMov.tipo === "INGRESO"
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                    : "border-slate-200 dark:border-slate-800 text-slate-500"
                }`}
              >
                <input
                  type="radio"
                  name="tipo"
                  value="INGRESO"
                  checked={formMov.tipo === "INGRESO"}
                  onChange={() =>
                    setFormMov({
                      ...formMov,
                      tipo: "INGRESO",
                      categoria: "Cobro de Alquiler",
                    })
                  }
                  className="hidden"
                />
                ⬆ Ingreso Bancario
              </label>

              <label
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer font-bold text-xs transition ${
                  formMov.tipo === "GASTO"
                    ? "border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300"
                    : "border-slate-200 dark:border-slate-800 text-slate-500"
                }`}
              >
                <input
                  type="radio"
                  name="tipo"
                  value="GASTO"
                  checked={formMov.tipo === "GASTO"}
                  onChange={() =>
                    setFormMov({
                      ...formMov,
                      tipo: "GASTO",
                      categoria: "Reparación de ascensor",
                    })
                  }
                  className="hidden"
                />
                ⬇ Gasto / Egreso
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cuenta Bancaria <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formMov.id_cuenta}
                  onChange={(e) => setFormMov({ ...formMov, id_cuenta: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  {cuentas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.banco} ({c.numero_cuenta})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Inmueble Asociado (CU-07)
                </label>
                <select
                  value={formMov.id_inmueble}
                  onChange={(e) => setFormMov({ ...formMov, id_inmueble: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  <option value="">Sin asociar (Gasto general)</option>
                  {inmuebles.map((inm) => (
                    <option key={inm.id} value={inm.id}>
                      {inm.tipo_inmueble} - {inm.direccion}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Categoría del Movimiento <span className="text-red-500">*</span>
                </label>
                <select
                  value={formMov.categoria}
                  onChange={(e) => setFormMov({ ...formMov, categoria: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  {formMov.tipo === "INGRESO" ? (
                    <>
                      <option value="Cobro de Alquiler">Cobro de Alquiler</option>
                      <option value="Comisión Inmobiliaria">Comisión Inmobiliaria</option>
                      <option value="Depósito en Garantía">Depósito en Garantía</option>
                      <option value="Otros Ingresos">Otros Ingresos</option>
                    </>
                  ) : (
                    <>
                      <option value="Reparación de ascensor">Reparación de ascensor</option>
                      <option value="Sueldo señora de limpieza">Sueldo de limpieza</option>
                      <option value="Mantenimiento y plomería">Mantenimiento y plomería</option>
                      <option value="Expensas e impuestos">Expensas e impuestos</option>
                      <option value="Honorarios profesionales">Honorarios profesionales</option>
                      <option value="Otros Gastos">Otros Gastos</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Monto ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={formMov.monto}
                  onChange={(e) => setFormMov({ ...formMov, monto: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Fecha del Movimiento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formMov.fecha}
                  onChange={(e) => setFormMov({ ...formMov, fecha: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción / Detalle
                </label>
                <input
                  type="text"
                  placeholder="Ej. Factura N° 0045, Service mensual..."
                  value={formMov.descripcion}
                  onChange={(e) => setFormMov({ ...formMov, descripcion: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setMostrarFormMov(false)}
                className="px-4 py-2 text-xs rounded-lg text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-[#826229] hover:bg-[#6d511f] text-white shadow-sm disabled:opacity-50"
              >
                {guardando ? "Registrando..." : "Guardar Movimiento"}
              </button>
            </div>
          </form>
        </div>
      </div>
      )}

      {/* MODAL CREAR CUENTA BANCARIA */}
      {mostrarFormCuenta && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Dar de Alta Cuenta Bancaria
            </h3>

            <form onSubmit={handleSubmitCuenta} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Nombre del Banco</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Banco Galicia"
                  value={formCuenta.banco}
                  onChange={(e) => setFormCuenta({ ...formCuenta, banco: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Número de Cuenta</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. CC-12345-02"
                  value={formCuenta.numero_cuenta}
                  onChange={(e) =>
                    setFormCuenta({ ...formCuenta, numero_cuenta: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">CBU / Alias</label>
                <input
                  type="text"
                  placeholder="LAFINCA.GALICIA"
                  value={formCuenta.cbu_alias}
                  onChange={(e) =>
                    setFormCuenta({ ...formCuenta, cbu_alias: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Saldo Inicial ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formCuenta.saldo}
                  onChange={(e) => setFormCuenta({ ...formCuenta, saldo: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setMostrarFormCuenta(false)}
                  className="px-3 py-1.5 text-xs text-slate-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#826229] text-white"
                >
                  Guardar Cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FILTROS DE HISTORIAL */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por categoría, inmueble o detalle..."
          className="w-full sm:w-80 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
        />

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filtroCuenta}
            onChange={(e) => setFiltroCuenta(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
          >
            <option value="TODAS">Todas las Cuentas</option>
            {cuentas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.banco} ({c.numero_cuenta})
              </option>
            ))}
          </select>

          {["TODOS", "INGRESO", "GASTO"].map((tipo) => (
            <button
              key={tipo}
              type="button"
              onClick={() => setFiltroTipo(tipo)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filtroTipo === tipo
                  ? "bg-[#826229] text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              {tipo}
            </button>
          ))}
        </div>
      </div>

      {/* TABLA DE MOVIMIENTOS */}
      {cargando ? (
        <div className="p-12 text-center text-slate-500">Cargando movimientos...</div>
      ) : movimientosFiltrados.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500">
          No hay movimientos bancarios registrados con estos filtros.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Fecha</th>
                <th className="p-3.5">Tipo</th>
                <th className="p-3.5">Categoría / Detalle</th>
                <th className="p-3.5">Inmueble Imputado</th>
                <th className="p-3.5">Cuenta Bancaria</th>
                <th className="p-3.5 text-right">Importe</th>
                <th className="p-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {movimientosFiltrados.map((m) => (
                <tr
                  key={m.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition"
                >
                  <td className="p-3.5 whitespace-nowrap">
                    {new Date(m.fecha).toLocaleDateString()}
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.tipo === "INGRESO"
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                          : "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300"
                      }`}
                    >
                      {m.tipo}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {m.categoria}
                    </p>
                    {m.descripcion && (
                      <p className="text-[11px] text-slate-400">{m.descripcion}</p>
                    )}
                  </td>
                  <td className="p-3.5">
                    {m.inmueble_direccion ? (
                      <span className="text-slate-800 dark:text-slate-200 font-medium">
                        {m.tipo_inmueble} - {m.inmueble_direccion}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Gasto administrativo</span>
                    )}
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {m.banco}
                    </span>
                    <p className="text-[10px] text-slate-400">{m.numero_cuenta}</p>
                  </td>
                  <td
                    className={`p-3.5 text-right font-bold whitespace-nowrap text-sm ${
                      m.tipo === "INGRESO"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {m.tipo === "INGRESO" ? "+" : "-"}$
                    {parseFloat(m.monto).toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      type="button"
                      title="Eliminar movimiento y revertir saldo"
                      onClick={() => handleEliminarMov(m.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}