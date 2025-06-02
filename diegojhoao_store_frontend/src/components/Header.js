// src/components/Header.js
import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom'; // NavLink para estilos activos
import { ShoppingCart, Menu, X, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import ApiService from '../services/api';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categorias, setCategorias] = useState([]); // Lo mantenemos por si quieres un dropdown de categorías
  const [navigationLinks, setNavigationLinks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { getCartItemsCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriasData, navLinksData] = await Promise.all([
          ApiService.getCategorias(),
          ApiService.getNavigationLinks('header') // Solo enlaces para 'header'
        ]);
        // Asegurarse de que siempre sea un array para .map()
        setCategorias(categoriasData?.results || categoriasData || []);
        setNavigationLinks(navLinksData?.results || navLinksData || []);
      } catch (error) {
        console.error('Error fetching header data:', error);
        setCategorias([]); // En caso de error, un array vacío
        setNavigationLinks([]); // En caso de error, un array vacío
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/productos?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setIsMenuOpen(false);
    }
  };

  // Subcomponente para los items de navegación para reutilizar estilos
  const NavItemRenderer = ({ to, children, isExternal = false, target = "_self", linkClassName }) => {
    const baseClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out";
    const activeClass = "bg-brand-deep-plum text-white"; // Tu 'secondary' o 'brand-deep-plum'
    const inactiveClass = "text-brand-pale-pink hover:bg-brand-muted-mauve hover:text-white"; // Colores de tu paleta

    if (isExternal) {
      return (
        <a href={to} target={target} rel={target === "_blank" ? "noopener noreferrer" : ""} className={`${baseClasses} ${inactiveClass} ${linkClassName || ''}`}>
          {children}
        </a>
      );
    }
    return (
      <NavLink
        to={to}
        target={target}
        className={({ isActive }) => `${baseClasses} ${isActive ? activeClass : inactiveClass} ${linkClassName || ''}`}
        onClick={() => setIsMenuOpen(false)}
      >
        {children}
      </NavLink>
    );
  };
  
  const CartLinkRenderer = () => (
     <NavLink
      to="/carrito"
      className={({ isActive }) =>
        "relative p-2 transition-colors " +
        (isActive ? "text-white" : "text-brand-muted-mauve hover:text-brand-pale-pink") // Colores de tu paleta
      }
      onClick={() => setIsMenuOpen(false)}
      aria-label="Carrito de compras"
    >
      <ShoppingCart size={24} />
      {getCartItemsCount() > 0 && (
        <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse"> {/* 'accent' de tu paleta */}
          {getCartItemsCount()}
        </span>
      )}
    </NavLink>
  );

  return (
    <header className="bg-primary shadow-lg sticky top-0 z-50"> {/* Usando tu color 'primary' */}
      <div className="bg-brand-almost-black text-brand-muted-mauve py-1.5">
        <div className="container mx-auto px-4 text-center text-xs sm:text-sm">
          <p>🚚 ¡Envío gratis en pedidos mayores a S/100! ✨</p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex-shrink-0" onClick={() => setIsMenuOpen(false)}>
            <h1 className="text-2xl md:text-3xl font-bold text-brand-pale-pink hover:text-brand-muted-mauve transition-colors">
              DiegoJhoao<span className="text-secondary">.store</span> {/* Usando 'secondary' */}
            </h1>
          </Link>

          <nav className="hidden md:flex items-center space-x-2 lg:space-x-3">
            <ul className="flex items-center space-x-2 lg:space-x-3">
              {/* Enlaces dinámicos adicionales */}
              {navigationLinks.map((link) => (
                <li key={link.id}>
                  <NavItemRenderer 
                    to={link.url_o_ruta} 
                    isExternal={!link.url_o_ruta.startsWith('/')}
                    target={link.abrir_en_nueva_pestana ? "_blank" : "_self"}
                  >
                    {link.texto_del_enlace}
                  </NavItemRenderer>
                </li>
              ))}
            </ul>
            {/* Barra de búsqueda */}
            <form onSubmit={handleSearch} className="relative ml-3">
              <input
                type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="w-32 lg:w-48 px-3 py-2 text-xs text-brand-almost-black bg-brand-pale-pink/80 border-transparent rounded-md focus:outline-none focus:ring-1 focus:ring-secondary focus:bg-white placeholder-brand-charcoal-purple/70"
              />
              <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-brand-muted-mauve hover:text-secondary">
                <Search size={16} />
              </button>
            </form>
          </nav>

          <div className="flex items-center space-x-2">
            <div className="hidden md:block"><CartLinkRenderer /></div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-brand-pale-pink hover:text-white hover:bg-secondary rounded-md"
              aria-label="Abrir menú"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-primary border-t border-brand-charcoal-purple shadow-lg pb-3">
          <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            
            {navigationLinks.map((link) => (
              <NavItemRenderer 
                key={link.id}
                to={link.url_o_ruta} 
                isExternal={!link.url_o_ruta.startsWith('/')}
                target={link.abrir_en_nueva_pestana ? "_blank" : "_self"}
              >
                {link.texto_del_enlace}
              </NavItemRenderer>
            ))}
          </nav>
          <div className="pt-4 pb-3 border-t border-brand-charcoal-purple">
            <div className="px-4 mb-3">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar productos..."
                  className="w-full px-4 py-2.5 text-sm text-brand-almost-black bg-brand-pale-pink/90 border-transparent rounded-lg focus:outline-none focus:ring-1 focus:ring-secondary focus:bg-white placeholder-brand-charcoal-purple"
                />
                <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brand-muted-mauve hover:text-secondary">
                  <Search size={20} />
                </button>
              </form>
            </div>
            <div className="px-2 flex justify-center"> {/* Centra el ícono del carrito en móvil */}
              <CartLinkRenderer />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
