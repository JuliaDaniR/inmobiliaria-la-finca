
function Divider() {
  return (
    <div className="relative my-16 flex items-center justify-center max-w-5xl mx-auto px-4">
      {/* Línea difuminada en los extremos */}
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent dark:via-brand-gold/15"></div>
      </div>
      
      {/* Detalle del Diamante Dorado central */}
      <div className="relative flex justify-center">
        <span className="bg-brand-bg px-4 text-brand-gold transition-colors duration-300">
          <svg className="w-2.5 h-2.5 fill-current rotate-45" viewBox="0 0 10 10">
            <rect width="10" height="10" />
          </svg>
        </span>
      </div>
    </div>
  );
}

export default Divider;