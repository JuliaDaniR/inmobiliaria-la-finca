
function InmuebleCard({ inmueble }) {
  const { tipo_inmueble, direccion, localidad, provincia, precio, estado, fotos } = inmueble;

  // Formateador de moneda en ARS/USD
  const precioFormateado = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(precio);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group">
      {/* Imagen principal */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={fotos || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80"}
          alt={tipo_inmueble}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
          estado === "DISPONIBLE"
            ? "bg-emerald-500 text-white"
            : "bg-amber-500 text-white"
        }`}>
          {estado}
        </span>
      </div>

      {/* Contenido */}
      <div className="p-5 flex flex-col justify-between flex-1">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#826229] dark:text-[#C69B56]">
            {tipo_inmueble}
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">
            {direccion}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {localidad}{provincia ? `, ${provincia}` : ""}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-semibold block">Precio</span>
            <span className="text-lg font-extrabold text-[#024384] dark:text-blue-400">
              {precioFormateado}
            </span>
          </div>
          <button className="px-3 py-1.5 text-xs font-semibold text-white bg-[#826229] dark:bg-[#C69B56] hover:bg-[#6c5120] dark:hover:bg-[#b08443] rounded-lg transition-colors cursor-pointer">
            Ver detalle
          </button>
        </div>
      </div>
    </div>
  );
}

export default InmuebleCard;
