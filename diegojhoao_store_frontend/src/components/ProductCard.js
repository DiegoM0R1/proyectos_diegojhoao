// src/components/ProductCard.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Importa useNavigate
import { ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate(); // Hook para navegación programática

  const handleAddToCart = (e) => {
    // Detiene la propagación para que si este botón está DENTRO de un Link (aunque no debería), no active el Link.
    // En esta estructura corregida, no es estrictamente necesario, pero es buena práctica para botones de acción.
    e.stopPropagation(); 
    e.preventDefault(); // Previene cualquier comportamiento por defecto si el botón estuviera en un form, etc.
    addToCart(product);
    alert(`${product.nombre} añadido al carrito`); // O una notificación más elegante
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(price);
  };

  // Navegar al detalle del producto cuando se hace clic en el botón de "Ver detalles"
  const handleViewDetails = (e) => {
    e.stopPropagation();
    e.preventDefault();
    navigate(`/producto/${product.id}`);
  };
  
  const imageUrl = product.imagen_principal 
    ? (product.imagen_principal.startsWith('http') ? product.imagen_principal : `http://localhost:8000${product.imagen_principal}`) 
    : '/img/placeholder-image.png'; // Asegúrate de tener este placeholder en public/img/

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 group flex flex-col overflow-hidden border border-transparent hover:border-brand-deep-plum/30">
      {/* La imagen y el nombre del producto son los enlaces principales al detalle */}
      <Link to={`/producto/${product.id}`} className="block group/image relative">
        <div className="aspect-square overflow-hidden"> {/* Ratio de aspecto para la imagen */}
          <img
            src={imageUrl}
            alt={product.nombre}
            className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-500 ease-out"
            onError={(e) => { e.target.onerror = null; e.target.src='/img/placeholder-image.png'; }}
          />
        </div>
        {/* Badges */}
        <div className="absolute top-2 left-2 space-y-1">
            {product.destacado && (
            <span className="block bg-accent text-white px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm">
                Destacado
            </span>
            )}
            {product.stock <= 5 && product.stock > 0 && (
            <span className="block bg-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm">
                ¡Últimas {product.stock}!
            </span>
            )}
            {product.stock === 0 && (
            <span className="block bg-brand-charcoal-purple text-brand-pale-pink px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm">
                Agotado
            </span>
            )}
        </div>

        {/* Overlay con acciones - NO es un Link aquí */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/image:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover/image:opacity-100 space-x-2">
          {/* El botón de "Ver Detalles" ahora usa navigate */}
          <button
            onClick={handleViewDetails} // Usa la función que navega con useNavigate()
            className="p-2.5 bg-white/90 hover:bg-primary hover:text-white text-primary rounded-full shadow-lg transform hover:scale-110 transition-all"
            title="Ver detalles"
          >
            <Eye size={20} />
          </button>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`p-2.5 rounded-full shadow-lg transform hover:scale-110 transition-all ${
              product.stock === 0
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-white/90 hover:bg-primary hover:text-white text-primary'
            }`}
            title={product.stock === 0 ? 'Producto agotado' : 'Agregar al carrito'}
          >
            <ShoppingCart size={20} />
          </button>
        </div>
      </Link>

      {/* Información del producto debajo de la imagen */}
      <div className="p-4 md:p-5 flex flex-col flex-grow">
        {product.categoria_nombre && (
          <p className="text-xs text-brand-muted-mauve mb-1 uppercase tracking-wider">
            {product.categoria_nombre}
          </p>
        )}
        <Link to={`/producto/${product.id}`} className="block">
            <h3 className="text-base md:text-lg font-semibold text-brand-almost-black hover:text-primary transition-colors mb-2 line-clamp-2 leading-tight" title={product.nombre}>
            {product.nombre}
            </h3>
        </Link>
        
        {/* <p className="text-gray-600 text-xs mt-1 mb-2 line-clamp-2 flex-grow">
            {product.descripcion}
        </p> */}

        <div className="mt-auto"> {/* Empuja el precio y stock al final de esta sección de texto */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-lg md:text-xl font-bold text-primary">
                {formatPrice(product.precio)}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    product.stock === 0 ? 'bg-red-100 text-red-700' : 
                    product.stock < 10 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                }`}>
                Stock: {product.stock}
                </span>
            </div>

            {/* Botón de Añadir al carrito (opcional aquí si ya está en el hover de la imagen) */}
            {/* Si lo pones aquí, asegúrate que no esté dentro de un Link */}
            {/* <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`w-full mt-2 text-sm font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                product.stock === 0
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : 'bg-primary hover:bg-brand-deep-plum text-white shadow-md hover:shadow-lg transform hover:scale-[1.02]'
                }`}
            >
                <ShoppingCart size={16} />
                {product.stock === 0 ? 'Agotado' : 'Añadir al Carrito'}
            </button>
            */}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

