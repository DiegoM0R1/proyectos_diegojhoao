// pages/Products.js
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Filter, Grid, List, SortAsc } from 'lucide-react';
import ApiService from '../services/api';
import ProductCard from '../components/ProductCard';

const Products = () => {
  const { categoriaId } = useParams();
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('search');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(categoriaId || '');
  const [sortBy, setSortBy] = useState('name');
  const [filterActive, setFilterActive] = useState(true);
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [categoriaId, searchTerm, selectedCategory, sortBy, filterActive, filterFeatured]);

  const fetchCategories = async () => {
    try {
      const data = await ApiService.getCategorias();
      setCategories(data.results || data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      
      if (categoriaId) {
        params.categoria = categoriaId;
      } else if (selectedCategory) {
        params.categoria = selectedCategory;
      }
      
      if (filterActive) {
        params.activo = true;
      }
      
      if (filterFeatured) {
        params.destacado = true;
      }

      const data = await ApiService.getArticulos(params);
      let productsData = data.results || data;

      // Filter by search term if provided
      if (searchTerm) {
        productsData = productsData.filter(product =>
          product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.descripcion && product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      // Sort products
      productsData = sortProducts(productsData, sortBy);
      
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortProducts = (products, sortType) => {
    const sorted = [...products];
    
    switch (sortType) {
      case 'name':
        return sorted.sort((a, b) => a.nombre.localeCompare(b.nombre));
      case 'price-low':
        return sorted.sort((a, b) => a.precio - b.precio);
      case 'price-high':
        return sorted.sort((a, b) => b.precio - a.precio);
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'featured':
        return sorted.sort((a, b) => b.destacado - a.destacado);
      default:
        return sorted;
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setFilterActive(true);
    setFilterFeatured(false);
    setSortBy('name');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const selectedCategoryName = categories.find(cat => cat.id.toString() === selectedCategory)?.nombre;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {searchTerm ? `Resultados para "${searchTerm}"` : 
             selectedCategoryName ? selectedCategoryName : 'Todos los Productos'}
          </h1>
          <p className="text-gray-600">
            {products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Filtros</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Limpiar todo
                </button>
              </div>

              {/* Categories Filter */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Categorías</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={selectedCategory === ''}
                      onChange={() => handleCategoryChange('')}
                      className="mr-2"
                    />
                    Todas las categorías
                  </label>
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category.id}
                        checked={selectedCategory === category.id.toString()}
                        onChange={() => handleCategoryChange(category.id.toString())}
                        className="mr-2"
                      />
                      {category.nombre}
                    </label>
                  ))}
                </div>
              </div>

              {/* Status Filters */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Estado</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filterActive}
                      onChange={(e) => setFilterActive(e.target.checked)}
                      className="mr-2"
                    />
                    Solo productos activos
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filterFeatured}
                      onChange={(e) => setFilterFeatured(e.target.checked)}
                      className="mr-2"
                    />
                    Solo productos destacados
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Left side */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Filter size={16} />
                    Filtros
                  </button>

                  {/* View Mode Toggle */}
                  <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                      <Grid size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>

                {/* Right side - Sort */}
                <div className="flex items-center gap-2">
                  <SortAsc size={16} className="text-gray-600" />
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="name">Nombre A-Z</option>
                    <option value="price-low">Precio: Menor a Mayor</option>
                    <option value="price-high">Precio: Mayor a Menor</option>
                    <option value="newest">Más Recientes</option>
                    <option value="featured">Destacados Primero</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No se encontraron productos</p>
                {(searchTerm || selectedCategory) && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-blue-600 hover:text-blue-800 underline"
                  >
                    Ver todos los productos
                  </button>
                )}
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {products.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;