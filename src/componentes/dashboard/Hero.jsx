function Hero() {
  return (
    <section className="relative w-full min-h-[60vh] flex items-center justify-center py-12 md:py-16 scroll-mt-20" id="inicio">
      {/* Imagen de fondo con overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="/img/inicio-la-finca.png"
          alt="Mansión de lujo La Finca"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-linear-to-r from-brand-blue/95 via-brand-blue/70 to-transparent dark:from-black/95 dark:via-black/80 dark:to-black/40"></div>
      </div>
      {/* Contenido principal (Grid responsivo) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-left">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
          {/* Columna Izquierda: Textos y Botones */}
          <div className="max-w-2xl">
            {/* Badge Dorado superior */}
            <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white bg-brand-gold rounded mb-4 shadow-sm">
              Exclusividad & Rigor
            </span>

            {/* Título Principal */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight font-serif">
              Excelencia en Gestión Inmobiliaria de Lujo
            </h1>

            {/* Subtítulo */}
            <p className="mt-4 text-sm md:text-base text-gray-200 font-light max-w-xl leading-relaxed">
              Ofrecemos un servicio de gestión patrimonial 360º para
              propietarios e inversores exigentes. Confíe en el líder de Real
              Estate premium en Madrid.
            </p>

            {/* Botones de acción */}
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#propiedades"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-gold hover:bg-brand-gold/90 text-white text-sm font-semibold rounded shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                Ver Propiedades
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </a>

              <a
                href="#contacto"
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded backdrop-blur-md border border-white/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                Consultoría Privada
              </a>
            </div>
          </div>

          {/* Columna Derecha: Estadísticas Horizontales a la derecha */}
          <div className="flex flex-row gap-6 md:gap-8 justify-start lg:justify-end shrink-0 pb-2">
            <div>
              <span className="block text-xl md:text-2xl font-bold text-brand-gold">
                150+
              </span>
              <span className="block text-[9px] uppercase tracking-wider text-gray-300 font-semibold mt-0.5">
                Activos Premium
              </span>
            </div>
            <div className="pl-6 border-l border-white/10 md:pl-8">
              <span className="block text-xl md:text-2xl font-bold text-brand-gold">
                USD 1.2B
              </span>
              <span className="block text-[9px] uppercase tracking-wider text-gray-300 font-semibold mt-0.5">
                Bajo Gestión
              </span>
            </div>
            <div className="pl-6 border-l border-white/10 md:pl-8">
              <span className="block text-xl md:text-2xl font-bold text-brand-gold">
                25 Años
              </span>
              <span className="block text-[9px] uppercase tracking-wider text-gray-300 font-semibold mt-0.5">
                Trayectoria
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
