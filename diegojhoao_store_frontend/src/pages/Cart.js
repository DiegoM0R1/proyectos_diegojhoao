// src/pages/Cart.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, MessageCircle } from 'lucide-react'; 
import { useCart } from '../context/CartContext';

const Cart = () => {
  // En tu CartContext.js, la función se llama getCartItemsCount
  // y los items están en state.items. Aquí usamos directamente 'items'.
  const { 
    items, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getCartTotal,
    getCartItemsCount // Asegúrate que este sea el nombre correcto de la función en tu CartContext
  } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN' // Soles Peruanos
    }).format(price);
  };

  // Simplificamos handleQuantityChange: updateQuantity en el contexto ya maneja la eliminación si es 0.
  const handleQuantityChange = (productId, newQuantity) => {
    const quantityNum = parseInt(newQuantity, 10);
    // Permite que el input quede temporalmente vacío mientras se escribe,
    // pero solo actualiza el contexto si es un número válido o 0.
    // El onBlur se encargará de resetear a 1 si se deja vacío.
    if (!isNaN(quantityNum) && quantityNum >= 0) {
      updateQuantity(productId, quantityNum);
    } else if (newQuantity === '') {
      // No hacemos nada aquí, esperamos a onBlur o a que se ingrese un número
    }
  };

  const handleQuantityBlur = (productId, currentInputValue, originalQuantity) => {
    if (currentInputValue === '') {
      updateQuantity(productId, originalQuantity > 0 ? originalQuantity : 1); // Vuelve a la cantidad original o 1 si se deja vacío
    } else {
      const quantityNum = parseInt(currentInputValue, 10);
      if (isNaN(quantityNum) || quantityNum <= 0) {
        updateQuantity(productId, 0); // Esto eliminará el item via el reducer
      }
    }
  };


  const generateWhatsAppMessage = () => {
    const orderDetails = items.map(item => 
      `• ${item.nombre} (${item.marca || ''} ${item.talla || ''} ${item.color || ''}) - Cantidad: ${item.quantity} - Subtotal: ${formatPrice(parseFloat(item.precio) * item.quantity)}`
    ).join('\n');

    const total = formatPrice(getCartTotal()); // getCartTotal ya es un número
    
    const message = `¡Hola ${process.env.REACT_APP_STORE_NAME || 'DiegoJhoao Store'}! Quisiera realizar el siguiente pedido:

${orderDetails}

*Total del Pedido: ${total}*

Por favor, confírmame la disponibilidad, detalles de pago y opciones de entrega.

¡Gracias!`;

    return encodeURIComponent(message);
  };

  const handleWhatsAppOrder = () => {
    // **IMPORTANTE: Reemplaza con tu número de WhatsApp real y asegúrate que esté configurado como variable de entorno**
    const phoneNumber = process.env.REACT_APP_WHATSAPP_NUMBER || "51917277552"; 
    const placeholderNumber = "TU_NUMERO_DE_WHATSAPP_AQUI"; // Un placeholder para comparación

    if (!phoneNumber || phoneNumber === placeholderNumber || phoneNumber.includes("X")) {
        alert("Número de WhatsApp no configurado. Por favor, contacta al administrador de la tienda.");
        console.error("Error: El número de WhatsApp no está configurado correctamente. Revisa las variables de entorno o el código.");
        return;
    }
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    // Considera vaciar el carrito después de enviar a WhatsApp:
    // clearCart();
    // O redirigir a una página de "pedido enviado"
  };

  if (items.length === 0) { // O getCartItemsCount() === 0, si prefieres sumar cantidades
    return (
      <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center bg-slate-50 py-12 px-4 text-center">
        <ShoppingBag size={64} className="text-slate-400 mb-6 animate-bounce" />
        <h1 className="text-3xl font-bold text-slate-700 mb-4">
          Tu carrito está vacío
        </h1>
        <p className="text-slate-500 mb-8 max-w-md">
          ¡No dejes que se quede así! Explora nuestros productos y encuentra algo que te encante.
        </p>
        <Link
          to="/productos"
          className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg transform hover:scale-105"
        >
          Explorar Productos
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-8 md:mb-10 text-center">
            Mi Carrito de Compras
          </h1>

          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            {/* Encabezados de la tabla (visibles en pantallas más grandes) */}
            <div className="hidden md:grid grid-cols-6 gap-4 items-center px-6 py-4 border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
              <div className="col-span-2">Producto</div>
              <div className="text-center">Precio</div>
              <div className="text-center">Cantidad</div>
              <div className="text-right">Subtotal</div>
              <div className="text-right">Acción</div>
            </div>

            {/* Items del carrito */}
            <div className="divide-y divide-slate-200">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center px-6 py-4 hover:bg-slate-50/50 transition-colors">
                  {/* Producto Info (Imagen y Nombre) */}
                  <div className="md:col-span-2 flex items-center gap-4">
                    <Link to={`/producto/${item.id}`} className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                      <img
                        src={item.imagen_principal 
                             ? (item.imagen_principal.startsWith('http') ? item.imagen_principal : `http://localhost:8000${item.imagen_principal}`) 
                             : '/img/placeholder-image.png'} // Ten un placeholder en tu carpeta public/img
                        alt={item.nombre}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src='/img/placeholder-image.png'; }} // Fallback si la imagen no carga
                      />
                    </Link>
                    <div>
                      <Link to={`/producto/${item.id}`} className="block text-sm md:text-base font-semibold text-slate-700 hover:text-blue-600 transition-colors">
                        {item.nombre}
                      </Link>
                      {/* Podrías añadir más detalles como talla o color si los tienes en 'item' */}
                      <p className="text-xs text-slate-500">{item.sku || `ID: ${item.id}`}</p>
                    </div>
                  </div>

                  {/* Precio Unitario */}
                  <div className="text-sm text-slate-600 text-center">
                    <span className="md:hidden font-medium mr-2">Precio:</span>
                    {formatPrice(parseFloat(item.precio))}
                  </div>

                  {/* Cantidad */}
                  <div className="flex items-center justify-center my-2 md:my-0">
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 rounded-full hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={item.quantity <= 1} // Deshabilita si la cantidad es 1 (ya que 0 lo elimina)
                    >
                      <Minus size={18} />
                    </button>
                    <input
                      type="text"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      onBlur={(e) => handleQuantityBlur(item.id, e.target.value, item.quantity)}
                      className="w-12 text-center mx-1 border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm p-1.5"
                    />
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 rounded-full hover:bg-slate-200 transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-sm font-semibold text-slate-800 text-right">
                    <span className="md:hidden font-medium mr-2">Subtotal:</span>
                    {formatPrice(parseFloat(item.precio) * item.quantity)}
                  </div>

                  {/* Botón Eliminar */}
                  <div className="text-right">
                    <button 
                      onClick={() => removeFromCart(item.id)} 
                      title="Eliminar artículo"
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen del Carrito y Acciones */}
          <div className="mt-8 md:mt-10 p-6 bg-white rounded-xl shadow-xl">
            <div className="flex justify-between items-center mb-4 text-lg">
              <p className="text-slate-600">Subtotal ({getCartItemsCount()} productos):</p>
              <p className="font-semibold text-slate-800">{formatPrice(getCartTotal())}</p>
            </div>
            {/* Aquí podrías añadir descuentos, costos de envío, etc. */}
            <div className="flex justify-between items-center text-xl md:text-2xl font-bold text-slate-800 border-t-2 border-blue-500 pt-4 mt-4">
              <p>TOTAL A PAGAR:</p>
              <p>{formatPrice(getCartTotal())}</p>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3 md:gap-4">
              <button
                onClick={clearCart}
                disabled={items.length === 0}
                className="px-6 py-3 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Vaciar Carrito
              </button>
              <button
                onClick={handleWhatsAppOrder}
                disabled={items.length === 0}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors text-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageCircle size={20} /> {/* Reemplacé ShoppingBag con un icono más apropiado */}
                Pagar por WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;