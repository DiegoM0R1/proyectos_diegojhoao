import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import axios from 'axios';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';

// Constantes de configuración
const CAROUSEL_CONFIG = {
  autoPlayInterval: 5000,
  transitionTime: 700,
  baseApiUrl: 'http://localhost:8000',
  heights: {
    mobile: 'h-64',
    tablet: 'sm:h-80',
    desktop: 'md:h-96',
    large: 'lg:h-[500px]',
    xlarge: 'xl:h-[550px]'
  }
};

// Componente de Loading mejorado
const CarouselSkeleton = memo(() => (
  <div className={`${Object.values(CAROUSEL_CONFIG.heights).join(' ')} flex items-center justify-center bg-gradient-to-br from-brand-pale-pink/20 to-brand-muted-mauve/20 animate-pulse rounded-2xl shadow-lg`}>
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="w-8 h-8 text-brand-charcoal-purple animate-spin" />
      <p className="text-brand-charcoal-purple font-medium">Cargando carrusel...</p>
      <div className="flex space-x-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-3 h-3 bg-brand-muted-mauve/40 rounded-full animate-pulse" />
        ))}
      </div>
    </div>
  </div>
));

// Componente de Error mejorado
const CarouselError = memo(({ error, carouselName }) => (
  <div className={`${Object.values(CAROUSEL_CONFIG.heights).join(' ')} flex items-center justify-center text-center bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl shadow-lg border border-red-200`}>
    <div className="max-w-md">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-red-800 mb-2">
        Error al cargar el carrusel
      </h3>
      <p className="text-red-600 text-sm">
        {error}
        {carouselName && (
          <span className="block mt-1 font-medium">
            Carrusel: "{carouselName}"
          </span>
        )}
      </p>
    </div>
  </div>
));

// Componente de Slide individual
const SlideContent = memo(({ slide, carouselName }) => {
  const imageUrl = useMemo(() => {
    if (!slide.imagen) return '';
    return slide.imagen.startsWith('http') 
      ? slide.imagen 
      : `${CAROUSEL_CONFIG.baseApiUrl}${slide.imagen}`;
  }, [slide.imagen]);

  const linkProps = useMemo(() => {
    if (!slide.enlace_url) return null;

    const isExternal = !slide.enlace_url.startsWith('/');
    const shouldOpenNewTab = isExternal || slide.abrir_en_nueva_pestana;

    return {
      ...(isExternal 
        ? { href: slide.enlace_url } 
        : { to: slide.enlace_url }
      ),
      target: shouldOpenNewTab ? "_blank" : "_self",
      rel: shouldOpenNewTab ? "noopener noreferrer" : undefined
    };
  }, [slide.enlace_url, slide.abrir_en_nueva_pestana]);

  return (
    <div className="h-full w-full relative select-none group">
      <img
        src={imageUrl}
        alt={slide.titulo || `Slide de ${carouselName}`}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
        onError={(e) => {
          console.error(`Error loading image: ${imageUrl}`);
          e.target.style.display = 'none';
        }}
      />
      
      {/* Overlay con gradiente mejorado */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-almost-black/90 via-brand-almost-black/60 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Contenido del slide */}
      <div className="absolute inset-0 flex flex-col justify-end items-center p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 z-20">
        {(slide.titulo || slide.subtitulo || slide.enlace_url) && (
          <div className="text-center max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
            {slide.titulo && (
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-brand-pale-pink mb-1 md:mb-2 leading-tight drop-shadow-2xl">
                {slide.titulo}
              </h3>
            )}
            
            {slide.subtitulo && (
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-brand-pale-pink/90 mb-2 md:mb-4 leading-snug drop-shadow-lg">
                {slide.subtitulo}
              </p>
            )}
            
            {slide.enlace_url && linkProps && (
              <Link
                {...linkProps}
                className="mt-2 inline-block bg-gradient-to-r from-primary to-brand-deep-plum hover:from-brand-deep-plum hover:to-primary text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 ring-2 ring-transparent hover:ring-brand-pale-pink/30"
              >
                {slide.texto_enlace || "Ver Más"}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

// Custom hook para manejar la lógica del carrusel
const useCarouselData = (carouselName) => {
  const [carouselData, setCarouselData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCarousel = useCallback(async () => {
    if (!carouselName) {
      setError("Nombre del carrusel no especificado.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${CAROUSEL_CONFIG.baseApiUrl}/api/carousels/`,
        { 
          params: { 
            nombre: carouselName, 
            activo: true 
          },
          timeout: 10000 // 10 segundos de timeout
        }
      );

      const data = response.data;
      let carousel = null;

      if (Array.isArray(data) && data.length > 0) {
        carousel = data[0];
      } else if (data?.results && Array.isArray(data.results) && data.results.length > 0) {
        carousel = data.results[0];
      }

      if (carousel && carousel.slides && carousel.slides.length > 0) {
        // Filtrar solo slides activos
        const activeSlides = carousel.slides.filter(slide => slide.activo);
        if (activeSlides.length > 0) {
          setCarouselData({ ...carousel, slides: activeSlides });
        } else {
          setError(`El carrusel "${carouselName}" no tiene slides activos.`);
        }
      } else {
        setError(`Carrusel "${carouselName}" no encontrado o sin contenido.`);
      }
    } catch (err) {
      console.error(`Error fetching carousel ${carouselName}:`, err);
      if (err.code === 'ECONNABORTED') {
        setError("Tiempo de espera agotado. Verifica tu conexión.");
      } else if (err.response?.status === 404) {
        setError(`Carrusel "${carouselName}" no encontrado.`);
      } else {
        setError("Error al cargar datos del carrusel. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  }, [carouselName]);

  useEffect(() => {
    fetchCarousel();
  }, [fetchCarousel]);

  return { carouselData, loading, error, refetch: fetchCarousel };
};

// Componente principal mejorado
const CarouselComponent = memo(({ carouselName = "principal" }) => {
  const { carouselData, loading, error } = useCarouselData(carouselName);

  // Componentes de renderizado de flechas memoizados
  const renderArrowPrev = useCallback((onClickHandler, hasPrev, label) =>
    hasPrev && (
      <button
        type="button"
        onClick={onClickHandler}
        title={label}
        className="absolute z-30 left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 md:p-3 shadow-lg transition-all duration-300 backdrop-blur-sm hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-pale-pink/50"
        aria-label="Slide anterior"
      >
        <ChevronLeft size={20} className="md:w-6 md:h-6" />
      </button>
    ), []
  );

  const renderArrowNext = useCallback((onClickHandler, hasNext, label) =>
    hasNext && (
      <button
        type="button"
        onClick={onClickHandler}
        title={label}
        className="absolute z-30 right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 md:p-3 shadow-lg transition-all duration-300 backdrop-blur-sm hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-pale-pink/50"
        aria-label="Slide siguiente"
      >
        <ChevronRight size={20} className="md:w-6 md:h-6" />
      </button>
    ), []
  );

  const renderIndicator = useCallback((onClickHandler, isSelected, index, label) => (
    <li
      className={`inline-block mx-1 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full cursor-pointer transition-all duration-300 ease-in-out shadow-md hover:shadow-lg
        ${isSelected 
          ? 'bg-brand-pale-pink scale-125 ring-2 ring-brand-pale-pink/50' 
          : 'bg-brand-muted-mauve/50 hover:bg-brand-muted-mauve/80 hover:scale-110'
        }`}
      onClick={onClickHandler}
      onKeyDown={(e) => e.key === 'Enter' && onClickHandler()}
      value={index}
      key={index}
      role="button"
      tabIndex={0}
      title={`${label} ${index + 1}`}
      aria-label={`Ir al slide ${index + 1}`}
    />
  ), []);

  // Estados de carga y error
  if (loading) return <CarouselSkeleton />;
  if (error) return <CarouselError error={error} carouselName={carouselName} />;
  if (!carouselData?.slides?.length) {
    return <CarouselError error={`No hay slides disponibles en el carrusel "${carouselName}".`} carouselName={carouselName} />;
  }

  return (
    <div className="carousel-wrapper relative mb-8 md:mb-12 shadow-2xl rounded-2xl overflow-hidden bg-brand-almost-black backdrop-blur-sm">
      <Carousel
        autoPlay
        infiniteLoop
        showThumbs={false}
        showStatus={false}
        interval={CAROUSEL_CONFIG.autoPlayInterval}
        transitionTime={CAROUSEL_CONFIG.transitionTime}
        emulateTouch
        swipeable
        dynamicHeight={false}
        useKeyboardArrows
        renderArrowPrev={renderArrowPrev}
        renderArrowNext={renderArrowNext}
        renderIndicator={renderIndicator}
        className={`${Object.values(CAROUSEL_CONFIG.heights).join(' ')}`}
      >
        {carouselData.slides.map(slide => (
          <SlideContent 
            key={slide.id} 
            slide={slide} 
            carouselName={carouselData.nombre} 
          />
        ))}
      </Carousel>
    </div>
  );
});

CarouselComponent.displayName = 'CarouselComponent';
SlideContent.displayName = 'SlideContent';
CarouselSkeleton.displayName = 'CarouselSkeleton';
CarouselError.displayName = 'CarouselError';

export default CarouselComponent;