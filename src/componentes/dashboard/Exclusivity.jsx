function Exclusivity() {
  return (
    <section id="nosotros" className="w-full py-16 scroll-mt-24">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Grid de 2 Columnas Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Columna Izquierda: Grid 2x2 de Imágenes y Bloques de Servicio */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* 1. Imagen Oficina */}
            <div className="h-44 md:h-52 rounded-lg overflow-hidden shadow-sm">
              <img 
                 src="/public/img/imagen-oficina.png" 
                 alt="Oficina de lujo" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* 2. Tarjeta Azul: Seguridad Jurídica */}
            <div className="h-44 md:h-52 bg-brand-blue text-white p-5 rounded-lg flex flex-col justify-center text-left shadow-sm">
              <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <h4 className="text-sm font-bold tracking-wide uppercase font-serif mb-1">Seguridad Jurídica</h4>
              <p className="text-[11px] text-blue-100 font-light leading-relaxed">
                Asesoramiento legal integral en cada transacción patrimonial.
              </p>
            </div>

            {/* 3. Tarjeta Dorada: Portfolio Off-Market */}
            <div className="h-44 md:h-52 bg-brand-gold text-white p-5 rounded-lg flex flex-col justify-center text-left shadow-sm">
              <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
              </div>
              <h4 className="text-sm font-bold tracking-wide uppercase font-serif mb-1">Portfolio Off-Market</h4>
              <p className="text-[11px] text-amber-50 font-light leading-relaxed">
                Acceso exclusivo a las propiedades más discretas del mercado.
              </p>
            </div>

            {/* 4. Imagen Firma Contrato */}
            <div className="h-44 md:h-52 rounded-lg overflow-hidden shadow-sm">
              <img 
                src="/public/img/imagen-contrato.png"
                alt="Firma de contrato" 
                className="w-full h-full object-cover"
              />
            </div>

          </div>

          {/* Columna Derecha: Información y Detalle Textual */}
          <div className="text-left flex flex-col justify-center">
            <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue dark:text-white font-serif relative pb-3 mb-6">
              Exclusividad en cada detalle
              <span className="absolute bottom-0 left-0 w-16 h-0.5 bg-brand-gold"></span>
            </h2>

            <div className="space-y-4 text-xs md:text-sm text-brand-muted dark:text-gray-300 font-light leading-relaxed">
              <p>
                En <strong className="font-semibold text-brand-blue dark:text-brand-gold">La Finca Prestige Management</strong>, no solo gestionamos propiedades; elevamos el estándar de vida de nuestros clientes. Nuestra metodología combina el rigor del análisis financiero con la sensibilidad del mercado de lujo.
              </p>
              <p>
                Cada propiedad en nuestro catálogo ha sido seleccionada bajo estrictos criterios de arquitectura, ubicación y potencial de revalorización. Ofrecemos un acompañamiento personalizado que va desde la búsqueda inicial hasta el mantenimiento post-venta.
              </p>
            </div>

            {/* Lista de Checks */}
            <ul className="mt-8 space-y-3.5">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-brand-blue/10 dark:bg-brand-gold/15 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-brand-blue dark:text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <span className="text-xs md:text-sm font-semibold text-brand-blue dark:text-gray-200">
                  Gestión de alquileres de corta y larga estancia
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-brand-blue/10 dark:bg-brand-gold/15 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-brand-blue dark:text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <span className="text-xs md:text-sm font-semibold text-brand-blue dark:text-gray-200">
                  Personal Shopper inmobiliario especializado
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-brand-blue/10 dark:bg-brand-gold/15 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-brand-blue dark:text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <span className="text-xs md:text-sm font-semibold text-brand-blue dark:text-gray-200">
                  Administración de comunidades de alto standing
                </span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </section>
  );
}

export default Exclusivity;