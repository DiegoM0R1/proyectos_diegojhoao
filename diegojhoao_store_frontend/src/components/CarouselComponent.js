// src/components/CarouselComponent.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api'; 

function CarouselComponent({ carouselName = "principal" }) {
  const [carouselData, setCarouselData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCarousel = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:8000/api/carousels/?nombre=${carouselName}&activo=true`);
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          setCarouselData(response.data[0]);
        } else if (response.data && response.data.results && Array.isArray(response.data.results) && response.data.results.length > 0) {
          setCarouselData(response.data.results[0]);
        } else {
          console.warn(`Carrusel "${carouselName}" no encontrado o respuesta inválida.`);
          setError(`Carrusel "${carouselName}" no encontrado o sin slides activos.`);
          setCarouselData(null);
        }
      } catch (err) {
        console.error(`Error fetching carousel ${carouselName}:`, err);
        setError("Error al cargar datos del carrusel.");
        setCarouselData(null);
      } finally {
        setLoading(false);
      }
    };

    if (carouselName) {
      fetchCarousel();
    } else {
      setError("Nombre del carrusel no especificado.");
      setLoading(false);
    }
  }, [carouselName]);

  if (loading) {
    return (
      <div className="h-64 sm:h-80 md:h-96 lg:h-[500px] flex items-center justify-center bg-brand-pale-pink/30 animate-pulse rounded-xl">
        <p className="text-brand-charcoal-purple">Cargando carrusel...</p>
      </div>
    );
  }

  if (error) {
    return <div className="h-64 sm:h-80 md:h-96 lg:h-[500px] flex items-center justify-center text-center text-accent bg-brand-pale-pink/50 p-4 rounded-xl shadow">{error}</div>;
  }

  if (!carouselData || !carouselData.slides || carouselData.slides.length === 0) {
    return <div className="h-64 sm:h-80 md:h-96 lg:h-[500px] flex items-center justify-center text-center text-brand-charcoal-purple bg-brand-pale-pink/50 p-4 rounded-xl shadow">No hay imágenes para mostrar en este carrusel ({carouselName}).</div>;
  }

  return (
    <div className="carousel-wrapper relative mb-8 md:mb-12 shadow-xl rounded-2xl overflow-hidden bg-brand-almost-black">
      <Carousel
        autoPlay
        infiniteLoop
        showThumbs={false}
        showStatus={false}
        interval={5000}
        transitionTime={700}
        emulateTouch={true}
        swipeable={true}
        renderArrowPrev={(onClickHandler, hasPrev, label) =>
          hasPrev && (
            <button
              type="button" onClick={onClickHandler} title={label}
              className="absolute z-30 left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 md:p-3 shadow-lg transition-all backdrop-blur-sm"
              aria-label="Anterior slide"
            >
              <ChevronLeft size={20} className="md:w-6 md:h-6" />
            </button>
          )
        }
        renderArrowNext={(onClickHandler, hasNext, label) =>
          hasNext && (
            <button
              type="button" onClick={onClickHandler} title={label}
              className="absolute z-30 right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 md:p-3 shadow-lg transition-all backdrop-blur-sm"
              aria-label="Siguiente slide"
            >
              <ChevronRight size={20} className="md:w-6 md:h-6" />
            </button>
          )
        }
        renderIndicator={(onClickHandler, isSelected, index, label) => (
          <li
            className={`inline-block mx-1 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full cursor-pointer transition-all duration-300 ease-in-out shadow
                        ${isSelected ? 'bg-brand-pale-pink scale-125 ring-2 ring-brand-pale-pink/50' : 'bg-brand-muted-mauve/50 hover:bg-brand-muted-mauve/80'}`}
            onClick={onClickHandler} onKeyDown={onClickHandler}
            value={index} key={index} role="button" tabIndex={0}
            title={`${label} ${index + 1}`} aria-label={`${label} ${index + 1}`}
          />
        )}
        className="h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[550px]"
      >
        {carouselData.slides.filter(slide => slide.activo).map(slide => (
          <div key={slide.id} className="h-full w-full relative select-none">
            <img
              src={slide.imagen && slide.imagen.startsWith('http') ? slide.imagen : `http://localhost:8000${slide.imagen || ''}`}
              alt={slide.titulo || `Slide de ${carouselData.nombre}`}
              className="w-full h-full object-cover" 
            />
            {/* ---- INICIO DE CAMBIOS EN EL OVERLAY DE TEXTO ---- */}
            <div className="absolute inset-0 flex flex-col justify-end items-center p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 bg-gradient-to-t from-brand-almost-black/80 via-brand-almost-black/50 to-transparent z-10"> {/* Añadido z-10, ajustado padding */}
              {(slide.titulo || slide.subtitulo || slide.enlace_url) && (
                // Contenedor del texto con ancho máximo y centrado
                <div className="text-center max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl"> 
                  {slide.titulo && (
                    <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-brand-pale-pink mb-1 md:mb-2 leading-tight [text-shadow:_0_2px_5px_rgba(0,0,0,0.8)]">
                      {slide.titulo}
                    </h3>
                  )}
                  {slide.subtitulo && (
                    <p className="text-xs sm:text-sm md:text-base lg:text-lg text-brand-pale-pink/90 mb-2 md:mb-4 leading-snug [text-shadow:_0_1px_4px_rgba(0,0,0,0.8)]">
                      {slide.subtitulo}
                    </p>
                  )}
                  {slide.enlace_url && (
                    <Link
                      to={slide.enlace_url.startsWith('/') ? slide.enlace_url : '#'}
                      href={!slide.enlace_url.startsWith('/') ? slide.enlace_url : undefined}
                      target={!slide.enlace_url.startsWith('/') || slide.abrir_en_nueva_pestana ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                      className="mt-2 inline-block bg-gradient-to-r from-primary to-brand-deep-plum hover:from-brand-deep-plum hover:to-primary text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                      {slide.texto_enlace || "Ver Más"}
                    </Link>
                  )}
                </div>
              )}
            </div>
            {/* ---- FIN DE CAMBIOS EN EL OVERLAY DE TEXTO ---- */}
          </div>
        ))}
      </Carousel>
    </div>
  );
}

export default CarouselComponent;
