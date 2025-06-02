// src/App.js
import React from 'react'; // Asumiendo que ya limpiaste useState/useEffect si no se usan aquí
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/Home'; // Asegúrate que el nombre del archivo sea HomePage.js
import ProductsPage from './pages/Products'; // Asegúrate que el nombre sea ProductsPage.js o Products.js
import ProductDetailPage from './pages/ProductDetail';// Asegúrate que el nombre sea ProductDetailPage.js o ProductDetail.js
import CartPage from './pages/Cart'; // Asegúrate que el nombre sea CartPage.js o Cart.js
import { CartProvider } from './context/CartContext';
// import './App.css'; // Puedes comentar esto si todos tus estilos vienen de Tailwind y src/index.css

function App() {
  return (
    <CartProvider>
      <Router>
        {/* Aplicando tu color de fondo personalizado y flex para el layout */}
        <div className="min-h-screen flex flex-col bg-brand-pale-pink text-brand-almost-black"> {/* O usa bg-background-light */}
          <Header />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/productos" element={<ProductsPage />} />
              <Route path="/productos/categoria/:categoriaSlug" element={<ProductsPage />} />
              <Route path="/producto/:id" element={<ProductDetailPage />} />
              <Route path="/carrito" element={<CartPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
