function FeaturedProperties() {
  return (
    <section id="propiedades" className="w-full py-6 scroll-mt-36">
      {/* Cabecera de la Sección (Centrada con el mismo ancho de las tarjetas) */}
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
      {/* Grid de Tarjetas (Más compacto, aireado y centrado) */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
        {/* Tarjeta 1: Villa Horizonte */}
        <div className="flex flex-col h-full group bg-white dark:bg-slate-900 rounded-lg overflow-hidden shadow-md hover:shadow-xl border border-gray-200/60 dark:border-gray-800 transition-all duration-300">
          <div className="relative h-48 w-full overflow-hidden shrink-0">
            <img
              src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80"
              alt="Villa Horizonte"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300"></div>
            <span className="absolute top-3 left-3 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded text-white bg-brand-blue dark:bg-blue-700 shadow-sm">
              Nueva
            </span>
          </div>

          {/* Contenido (Flex grow para empujar el footer) */}
          <div className="flex flex-col grow  p-5 text-left">
            <div className="flex justify-between items-start gap-2 mb-2">
              <h3 className="text-base font-bold text-brand-blue dark:text-white group-hover:text-brand-gold transition-colors font-serif">
                Villa Horizonte
              </h3>
              <span className="text-sm font-bold text-brand-gold shrink-0">
                USD 3.200.000
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-brand-muted dark:text-gray-400 text-xs mb-4">
              <svg
                className="w-3.5 h-3.5 text-brand-gold shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                />
              </svg>
              <span>Pozuelo de Alarcón, Madrid</span>
            </div>
            {/* Este div 'mt-auto' fuerza a que el separador y los iconos siempre queden al mismo nivel abajo */}
            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="grid grid-cols-3 gap-1 text-center text-[11px] font-semibold text-brand-muted dark:text-gray-400">
                <div className="flex items-center justify-center gap-1">
                  <svg
                    className="w-3.5 h-3.5 text-brand-gold shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 3.75v16.5m16.5-16.5v16.5M3.75 12h16.5M5.625 5.625h12.75M5.625 18.375h12.75"
                    />
                  </svg>
                  <span>650 m²</span>
                </div>
                <div className="flex items-center justify-center gap-1 border-x border-gray-100 dark:border-gray-800">
                  <svg
                    className="w-3.5 h-3.5 text-brand-gold shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 12h14M5 12a2 2 0 012-2h10a2 2 0 012 2M5 12a2 2 0 002 2h10a2 2 0 002-2M2 8v11M22 8v11"
                    />
                  </svg>
                  <span>5 Hab.</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <svg
                    className="w-3.5 h-3.5 text-brand-gold shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 15.75V3m-3.75 3h15a2.25 2.25 0 012.25 2.25v11.25A2.25 2.25 0 0119.5 21.75h-15a2.25 2.25 0 01-2.25-2.25V8.25A2.25 2.25 0 014.5 6Z"
                    />
                  </svg>
                  <span>6 Baños</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Tarjeta 2: Ático Castellana */}
        <div className="flex flex-col h-full group bg-white dark:bg-slate-900 rounded-lg overflow-hidden shadow-md hover:shadow-xl border border-gray-200/60 dark:border-gray-800 transition-all duration-300">
          <div className="relative h-48 w-full overflow-hidden shrink-0">
            <img
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
              alt="Ático Castellana"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300"></div>
            <span className="absolute top-3 left-3 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded text-white bg-brand-gold shadow-sm">
              Reservado
            </span>
          </div>

          <div className="flex flex-col grow p-5 text-left">
            <div className="flex justify-between items-start gap-2 mb-2">
              <h3 className="text-base font-bold text-brand-blue dark:text-white group-hover:text-brand-gold transition-colors font-serif">
                Ático Castellana
              </h3>
              <span className="text-sm font-bold text-brand-gold shrink-0">
                USD 1.850.000
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-brand-muted dark:text-gray-400 text-xs mb-4">
              <svg
                className="w-3.5 h-3.5 text-brand-gold shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                />
              </svg>
              <span>Barrio de Salamanca, Madrid</span>
            </div>
            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="grid grid-cols-3 gap-1 text-center text-[11px] font-semibold text-brand-muted dark:text-gray-400">
                <div className="flex items-center justify-center gap-1">
                  <svg
                    className="w-3.5 h-3.5 text-brand-gold shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 3.75v16.5m16.5-16.5v16.5M3.75 12h16.5M5.625 5.625h12.75M5.625 18.375h12.75"
                    />
                  </svg>
                  <span>280 m²</span>
                </div>
                <div className="flex items-center justify-center gap-1 border-x border-gray-100 dark:border-gray-800">
                  <svg
                    className="w-3.5 h-3.5 text-brand-gold shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 12h14M5 12a2 2 0 012-2h10a2 2 0 012 2M5 12a2 2 0 002 2h10a2 2 0 002-2M2 8v11M22 8v11"
                    />
                  </svg>
                  <span>3 Hab.</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <svg
                    className="w-3.5 h-3.5 text-brand-gold shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 15.75V3m-3.75 3h15a2.25 2.25 0 012.25 2.25v11.25A2.25 2.25 0 0119.5 21.75h-15a2.25 2.25 0 01-2.25-2.25V8.25A2.25 2.25 0 014.5 6Z"
                    />
                  </svg>
                  <span>3 Baños</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Tarjeta 3: Estate La Finca II */}
        <div className="flex flex-col h-full group bg-white dark:bg-slate-900 rounded-lg overflow-hidden shadow-md hover:shadow-xl border border-gray-200/60 dark:border-gray-800 transition-all duration-300">
          <div className="relative h-48 w-full overflow-hidden shrink-0">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
              alt="Estate La Finca II"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300"></div>
          </div>

          <div className="flex flex-col grow p-5 text-left">
            <div className="flex justify-between items-start gap-2 mb-2">
              <h3 className="text-base font-bold text-brand-blue dark:text-white group-hover:text-brand-gold transition-colors font-serif">
                Estate La Finca II
              </h3>
              <span className="text-sm font-bold text-brand-gold shrink-0">
                USD 5.400.000
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-brand-muted dark:text-gray-400 text-xs mb-4">
              <svg
                className="w-3.5 h-3.5 text-brand-gold shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                />
              </svg>
              <span>La Finca, Pozuelo</span>
            </div>
            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="grid grid-cols-3 gap-1 text-center text-[11px] font-semibold text-brand-muted dark:text-gray-400">
                <div className="flex items-center justify-center gap-1">
                  <svg
                    className="w-3.5 h-3.5 text-brand-gold shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 3.75v16.5m16.5-16.5v16.5M3.75 12h16.5M5.625 5.625h12.75M5.625 18.375h12.75"
                    />
                  </svg>
                  <span>1.200 m²</span>
                </div>
                <div className="flex items-center justify-center gap-1 border-x border-gray-100 dark:border-gray-800">
                  <svg
                    className="w-3.5 h-3.5 text-brand-gold shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 12h14M5 12a2 2 0 012-2h10a2 2 0 012 2M5 12a2 2 0 002 2h10a2 2 0 002-2M2 8v11M22 8v11"
                    />
                  </svg>
                  <span>7 Hab.</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <svg
                    className="w-3.5 h-3.5 text-brand-gold shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 15.75V3m-3.75 3h15a2.25 2.25 0 012.25 2.25v11.25A2.25 2.25 0 0119.5 21.75h-15a2.25 2.25 0 01-2.25-2.25V8.25A2.25 2.25 0 014.5 6Z"
                    />
                  </svg>
                  <span>8 Baños</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturedProperties;
