// src/components/Footer.js
import React from 'react';
// import { Link } from 'react-router-dom'; // Si usas DynamicNavLinks con rutas internas
// import { Facebook, Instagram, Twitter } from 'lucide-react'; // Ejemplo de iconos

// Asumiendo que DynamicNavLinks está definido como en Header.js o App.js si se centraliza
// O puedes tener enlaces estáticos o una estructura diferente aquí.

const Footer = () => {
  return (
    <footer className="bg-brand-almost-black text-brand-muted-mauve mt-auto"> {/* Usando tu paleta */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8">
          {/* Columna 1: Sobre la tienda */}
          <div>
            <h3 className="text-lg font-semibold text-brand-pale-pink mb-4">
              DiegoJhoao<span className="text-brand-deep-plum">.store</span>
            </h3>
            <p className="text-sm leading-relaxed">
              Tu tienda de moda online con los mejores estilos y tendencias. Calidad y diseño a tu alcance.
            </p>
          </div>

          {/* Columna 2: Enlaces Rápidos (ejemplo, podrías usar DynamicNavLinks) */}
          <div>
            <h3 className="text-sm font-semibold text-brand-pale-pink uppercase tracking-wider mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li><a href="/productos" className="text-sm hover:text-brand-pale-pink transition-colors">Todos los Productos</a></li>
              <li><a href="/ofertas" className="text-sm hover:text-brand-pale-pink transition-colors">Ofertas</a></li>
              <li><a href="/contacto" className="text-sm hover:text-brand-pale-pink transition-colors">Contacto</a></li>
              <li><a href="/faq" className="text-sm hover:text-brand-pale-pink transition-colors">Preguntas Frecuentes</a></li>
            </ul>
          </div>

          {/* Columna 3: Información Legal (ejemplo) */}
          <div>
            <h3 className="text-sm font-semibold text-brand-pale-pink uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="/terminos" className="text-sm hover:text-brand-pale-pink transition-colors">Términos y Condiciones</a></li>
              <li><a href="/privacidad" className="text-sm hover:text-brand-pale-pink transition-colors">Política de Privacidad</a></li>
              <li><a href="/envios" className="text-sm hover:text-brand-pale-pink transition-colors">Política de Envíos</a></li>
            </ul>
          </div>
          
          {/* Columna 4: Redes Sociales */}
          <div>
            <h3 className="text-sm font-semibold text-brand-pale-pink uppercase tracking-wider mb-4">Síguenos</h3>
            <div className="flex space-x-4">
              {/* Reemplaza # con tus URLs reales y considera usar iconos */}
              <a href="#" aria-label="Facebook" className="hover:text-brand-pale-pink transition-colors">
                {/* <Facebook size={20} /> */} F
              </a>
              <a href="#" aria-label="Instagram" className="hover:text-brand-pale-pink transition-colors">
                {/* <Instagram size={20} /> */} I
              </a>
              <a href="#" aria-label="Twitter" className="hover:text-brand-pale-pink transition-colors">
                {/* <Twitter size={20} /> */} T
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-brand-charcoal-purple pt-8 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} DiegoJhoao.store. Todos los derechos reservados.
          </p>
          <p className="mt-1">
            Diseñado con ❤️ por Diego Jhoao.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
