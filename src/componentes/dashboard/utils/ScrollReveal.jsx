import { useEffect, useRef, useState } from 'react';

function ScrollReveal({ children }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // Hacemos un "toggle": si está en pantalla es true, si sale de pantalla es false
        setIsVisible(entry.isIntersecting);
      });
    }, {
      threshold: 0.10 // Bajamos un poco el umbral para que responda más rápido al hacer saltos directos
    });

    if (domRef.current) {
      observer.observe(domRef.current);
    }

    return () => {
      if (domRef.current) {
        observer.unobserve(domRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8' // Reducimos el desplazamiento a 8 para que el salto sea más sutil y rápido
      }`}
    >
      {children}
    </div>
  );
}

export default ScrollReveal;