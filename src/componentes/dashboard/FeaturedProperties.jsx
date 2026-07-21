import { useEffect, useState } from "react";
import { getInmuebles } from "../../services/inmuebles.service";
import InmuebleCard from "../inmuebles/InmueblesCard.jsx";

function FeaturedProperties() {
  const [inmuebles, setInmuebles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarInmuebles = async () => {
      try {
        const data = await getInmuebles();
        setInmuebles(data);
      } catch (err) {
        console.error("Error al cargar propiedades:", err);
        setError("No se pudieron cargar las propiedades.");
      } finally {
        setLoading(false);
      }
    };

    cargarInmuebles();
  }, []);

  return (
    <section id="propiedades" className="w-full py-6 scroll-mt-36">
      {/* Cabecera de la Sección */}
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 text-left px-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue dark:text-white font-serif inline-block relative pb-2.5">
            Propiedades Destacadas
            <span className="absolute bottom-0 left-0 w-16 h-0.5 bg-brand-gold"></span>
          </h2>
        </div>

        <a
          href="#catalogo"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue dark:text-brand-gold hover:text-brand-gold transition-colors group cursor-pointer"
        >
          Ver catálogo completo
          <svg
            className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </a>
      </div>

      {/* Grid de Tarjetas o Estados de Carga / Error */}
      <div className="max-w-5xl mx-auto px-4">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#826229]"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500 rounded text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        ) : inmuebles.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-sm">
            No hay propiedades disponibles en este momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {inmuebles.slice(0, 6).map((inmueble) => (
              <InmuebleCard key={inmueble.id} inmueble={inmueble} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedProperties;
