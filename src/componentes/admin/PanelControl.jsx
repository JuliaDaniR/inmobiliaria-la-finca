import { useEffect, useState } from "react";
import { getInmuebles } from "../../services/inmuebles.service";

export default function PanelControl() {
  const [inmuebles, setInmuebles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarInmuebles = async () => {
      try {
        const data = await getInmuebles();
        setInmuebles(data);
      } catch (error) {
        console.error("Error al obtener los inmuebles para el panel admin:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarInmuebles();
  }, []);

  // Primer inmueble para la tarjeta destacada
  const inmuebleDestacado = inmuebles[0];

  return (
    <div className="space-y-8">
      {/* 1. CABECERA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-brand-text">Panel de Control</h1>
          <p className="text-sm text-slate-500 dark:text-brand-muted mt-1">
            Bienvenido de nuevo, aquí está el resumen de hoy en La Finca.
          </p>
        </div>
        <button className="bg-[#826229] hover:bg-[#6c5120] text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Generar Reporte Mensual
        </button>
      </div>

      {/* 2. TARJETAS DE MÉTRICAS (Originales intactas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tarjeta 1 - Total Inmuebles */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden transition-colors duration-300">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-[#024384]/10 rounded-lg text-[#024384] dark:text-blue-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 rounded-md">ACTUALIZADO</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-brand-muted uppercase tracking-wider">Total Inmuebles</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-brand-text mt-1">{loading ? "..." : inmuebles.length}</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
            <div className="h-full bg-[#826229] rounded-r-full" style={{ width: "100%" }}></div>
          </div>
        </div>

        {/* Tarjeta 2 - Alquileres Activos */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden transition-colors duration-300">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg text-emerald-600 dark:text-emerald-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-md">85% CAPACIDAD</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-brand-muted uppercase tracking-wider">Alquileres Activos</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-brand-text mt-1">126</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
            <div className="h-full bg-emerald-500 rounded-r-full" style={{ width: "85%" }}></div>
          </div>
        </div>

        {/* Tarjeta 3 - Recibos Pendientes */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden transition-colors duration-300">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg text-red-600 dark:text-red-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 rounded-md">URGENTE</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-brand-muted uppercase tracking-wider">Recibos Pendientes</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-brand-text mt-1">18</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
            <div className="h-full bg-red-500 rounded-r-full" style={{ width: "30%" }}></div>
          </div>
        </div>

        {/* Tarjeta 4 - Ingresos del Mes */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden transition-colors duration-300">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-[#024384] dark:text-blue-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16V5" />
              </svg>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 rounded-md">-5.4%</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-brand-muted uppercase tracking-wider">Ingresos del Mes</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-brand-text mt-1">$42,500.00 USD</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
            <div className="h-full bg-blue-600 rounded-r-full" style={{ width: "75%" }}></div>
          </div>
        </div>
      </div>

      {/* 3. SECCIÓN INTERMEDIA: Acciones Rápidas e Inmueble Destacado Dinámico */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Acciones Rápidas */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors duration-300">
          <div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-brand-text mb-6">Acciones Rápidas</h2>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:border-[#826229] dark:hover:border-[#C69B56] transition-all group cursor-pointer">
                <div className="flex items-center gap-3.5">
                  <div className="p-2 bg-[#826229]/10 rounded-lg text-[#826229] dark:text-brand-gold">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-brand-text">Agregar Inmueble</span>
                </div>
                <svg className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button className="w-full flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:border-[#826229] dark:hover:border-[#C69B56] transition-all group cursor-pointer">
                <div className="flex items-center gap-3.5">
                  <div className="p-2 bg-[#826229]/10 rounded-lg text-[#826229] dark:text-brand-gold">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-brand-text">Generar Recibo</span>
                </div>
                <svg className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button className="w-full flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:border-[#826229] dark:hover:border-[#C69B56] transition-all group cursor-pointer">
                <div className="flex items-center gap-3.5">
                  <div className="p-2 bg-[#826229]/10 rounded-lg text-[#826229] dark:text-brand-gold">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-brand-text">Registrar Movimiento</span>
                </div>
                <svg className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Inmueble Destacado (Usa el primer inmueble del array si existe) */}
        <div 
          className="lg:col-span-2 relative rounded-xl overflow-hidden shadow-sm h-72 lg:h-auto min-h-70 bg-cover bg-center group transition-all duration-500" 
          style={{ backgroundImage: `url('${inmuebleDestacado?.fotos || '/img/inicio-la-finca.png'}')` }}
        >
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/60 to-transparent"></div>
          
          <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
            <span className="self-start text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-[#826229] dark:bg-[#C69B56] rounded-md shadow-md">
              Destacado del Mes
            </span>
            
            <div className="space-y-3">
              <h3 className="text-2xl font-bold tracking-tight">
                {inmuebleDestacado ? `${inmuebleDestacado.tipo_inmueble} - ${inmuebleDestacado.direccion}` : "Villa Las Palmeras - Sector A"}
              </h3>
              <p className="text-slate-200 text-sm max-w-xl font-light line-clamp-2">
                {inmuebleDestacado?.observaciones || "Esta propiedad ha generado un rendimiento del 14% este trimestre. Revisión de mantenimiento programada."}
              </p>
              <button className="bg-white hover:bg-slate-100 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition-colors shadow-md hover:shadow-lg cursor-pointer">
                Ver Detalles
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SECCIÓN INFERIOR: Tabla de Inmuebles Dinámica */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-950 dark:text-brand-text">Inmuebles Registrados</h2>
          <span className="text-xs font-bold text-[#826229] dark:text-brand-gold">
            Total: {inmuebles.length}
          </span>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#826229]"></div>
          </div>
        ) : inmuebles.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            No hay inmuebles registrados en la base de datos.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800">
                  <th className="p-4 text-[10px] font-bold text-slate-400 dark:text-brand-muted uppercase tracking-wider pl-6">Inmueble</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 dark:text-brand-muted uppercase tracking-wider">Tipo</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 dark:text-brand-muted uppercase tracking-wider">Monto</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 dark:text-brand-muted uppercase tracking-wider">Ubicación</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 dark:text-brand-muted uppercase tracking-wider">Estado</th>
                  <th className="p-4 text-right pr-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {inmuebles.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                    {/* Inmueble con Miniatura */}
                    <td className="p-4 pl-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-950 overflow-hidden shrink-0 border border-slate-200/50 dark:border-slate-800">
                        <img 
                          src={act.fotos || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=100&q=80"} 
                          alt={act.direccion} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{act.direccion}</span>
                    </td>
                    
                    {/* Tipo */}
                    <td className="p-4 text-sm text-slate-600 dark:text-brand-muted">{act.tipo_inmueble}</td>
                    
                    {/* Monto / Precio */}
                    <td className="p-4 text-sm font-extrabold text-[#024384] dark:text-blue-400">
                      ${Number(act.precio).toLocaleString("es-AR")} USD
                    </td>
                    
                    {/* Ubicación */}
                    <td className="p-4 text-sm text-slate-500 dark:text-brand-muted">
                      {act.localidad}{act.provincia ? `, ${act.provincia}` : ""}
                    </td>
                    
                    {/* Estado */}
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                        act.estado === "DISPONIBLE" || act.estado === "ACTIVO" 
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" 
                          : act.estado === "PENDIENTE" || act.estado === "RESERVADO"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}>
                        {act.estado}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="p-4 text-right pr-6">
                      <button className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación simple */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400 dark:text-brand-muted px-6">
          <span>MOSTRANDO {inmuebles.length} REGISTROS</span>
          <div className="flex gap-1.5">
            <button className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 cursor-pointer disabled:opacity-50" disabled>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 cursor-pointer disabled:opacity-50" disabled>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
