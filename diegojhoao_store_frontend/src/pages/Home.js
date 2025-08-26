import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, ShoppingBag, ArrowRight, TrendingUp, Shield, Heart, Truck, 
  Sparkles, Zap, Award, Users, ArrowUpCircle, AlertTriangle, RefreshCw 
} from 'lucide-react';
import ApiService from '../services/api';
import ProductCard from '../components/ProductCard';
import CarouselComponent from '../components/CarouselComponent';

// Constantes de configuración
const ANIMATION_CONFIG = {
  featureRotationInterval: 4000,
  scrollThreshold: 300,
  statsAnimationDuration: 2000,
  statsObserverThreshold: 0.5
};

const STATS_TARGETS = {
  customers: 10000,
  products: 500,
  satisfaction: 99
};

// Custom Hook para manejo de scroll y mouse
const usePageInteractions = () => {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleScroll = useCallback(() => {
    const newScrollY = window.scrollY;
    setScrollY(newScrollY);
    setShowScrollTop(newScrollY > ANIMATION_CONFIG.scrollThreshold);
  }, []);

  const handleMouseMove = useCallback((e) => {
    setMousePosition({
      x: (e.clientX / window.innerWidth) * 100,
      y: (e.clientY / window.innerHeight) * 100
    });
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    let rafId = null;
    
    const throttledScroll = () => {
      rafId = requestAnimationFrame(handleScroll);
    };

    const throttledMouseMove = (e) => {
      rafId = requestAnimationFrame(() => handleMouseMove(e));
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    window.addEventListener('mousemove', throttledMouseMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('mousemove', throttledMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [handleScroll, handleMouseMove]);

  return { scrollY, mousePosition, showScrollTop, scrollToTop };
};

// Custom Hook para animación de estadísticas
const useStatsAnimation = (statsRef) => {
  const [hasAnimatedStats, setHasAnimatedStats] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({ 
    customers: 0, 
    products: 0, 
    satisfaction: 0 
  });

  const animateStatsNumbers = useCallback(() => {
    const startTime = Date.now();
    const animations = {};

    Object.keys(STATS_TARGETS).forEach(key => {
      animations[key] = { start: 0, end: STATS_TARGETS[key] };
    });

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / ANIMATION_CONFIG.statsAnimationDuration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const newStats = {};
      Object.keys(animations).forEach(key => {
        const { start, end } = animations[key];
        newStats[key] = Math.floor(start + (end - start) * easeOut);
      });

      setAnimatedStats(newStats);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (!statsRef.current || hasAnimatedStats) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimatedStats(true);
          animateStatsNumbers();
          observer.disconnect();
        }
      },
      { threshold: ANIMATION_CONFIG.statsObserverThreshold }
    );

    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [hasAnimatedStats, animateStatsNumbers]);

  return { hasAnimatedStats, animatedStats };
};

// Custom Hook para rotación de características
const useFeatureRotation = (featuresCount) => {
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % featuresCount);
    }, ANIMATION_CONFIG.featureRotationInterval);

    return () => clearInterval(interval);
  }, [featuresCount]);

  return currentFeature;
};

// Custom Hook para datos de la página
const useHomeData = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [contentBlocks, setContentBlocks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [productsData, contentData] = await Promise.all([
        ApiService.getArticulos({ destacado: 'true', limit: 4 }),
        ApiService.getContentBlocks()
      ]);

      setFeaturedProducts(productsData.results || productsData || []);

      const contentMap = {};
      (contentData.results || contentData || []).forEach(block => {
        contentMap[block.identificador] = block;
      });
      setContentBlocks(contentMap);
    } catch (error) {
      console.error('Error fetching home data:', error);
      setError('Error al cargar los datos. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { featuredProducts, contentBlocks, loading, error, refetch: fetchData };
};

// Componente de Loading mejorado
const LoadingSpinner = memo(() => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-pale-pink via-white to-brand-muted-mauve/30 relative overflow-hidden p-4">
    <div className="relative">
      <div className="animate-spin rounded-full h-24 w-24 md:h-32 md:w-32 border-4 border-t-transparent border-brand-deep-plum"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-primary animate-ping" />
      </div>
    </div>
    <div className="mt-6 text-center">
      <div className="flex space-x-1.5 justify-center mb-4">
        {[0, 1, 2].map((i) => (
          <div 
            key={i} 
            className="w-2.5 h-2.5 bg-brand-deep-plum rounded-full animate-bounce" 
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <p className="text-brand-charcoal-purple font-medium text-lg">
        Cargando tu experiencia...
      </p>
    </div>
  </div>
));

// Componente de Error
const ErrorDisplay = memo(({ error, onRetry }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
    <div className="text-center max-w-md">
      <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
      <h2 className="text-2xl font-bold text-red-800 mb-4">
        Oops! Algo salió mal
      </h2>
      <p className="text-red-600 mb-6">{error}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
      >
        <RefreshCw className="w-5 h-5" />
        Intentar Nuevamente
      </button>
    </div>
  </div>
));

// Componente de elementos flotantes de fondo
const FloatingBackground = memo(({ mousePosition, scrollY }) => (
  <div className="fixed inset-0 pointer-events-none -z-10">
    <div 
      className="absolute w-72 h-72 md:w-96 md:h-96 bg-brand-pale-pink/30 rounded-full blur-3xl opacity-50 will-change-transform"
      style={{
        transform: `translate3d(${mousePosition.x * 0.015}px, ${mousePosition.y * 0.015 - scrollY * 0.08}px, 0) rotate(${scrollY * 0.01}deg)`,
        top: '5%', 
        left: '5%', 
        transition: 'transform 0.2s ease-out'
      }}
    />
    <div 
      className="absolute w-60 h-60 md:w-80 md:h-80 bg-brand-deep-plum/20 rounded-full blur-3xl opacity-40 will-change-transform"
      style={{
        transform: `translate3d(${-mousePosition.x * 0.025}px, ${-mousePosition.y * 0.025 - scrollY * 0.04}px, 0) rotate(${-scrollY * 0.015}deg)`,
        bottom: '10%', 
        right: '8%', 
        transition: 'transform 0.2s ease-out'
      }}
    />
  </div>
));

// Componente de sección de bienvenida
const WelcomeSection = memo(({ welcomeBlock }) => {
  if (!welcomeBlock?.activo) return null;

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-brand-pale-pink/70 via-white to-brand-muted-mauve/20 relative overflow-hidden">
      <div className="container mx-auto px-4 text-center relative z-10">
        {welcomeBlock.imagen_asociada && (
          <div className="mb-8 transform hover:scale-105 transition-transform duration-500 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <img 
              src={welcomeBlock.imagen_asociada.startsWith('http') 
                ? welcomeBlock.imagen_asociada 
                : `http://localhost:8000${welcomeBlock.imagen_asociada}`} 
              alt={welcomeBlock.titulo || 'Banner de Bienvenida'}
              className="mx-auto rounded-2xl shadow-2xl max-h-72 md:max-h-96 hover:shadow-primary/30 transition-shadow duration-500"
              loading="lazy"
            />
          </div>
        )}
        
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-brand-deep-plum via-primary to-brand-dark-wine bg-clip-text text-transparent mb-6 leading-tight animate-fade-in-up" style={{animationDelay: '0.4s'}}>
          {welcomeBlock.titulo || "¡Bienvenido a DiegoJhoao.store!"}
        </h2>
        
        {welcomeBlock.contenido_html && (
          <div
            className="text-lg md:text-xl text-brand-charcoal-purple max-w-3xl mx-auto leading-relaxed prose lg:prose-xl mb-10 animate-fade-in-up"  
            style={{animationDelay: '0.6s'}}
            dangerouslySetInnerHTML={{ __html: welcomeBlock.contenido_html }}
          />
        )}
        
        {welcomeBlock.enlace_url && (
          <Link
            to={welcomeBlock.enlace_url.startsWith('/') ? welcomeBlock.enlace_url : '/productos'}
            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-primary to-brand-deep-plum hover:from-brand-deep-plum hover:to-brand-dark-wine text-brand-pale-pink px-8 py-3.5 md:px-10 md:py-4 rounded-xl text-base md:text-lg font-bold shadow-xl hover:shadow-primary/40 transform hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up" 
            style={{animationDelay: '0.8s'}}
          >
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 opacity-80 group-hover:opacity-100 transition-opacity" />
            {welcomeBlock.texto_enlace || "Descubre Más"}
            <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1.5 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700 rounded-xl"></div>
          </Link>
        )}
      </div>
    </section>
  );
});

// Componente de productos destacados
const FeaturedProducts = memo(({ products }) => {
  if (!products.length) return null;

  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-pale-pink/5 via-transparent to-brand-muted-mauve/5 -z-10"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-deep-plum/10 to-primary/10 px-5 py-2 rounded-full mb-4">
            <Star className="w-5 h-5 text-brand-deep-plum" />
            <span className="text-brand-deep-plum font-semibold text-sm">Selección Premium</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-brand-almost-black to-brand-charcoal-purple bg-clip-text text-transparent mb-4">
            Productos Destacados
          </h2>
          <p className="text-brand-charcoal-purple/90 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Cada producto ha sido cuidadosamente seleccionado para ofrecerte la mejor experiencia.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="transform hover:scale-[1.03] transition-all duration-500 ease-out animate-fade-in-up"
              style={{ 
                animationDelay: `${index * 150}ms`, 
                animationFillMode: 'backwards' 
              }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12 md:mt-16">
          <Link
            to="/productos"
            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-brand-almost-black to-brand-charcoal-purple hover:from-brand-charcoal-purple hover:to-brand-almost-black text-brand-pale-pink px-8 py-3.5 md:px-10 md:py-4 rounded-xl text-base md:text-lg font-bold shadow-xl hover:shadow-brand-charcoal-purple/40 transform hover:scale-105 hover:-translate-y-0.5 transition-all duration-300"
          >
            Ver Toda la Colección 
            <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1.5 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700 rounded-xl"></div>
          </Link>
        </div>
      </div>
    </section>
  );
});

// Componente de estadísticas
const StatsSection = memo(({ statsRef, hasAnimatedStats, animatedStats }) => {
  const statsData = useMemo(() => [
    { 
      keyName: "customers", 
      suffix: "K+", 
      label: "Clientes Felices", 
      icon: Users, 
      gradient: "from-brand-deep-plum to-primary" 
    },
    { 
      keyName: "products", 
      suffix: "+", 
      label: "Productos Únicos", 
      icon: ShoppingBag, 
      gradient: "from-primary to-brand-dark-wine" 
    },
    { 
      keyName: "satisfaction", 
      suffix: "%", 
      label: "Tasa de Satisfacción", 
      icon: Award, 
      gradient: "from-brand-dark-wine to-brand-almost-black" 
    }
  ], []);

  const formatStatValue = useCallback((stat) => {
    const value = animatedStats[stat.keyName];
    return stat.keyName === "customers" ? Math.floor(value / 1000) : value;
  }, [animatedStats]);

  return (
    <section 
      ref={statsRef}
      className="py-16 md:py-24 bg-gradient-to-r from-brand-charcoal-purple via-brand-almost-black to-brand-charcoal-purple relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'url("/img/geometric-pattern.svg")', 
        backgroundSize: '500px', 
        animation: 'float 20s linear infinite'
      }}></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-pale-pink mb-4 [text-shadow:_0_2px_4px_rgba(0,0,0,0.3)]">
            Números que Inspiran Confianza
          </h2>
          <p className="text-brand-muted-mauve/90 text-base md:text-lg max-w-2xl mx-auto">
            Cada cifra representa nuestro compromiso y la satisfacción de quienes nos eligen.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {statsData.map((stat, index) => (
            <div
              key={stat.keyName}
              className={`text-center group cursor-default transform transition-all duration-500 ease-out ${
                hasAnimatedStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className="relative inline-block mb-6">
                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br ${stat.gradient} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500 shadow-2xl group-hover:shadow-brand-deep-plum/30`}>
                  <stat.icon className="w-10 h-10 md:w-12 md:h-12 text-brand-pale-pink" />
                </div>
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-20 scale-125 group-hover:scale-150 transition-all duration-500 blur-lg -z-10`}></div>
              </div>
              
              <div className="text-4xl md:text-5xl font-bold text-brand-pale-pink mb-2 group-hover:text-white transition-colors duration-300 [text-shadow:_0_1px_3px_rgba(0,0,0,0.2)]">
                {formatStatValue(stat)}{stat.suffix}
              </div>
              
              <div className="text-brand-muted-mauve text-base md:text-lg font-semibold group-hover:text-brand-pale-pink transition-colors duration-300">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

// Componente de características
const FeaturesSection = memo(({ currentFeature }) => {
  const features = useMemo(() => [
    { 
      icon: Truck, 
      text: "Envío Confiable", 
      desc: "Recibe tus pedidos rápido y seguro donde estés.", 
      color: "from-brand-deep-plum to-primary" 
    },
    { 
      icon: Shield, 
      text: "Compra Segura", 
      desc: "Tu información protegida en cada transacción.", 
      color: "from-primary to-brand-dark-wine" 
    },
    { 
      icon: Heart, 
      text: "Calidad Premium", 
      desc: "Selección exclusiva para garantizar tu satisfacción.", 
      color: "from-brand-dark-wine to-brand-almost-black" 
    }
  ], []);

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-white via-brand-pale-pink/20 to-white relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-deep-plum/10 to-primary/10 px-5 py-2 rounded-full mb-4">
            <Zap className="w-5 h-5 text-brand-deep-plum" />
            <span className="text-brand-deep-plum font-semibold text-sm">Nuestra Promesa</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-brand-almost-black to-brand-charcoal-purple bg-clip-text text-transparent mb-4">
            ¿Por Qué Elegirnos?
          </h2>
          <p className="text-brand-charcoal-purple/90 text-base md:text-lg max-w-2xl mx-auto">
            Descubre las ventajas que nos hacen tu mejor opción para moda online.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`relative group cursor-pointer transform transition-all duration-500 ease-out hover:scale-[1.03] hover:-translate-y-1 ${
                index === currentFeature ? 'opacity-100 z-10' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <div className={`relative bg-white/80 backdrop-blur-md rounded-2xl md:rounded-3xl p-6 md:p-8 border transition-all duration-500 shadow-lg hover:shadow-2xl overflow-hidden
                              ${index === currentFeature ? 'border-primary shadow-primary/20 ring-2 ring-primary/60' : 'border-brand-pale-pink/30 hover:border-brand-deep-plum/40'}`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`}></div>
                
                <div className="relative z-10 text-center">
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 mx-auto transform group-hover:rotate-[8deg] group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-xl`}>
                    <feature.icon className="w-8 h-8 md:w-10 md:h-10 text-brand-pale-pink" />
                  </div>
                  <h3 className="font-bold text-xl md:text-2xl text-brand-almost-black mb-3 group-hover:text-primary transition-colors duration-300">
                    {feature.text}
                  </h3>
                  <p className="text-brand-charcoal-purple/90 text-sm leading-relaxed group-hover:text-brand-almost-black transition-colors duration-300">
                    {feature.desc}
                  </p>
                </div>
                
                <div className={`absolute bottom-0 left-0 h-1.5 bg-gradient-to-r ${feature.color} transition-all duration-500 ease-out ${index === currentFeature ? 'w-full' : 'w-0 group-hover:w-1/3'}`}></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 opacity-50 group-hover:opacity-100 rounded-3xl"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

// Componente de promoción
const PromoSection = memo(({ promoBlock }) => {
  if (!promoBlock?.activo) return null;

  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-primary via-brand-deep-plum to-brand-dark-wine relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'url("/img/texture-overlay.png")', 
        backgroundBlendMode: 'overlay'
      }}></div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        {promoBlock.imagen_asociada && (
          <div className="mb-8 transform hover:scale-105 transition-transform duration-500 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <img 
              src={promoBlock.imagen_asociada.startsWith('http') 
                ? promoBlock.imagen_asociada 
                : `http://localhost:8000${promoBlock.imagen_asociada}`} 
              alt={promoBlock.titulo || 'Promoción Especial'}
              className="mx-auto rounded-2xl shadow-2xl max-h-72 md:max-h-80 hover:shadow-brand-pale-pink/30 transition-shadow duration-500"
              loading="lazy"
            />
          </div>
        )}
        
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-pale-pink mb-6 leading-tight [text-shadow:_0_2px_5px_rgba(0,0,0,0.4)] animate-fade-in-up" style={{animationDelay: '0.4s'}}>
          {promoBlock.titulo || "¡Oferta Exclusiva!"}
        </h2>
        
        {promoBlock.contenido_html && (
          <div
            className="text-lg md:text-xl text-brand-muted-mauve/90 max-w-3xl mx-auto leading-relaxed prose prose-invert lg:prose-xl mb-10 animate-fade-in-up" 
            style={{animationDelay: '0.6s'}}
            dangerouslySetInnerHTML={{ __html: promoBlock.contenido_html }}
          />
        )}
        
        {promoBlock.enlace_url && (
          <Link
            to={promoBlock.enlace_url.startsWith('/') ? promoBlock.enlace_url : '/productos'}
            className="group relative inline-flex items-center gap-3 bg-brand-pale-pink hover:bg-white text-primary hover:text-brand-deep-plum px-8 py-3.5 md:px-10 md:py-4 rounded-xl text-base md:text-lg font-bold shadow-xl hover:shadow-brand-pale-pink/40 transform hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up" 
            style={{animationDelay: '0.8s'}}
          >
            <Zap className="w-5 h-5 md:w-6 md:h-6 opacity-80 group-hover:opacity-100 transition-opacity" />
            {promoBlock.texto_enlace || "Aprovechar Oferta"}
            <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1.5 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-deep-plum/5 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700 rounded-xl"></div>
          </Link>
        )}
      </div>
    </section>
  );
});

// Botón de scroll to top
const ScrollToTopButton = memo(({ showScrollTop, scrollToTop }) => {
  if (!showScrollTop) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-primary hover:bg-brand-deep-plum text-brand-pale-pink p-3 md:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 animate-bounce hover:animate-none focus:outline-none focus:ring-2 focus:ring-brand-pale-pink/50"
      aria-label="Volver arriba"
    >
      <ArrowUpCircle size={24} className="md:w-6 md:h-6"/>
    </button>
  );
});

// Componente principal mejorado
const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const statsRef = useRef(null);
  
  // Custom hooks
  const { featuredProducts, contentBlocks, loading, error, refetch } = useHomeData();
  const { scrollY, mousePosition, showScrollTop, scrollToTop } = usePageInteractions();
  const { hasAnimatedStats, animatedStats } = useStatsAnimation(statsRef);
  const currentFeature = useFeatureRotation(3);

  // Content blocks
  const welcomeBlock = contentBlocks['banner-bienvenida-home'];
  const promoBlock = contentBlocks['promocion-especial-home'];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} onRetry={refetch} />;

  return (
    <div className={`min-h-screen overflow-x-hidden relative ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}>
      <FloatingBackground mousePosition={mousePosition} scrollY={scrollY} />
      
      <CarouselComponent carouselName="principal" />
      
      <WelcomeSection welcomeBlock={welcomeBlock} />
      
      <FeaturedProducts products={featuredProducts} />
      
      <StatsSection 
        statsRef={statsRef} 
        hasAnimatedStats={hasAnimatedStats} 
        animatedStats={animatedStats} 
      />
      
      <FeaturesSection currentFeature={currentFeature} />
      
      <PromoSection promoBlock={promoBlock} />
      
      <ScrollToTopButton showScrollTop={showScrollTop} scrollToTop={scrollToTop} />
    </div>
  );
};

// Display names para debugging
LoadingSpinner.displayName = 'LoadingSpinner';
ErrorDisplay.displayName = 'ErrorDisplay';
FloatingBackground.displayName = 'FloatingBackground';
WelcomeSection.displayName = 'WelcomeSection';
FeaturedProducts.displayName = 'FeaturedProducts';
StatsSection.displayName = 'StatsSection';
FeaturesSection.displayName = 'FeaturesSection';
PromoSection.displayName = 'PromoSection';
ScrollToTopButton.displayName = 'ScrollToTopButton';

export default Home;