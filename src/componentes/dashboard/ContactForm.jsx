function ContactForm() {
  return (
    <section
      id="contacto"
      className="w-full py-16 scroll-mt-24"
    >
      <div className="max-w-5xl mx-auto px-4">
        {/* Cabecera de la Sección de Contacto */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 text-left">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue dark:text-white font-serif inline-block relative pb-2.5">
              Solicitud de Contacto
              <span className="absolute bottom-0 left-0 w-16 h-0.5 bg-brand-gold"></span>
            </h2>
          </div>
        </div>
        {/* Contenedor Principal con Sombra y Bordes Redondeados (El código de la tarjeta sigue aquí abajo...) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row transition-all duration-300">
          {/* LADO IZQUIERDO: Información Corporativa (Fondo Azul Marino) */}
          <div className="w-full md:w-5/12 bg-brand-blue p-8 md:p-10 text-white flex flex-col justify-between text-left">
            <div>
              <h3 className="text-xl font-bold font-serif mb-4 text-white">
                Inicie una conversación
              </h3>
              <p className="text-xs md:text-sm text-blue-100 font-light leading-relaxed">
                Nuestro equipo de expertos está a su disposición para discutir
                sus necesidades inmobiliarias con total confidencialidad.
              </p>
            </div>

            {/* Datos de contacto con iconos */}
            <div className="mt-10 md:mt-0 space-y-6">
              {/* Teléfono */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5 text-brand-gold"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.802-5.188-4.166-7-7l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                    />
                  </svg>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-blue-200">
                    Teléfono
                  </span>
                  <a
                    href="tel:+34910000000"
                    className="block text-sm font-semibold hover:text-brand-gold transition-colors"
                  >
                    +34 910 000 000
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5 text-brand-gold"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                    />
                  </svg>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-blue-200">
                    Email
                  </span>
                  <a
                    href="mailto:contacto@lafinca.com"
                    className="block text-sm font-semibold hover:text-brand-gold transition-colors"
                  >
                    contacto@lafinca.com
                  </a>
                </div>
              </div>

              {/* Dirección */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5 text-brand-gold"
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
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-blue-200">
                    Oficina Central
                  </span>
                  <span className="block text-xs font-light">
                    P.º de la Finca, 1, Pozuelo, Madrid
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* LADO DERECHO: Formulario (Fondo Claro/Gris en Dark Mode) */}
          <div className="w-full md:w-7/12 p-8 md:p-10 text-left bg-gray-50/50 dark:bg-slate-900/50">
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              {/* Nombre Completo */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-blue dark:text-brand-gold mb-1.5">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  placeholder="Su nombre..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-gold dark:focus:border-brand-gold transition-colors"
                />
              </div>

              {/* Email Corporativo */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-blue dark:text-brand-gold mb-1.5">
                  Email Corporativo
                </label>
                <input
                  type="email"
                  placeholder="email@empresa.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-gold dark:focus:border-brand-gold transition-colors"
                />
              </div>

              {/* Interés Principal (Select) */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-blue dark:text-brand-gold mb-1.5">
                  Interés Principal
                </label>
                <select
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-sm text-brand-text dark:text-gray-300 focus:outline-none focus:border-brand-gold dark:focus:border-brand-gold transition-colors cursor-pointer appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 1rem center",
                    backgroundSize: "1em",
                  }}
                >
                  <option value="patrimonio">Gestión de Patrimonio</option>
                  <option value="comprar">Comprar Propiedad Premium</option>
                  <option value="alquilar">Alquiler de Alto Standing</option>
                  <option value="consultoria">
                    Consultoría Legal / Inversión
                  </option>
                </select>
              </div>

              {/* Mensaje */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-blue dark:text-brand-gold mb-1.5">
                  Mensaje
                </label>
                <textarea
                  rows="4"
                  placeholder="Díganos cómo podemos ayudarle..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-gold dark:focus:border-brand-gold transition-colors resize-none"
                ></textarea>
              </div>

              {/* Botón de Enviar */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-brand-gold hover:bg-brand-gold/90 text-white font-bold text-sm rounded-lg shadow-md hover:shadow-brand-gold/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  Enviar Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactForm;
