// pages/ProductDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Share2, ArrowLeft, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import ApiService from '../services/api';
import ProductCard from '../components/ProductCard';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const productData = await ApiService.getArticulo(id);
      setProduct(productData);

      // Fetch related products from the same category
      if (productData.categoria) {
        const relatedData = await ApiService.getArticulos({
          categoria: productData.categoria,
          activo: true,
          limit: 4
        });
        const filtered = (relatedData.results || relatedData).filter(p => p.id !== parseInt(id));
        setRelatedProducts(filtered.slice(0, 4));
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setQuantity(1);
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(price);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.nombre,
        text: product.descripcion,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Producto no encontrado</h2>
          <Link to="/productos" className="text-blue-600 hover:text-blue-800 underline">
            Volver a productos
          </Link>
        </div>
      </div>
    );
  }

  // Mock images array - in real app you'd get this from product.imagenes_galeria
  const images = [
    product.imagen_principal,
    // Add more images here when you implement the gallery
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600">Inicio</Link>
            <span>/</span>
            <Link to="/productos" className="hover:text-blue-600">Productos</Link>
            {product.categoria_nombre && (
              <>
                <span>/</span>
                <Link 
                  to={`/productos/categoria/${product.categoria}`}
                  className="hover:text-blue-600"
                >
                  {product.categoria_nombre}
                </Link>
              </>
            )}
            <span>/</span>
            <span>{product.nombre}</span>
          </div>
        </nav>

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={20} />
          Volver
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={images[selectedImage] || '/api/placeholder/500/500'}
                  alt={product.nombre}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-blue-600' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.nombre} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {product.nombre}
                </h1>
                
                {product.categoria_nombre && (
                  <Link
                    to={`/productos/categoria/${product.categoria}`}
                    className="inline-block text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {product.categoria_nombre}
                  </Link>
                )}

                {product.sku && (
                  <p className="text-gray-500 text-sm mt-1">
                    SKU: {product.sku}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-4xl font-bold text-blue-600">
                  {formatPrice(product.precio)}
                </span>
                
                {product.destacado && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Destacado
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  product.stock > 10 ? 'bg-green-500' : 
                  product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className={`font-medium ${
                  product.stock > 10 ? 'text-green-600' : 
                  product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {product.stock === 0 ? 'Agotado' : 
                   product.stock <= 5 ? `Solo quedan ${product.stock}` : 
                   'En stock'}
                </span>
              </div>

              {/* Description */}
              {product.descripcion && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Descripción</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.descripcion}
                  </p>
                </div>
              )}

              {/* Quantity and Add to Cart */}
              {product.stock > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">Cantidad:</span>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-4 py-2 font-medium min-w-[60px] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.stock}
                        className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
                    >
                      <ShoppingCart size={20} />
                      <span>Agregar al Carrito</span>
                    </button>
                    
                    <button
                      onClick={handleShare}
                      className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Compartir"
                    >
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>
              )}

              {product.stock === 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 font-medium">
                    Este producto está agotado actualmente.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">
              Productos Relacionados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;