function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-slate-950 border-t border-gray-100 dark:border-gray-900 py-12 md:py-16 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Grid de 4 Columnas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 text-left">
          
          {/* Columna 1: Branding y Eslogan */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="text-base font-bold tracking-wider text-brand-blue dark:text-brand-gold font-serif">
                La Finca
              </span>
            </div>
            <p className="text-[11px] md:text-xs text-brand-muted dark:text-gray-400 font-light leading-relaxed max-w-55">
              Referente indiscutible en la gestión inmobiliaria de alto standing. Su patrimonio, nuestra prioridad.
            </p>
          </div>

          {/* Columna 2: Enlaces */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-brand-blue dark:text-brand-gold mb-4">
              Enlaces
            </h4>
            <ul className="space-y-2 text-xs text-brand-muted dark:text-gray-400 font-medium">
              <li>
                <a href="#inicio" className="hover:text-brand-gold transition-colors">Inicio</a>
              </li>
              <li>
                <a href="#propiedades" className="hover:text-brand-gold transition-colors">Propiedades</a>
              </li>
              <li>
                <a href="#nosotros" className="hover:text-brand-gold transition-colors">Nosotros</a>
              </li>
              <li>
                <a href="#contacto" className="hover:text-brand-gold transition-colors">Contacto</a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Legal */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-brand-blue dark:text-brand-gold mb-4">
              Legal
            </h4>
            <ul className="space-y-2 text-xs text-brand-muted dark:text-gray-400 font-medium">
              <li>
                <a href="#privacidad" className="hover:text-brand-gold transition-colors">Privacidad</a>
              </li>
              <li>
                <a href="#terminos" className="hover:text-brand-gold transition-colors">Términos de Uso</a>
              </li>
              <li>
                <a href="#cookies" className="hover:text-brand-gold transition-colors">Cookies</a>
              </li>
            </ul>
          </div>

          {/* Columna 4: Síguenos */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-brand-blue dark:text-brand-gold mb-4">
              Síguenos
            </h4>
            <div className="flex items-center gap-3">
              {/* Botón Red social 1 (Compartir/Link) */}
              <a 
                href="#share" 
                aria-label="Compartir"
                className="w-8 h-8 rounded-full bg-gray-50 dark:bg-slate-900 border border-gray-200/50 dark:border-gray-800 flex items-center justify-center text-brand-blue dark:text-brand-gold hover:bg-brand-gold hover:text-white dark:hover:bg-brand-gold dark:hover:text-white transition-all cursor-pointer shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                </svg>
              </a>
              
              {/* Botón Red social 2 (Web/Globo) */}
              <a 
                href="#web" 
                aria-label="Sitio Web"
                className="w-8 h-8 rounded-full bg-gray-50 dark:bg-slate-900 border border-gray-200/50 dark:border-gray-800 flex items-center justify-center text-brand-blue dark:text-brand-gold hover:bg-brand-gold hover:text-white dark:hover:bg-brand-gold dark:hover:text-white transition-all cursor-pointer shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-.778.099-1.533.284-2.253" />
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* Separador inferior y Copyright */}
        <div className="border-t border-gray-100 dark:border-gray-900 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-brand-muted dark:text-gray-500 font-semibold tracking-wider uppercase">
          <span>&copy; {new Date().getFullYear()} La Finca. Todos los derechos reservados.</span>
          <span className="flex flex-col text-center sm:text-right">
            Desarrollado por: 
            <span className="font-bold">Barbara Volpe</span>
            <span className="font-bold">Verónica Hsu</span> 
            <span className="font-bold">Julia Rodriguez</span>
          </span>
        </div>

      </div>
    </footer>
  );
}

export default Footer;