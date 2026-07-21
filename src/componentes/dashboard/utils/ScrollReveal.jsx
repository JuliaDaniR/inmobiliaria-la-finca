import { useEffect, useRef, useState } from 'react';

function ScrollReveal({ children }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        setIsVisible(entry.isIntersecting);
      });
    }, {
      threshold: 0.10
    });

    // Copiamos el elemento actual del ref a una variable local
    const currentRef = domRef.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    // Retornamos la función de limpieza usando la variable local
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
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