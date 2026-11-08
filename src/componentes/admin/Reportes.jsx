import { useEffect, useState } from "react";
import { getRecibos } from "../../services/recibos.service";
import { getMovimientos } from "../../services/movimientos.service";
import { getInmuebles } from "../../services/inmuebles.service";
import { getClientes } from "../../services/clientes.service";

export default function Reportes() {
  const [pestañaActiva, setPestañaActiva] = useState("inquilinos"); // 'inquilinos' | 'recibos' | 'economico' | 'inmuebles'
  const [recibos, setRecibos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [inmuebles, setInmuebles] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Filtros
  const [filtroPagoInquilino, setFiltroPagoInquilino] = useState("TODOS"); // 'TODOS' | 'AL_DIA' | 'PENDIENTES'
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  useEffect(() => {
    let activo = true;
    Promise.all([
      getRecibos(),
      getMovimientos(),
      getInmuebles().catch(() => []),
      getClientes().catch(() => []),
    ])
      .then(([resRec, resMov, resInm, resCli]) => {
        if (activo) {
          setRecibos(Array.isArray(resRec) ? resRec : []);
          setMovimientos(Array.isArray(resMov) ? resMov : []);
          setInmuebles(Array.isArray(resInm) ? resInm : []);
          setClientes(Array.isArray(resCli) ? resCli : []);
          setCargando(false);
        }
      })
      .catch((err) => {
        console.error("Error al cargar datos de reportes:", err);
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  // 1. REPORTE DE INQUILINOS Y ESTADO DE PAGO (CU-09)
  const inquilinosConEstado = clientes.map((cliente) => {
    const recibosCliente = recibos.filter((r) => r.id_cliente === cliente.id);
    const recibosPendientes = recibosCliente.filter((r) => r.estado === "PENDIENTE");
    const recibosCobrados = recibosCliente.filter((r) => r.estado === "COBRADO");
    const totalAdeudado = recibosPendientes.reduce(
      (sum, r) => sum + parseFloat(r.total || 0),
      0
    );

    return {
      ...cliente,
      totalRecibos: recibosCliente.length,
      recibosPendientesCount: recibosPendientes.length,
      recibosCobradosCount: recibosCobrados.length,
      totalAdeudado,
      alDia: recibosPendientes.length === 0,
    };
  });

  const inquilinosFiltrados = inquilinosConEstado.filter((inq) => {
    if (filtroPagoInquilino === "AL_DIA") return inq.alDia;
    if (filtroPagoInquilino === "PENDIENTES") return !inq.alDia;
    return true;
  });

  // 2. REPORTE DE RECIBOS PENDIENTES (CU-10)
  const recibosPendientes = recibos.filter((r) => {
    if (r.estado !== "PENDIENTE") return false;
    if (fechaDesde && r.fecha_emision < fechaDesde) return false;
    if (fechaHasta && r.fecha_emision > fechaHasta) return false;
    return true;
  });

  const totalPendienteCobro = recibosPendientes.reduce(
    (sum, r) => sum + parseFloat(r.total || 0),
    0
  );

  // 3. INFORME ECONÓMICO / DECLARACIÓN DE RENTA
  const ingresosEconomicos = movimientos
    .filter((m) => m.tipo === "INGRESO")
    .reduce((sum, m) => sum + parseFloat(m.monto || 0), 0);

  const gastosEconomicos = movimientos
    .filter((m) => m.tipo === "GASTO")
    .reduce((sum, m) => sum + parseFloat(m.monto || 0), 0);

  const resultadoRenta = ingresosEconomicos - gastosEconomicos;

  return (
    <div className="space-y-6">
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Módulo de Reportes e Informes
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Listados requeridos por secretaría para auditoría, control de inquilinos y declaración de renta.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-sm"
        >
          🖨️ Imprimir Listado
        </button>
      </div>

      {/* PESTAÑAS DE NAVEGACIÓN */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setPestañaActiva("inquilinos")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            pestañaActiva === "inquilinos"
              ? "bg-[#826229] text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          👥 Inquilinos y Estado de Pago (CU-09)
        </button>

        <button
          type="button"
          onClick={() => setPestañaActiva("recibos")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            pestañaActiva === "recibos"
              ? "bg-[#826229] text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          📄 Recibos Pendientes de Cobro (CU-10)
        </button>

        <button
          type="button"
          onClick={() => setPestañaActiva("economico")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            pestañaActiva === "economico"
              ? "bg-[#826229] text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          💰 Informe para Declaración de Renta
        </button>

        <button
          type="button"
          onClick={() => setPestañaActiva("inmuebles")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            pestañaActiva === "inmuebles"
              ? "bg-[#826229] text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          🏠 Listado de Inmuebles (CU-08)
        </button>
      </div>

      {cargando ? (
        <div className="p-12 text-center text-slate-500">Cargando reportes del sistema...</div>
      ) : (
        <>
          {/* PESTAÑA 1: INQUILINOS Y ESTADO DE PAGO (CU-09) */}
          {pestañaActiva === "inquilinos" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Filtrar inquilinos según estado de cobranzas:
                </span>
                <div className="flex gap-2">
                  {[
                    { id: "TODOS", label: "Todos los inquilinos" },
                    { id: "AL_DIA", label: "Al día (Sin deuda)" },
                    { id: "PENDIENTES", label: "Con recibos pendientes" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFiltroPagoInquilino(f.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                        filtroPagoInquilino === f.id
                          ? "bg-[#826229] text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Inquilino</th>
                      <th className="p-3.5">DNI</th>
                      <th className="p-3.5">Contacto</th>
                      <th className="p-3.5 text-center">Recibos Emitidos</th>
                      <th className="p-3.5 text-center">Cobrados</th>
                      <th className="p-3.5 text-center">Pendientes</th>
                      <th className="p-3.5 text-right">Saldo Adeudado</th>
                      <th className="p-3.5 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {inquilinosFiltrados.map((inq) => (
                      <tr key={inq.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                          {inq.nombre} {inq.apellido}
                        </td>
                        <td className="p-3.5">{inq.dni || "S/D"}</td>
                        <td className="p-3.5">
                          <p>{inq.telefono || "-"}</p>
                          <p className="text-[11px] text-slate-400">{inq.email}</p>
                        </td>
                        <td className="p-3.5 text-center font-mono">{inq.totalRecibos}</td>
                        <td className="p-3.5 text-center font-semibold text-emerald-600">
                          {inq.recibosCobradosCount}
                        </td>
                        <td className="p-3.5 text-center font-semibold text-amber-600">
                          {inq.recibosPendientesCount}
                        </td>
                        <td className="p-3.5 text-right font-bold text-slate-900 dark:text-slate-100">
                          ${inq.totalAdeudado.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              inq.alDia
                                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                                : "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300"
                            }`}
                          >
                            {inq.alDia ? "AL DÍA" : "CON MORA"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PESTAÑA 2: RECIBOS PENDIENTES (CU-10) */}
          {pestañaActiva === "recibos" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold">Rango de fechas:</span>
                  <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    className="px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                  <span className="text-xs text-slate-400">hasta</span>
                  <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    className="px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>

                <div className="text-xs">
                  Total Pendiente de Cobro:{" "}
                  <strong className="text-lg font-bold text-amber-600 dark:text-amber-400 ml-1">
                    ${totalPendienteCobro.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">N° Recibo</th>
                      <th className="p-3.5">Período</th>
                      <th className="p-3.5">Inmueble</th>
                      <th className="p-3.5">Inquilino</th>
                      <th className="p-3.5">Emisión</th>
                      <th className="p-3.5 text-right">Total a Cobrar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recibosPendientes.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3.5 font-mono font-bold text-[#826229]">{r.numero_recibo}</td>
                        <td className="p-3.5 font-semibold text-slate-900 dark:text-slate-100">{r.periodo}</td>
                        <td className="p-3.5">{r.inmueble_direccion}</td>
                        <td className="p-3.5">
                          {r.inquilino_nombre
                            ? `${r.inquilino_nombre} ${r.inquilino_apellido}`
                            : "Sin asignar"}
                        </td>
                        <td className="p-3.5">{new Date(r.fecha_emision).toLocaleDateString()}</td>
                        <td className="p-3.5 text-right font-bold text-amber-600 dark:text-amber-400 text-sm">
                          ${parseFloat(r.total || 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PESTAÑA 3: INFORME ECONÓMICO Y RENTA */}
          {pestañaActiva === "economico" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs font-bold uppercase text-slate-400">Total Ingresos Computables</span>
                  <p className="text-3xl font-extrabold text-emerald-600 mt-2">
                    ${ingresosEconomicos.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Cobro de alquileres y honorarios</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs font-bold uppercase text-slate-400">Total Gastos Deducibles</span>
                  <p className="text-3xl font-extrabold text-red-500 mt-2">
                    ${gastosEconomicos.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Reparaciones, sueldos y mantenimiento</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs font-bold uppercase text-slate-400">Rendimiento Neto Gravado</span>
                  <p className={`text-3xl font-extrabold mt-2 ${resultadoRenta >= 0 ? "text-[#826229]" : "text-red-600"}`}>
                    ${resultadoRenta.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Base para cálculo de renta impositiva</p>
                </div>
              </div>

              {/* LISTADO DE GASTOS ASOCIADOS A INMUEBLES */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Desglose de Gastos Deducibles por Inmueble (CU-07)
                </h3>
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-950/60 border-b text-[10px] uppercase text-slate-500">
                    <tr>
                      <th className="p-3">Inmueble</th>
                      <th className="p-3">Concepto / Categoría</th>
                      <th className="p-3">Fecha</th>
                      <th className="p-3 text-right">Importe Gasto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {movimientos
                      .filter((m) => m.tipo === "GASTO")
                      .map((g) => (
                        <tr key={g.id}>
                          <td className="p-3 font-medium">
                            {g.inmueble_direccion ? `${g.tipo_inmueble} - ${g.inmueble_direccion}` : "Gastos de Administración"}
                          </td>
                          <td className="p-3">{g.categoria}</td>
                          <td className="p-3">{new Date(g.fecha).toLocaleDateString()}</td>
                          <td className="p-3 text-right font-bold text-red-500">
                            -${parseFloat(g.monto).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PESTAÑA 4: LISTADO GENERAL DE INMUEBLES (CU-08) */}
          {pestañaActiva === "inmuebles" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">ID</th>
                    <th className="p-3.5">Tipo</th>
                    <th className="p-3.5">Dirección</th>
                    <th className="p-3.5">Localidad</th>
                    <th className="p-3.5">Provincia</th>
                    <th className="p-3.5 text-right">Precio Base</th>
                    <th className="p-3.5 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {inmuebles.map((inm) => (
                    <tr key={inm.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 font-mono text-slate-400">#{inm.id}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{inm.tipo_inmueble}</td>
                      <td className="p-3.5">{inm.direccion}</td>
                      <td className="p-3.5">{inm.localidad}</td>
                      <td className="p-3.5">{inm.provincia}</td>
                      <td className="p-3.5 text-right font-bold text-[#826229]">
                        ${parseFloat(inm.precio || 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800">
                          {inm.estado || "DISPONIBLE"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}