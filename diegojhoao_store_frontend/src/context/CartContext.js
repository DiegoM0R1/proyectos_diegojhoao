import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';

// Constantes para acciones y configuración
const CART_ACTIONS = {
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  APPLY_DISCOUNT: 'APPLY_DISCOUNT',
  REMOVE_DISCOUNT: 'REMOVE_DISCOUNT',
  UPDATE_ITEM_DETAILS: 'UPDATE_ITEM_DETAILS'
};

const CART_CONFIG = {
  MAX_QUANTITY_PER_ITEM: 99,
  MAX_ITEMS_IN_CART: 50,
  STORAGE_KEY: 'diegojhoao_cart',
  AUTO_SAVE_DELAY: 500 // ms
};

// Estado inicial del carrito
const initialState = {
  items: [],
  loading: false,
  error: null,
  discount: null, // { code, percentage, amount }
  lastUpdated: null,
  metadata: {
    currency: 'USD',
    version: '1.0'
  }
};

// Utilidades
const createCartItem = (product, quantity = 1, options = {}) => ({
  id: product.id,
  nombre: product.nombre,
  precio: parseFloat(product.precio),
  imagen_principal: product.imagen_principal,
  sku: product.sku,
  stock: product.stock || 0,
  categoria: product.categoria,
  quantity: Math.min(quantity, product.stock || CART_CONFIG.MAX_QUANTITY_PER_ITEM),
  addedAt: new Date().toISOString(),
  options: options // Para variaciones como talla, color, etc.
});

const validateCartItem = (item, product = null) => {
  const errors = [];
  
  if (!item.id || !item.nombre || item.precio === undefined) {
    errors.push('Datos de producto incompletos');
  }
  
  if (item.quantity <= 0) {
    errors.push('La cantidad debe ser mayor a 0');
  }
  
  if (item.quantity > CART_CONFIG.MAX_QUANTITY_PER_ITEM) {
    errors.push(`Cantidad máxima: ${CART_CONFIG.MAX_QUANTITY_PER_ITEM}`);
  }
  
  if (product && item.quantity > product.stock) {
    errors.push(`Stock insuficiente. Disponible: ${product.stock}`);
  }
  
  return errors;
};

// Reducer mejorado con validaciones y manejo de errores
const cartReducer = (state, action) => {
  try {
    switch (action.type) {
      case CART_ACTIONS.SET_LOADING:
        return {
          ...state,
          loading: action.payload,
          error: action.payload ? null : state.error
        };

      case CART_ACTIONS.SET_ERROR:
        return {
          ...state,
          loading: false,
          error: action.payload
        };

      case CART_ACTIONS.CLEAR_ERROR:
        return {
          ...state,
          error: null
        };

      case CART_ACTIONS.ADD_TO_CART: {
        const { product, quantity = 1, options = {} } = action.payload;
        
        // Validar límites del carrito
        if (state.items.length >= CART_CONFIG.MAX_ITEMS_IN_CART) {
          return {
            ...state,
            error: `Máximo ${CART_CONFIG.MAX_ITEMS_IN_CART} productos en el carrito`
          };
        }

        // Crear clave única para el item (id + opciones)
        const itemKey = `${product.id}_${JSON.stringify(options)}`;
        const existingItemIndex = state.items.findIndex(item => 
          `${item.id}_${JSON.stringify(item.options)}` === itemKey
        );

        let newItems;
        
        if (existingItemIndex !== -1) {
          // Actualizar cantidad del item existente
          const existingItem = state.items[existingItemIndex];
          const newQuantity = Math.min(
            existingItem.quantity + quantity,
            product.stock || CART_CONFIG.MAX_QUANTITY_PER_ITEM
          );
          
          newItems = state.items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: newQuantity, lastUpdated: new Date().toISOString() }
              : item
          );
        } else {
          // Añadir nuevo item
          const newItem = createCartItem(product, quantity, options);
          const validationErrors = validateCartItem(newItem, product);
          
          if (validationErrors.length > 0) {
            return {
              ...state,
              error: validationErrors.join(', ')
            };
          }
          
          newItems = [...state.items, newItem];
        }

        return {
          ...state,
          items: newItems,
          lastUpdated: new Date().toISOString(),
          error: null
        };
      }

      case CART_ACTIONS.REMOVE_FROM_CART:
        return {
          ...state,
          items: state.items.filter(item => {
            const { id, options = {} } = action.payload;
            const itemKey = `${item.id}_${JSON.stringify(item.options)}`;
            const targetKey = `${id}_${JSON.stringify(options)}`;
            return itemKey !== targetKey;
          }),
          lastUpdated: new Date().toISOString(),
          error: null
        };

      case CART_ACTIONS.UPDATE_QUANTITY: {
        const { id, quantity, options = {} } = action.payload;
        const itemKey = `${id}_${JSON.stringify(options)}`;
        
        const newItems = state.items.map(item => {
          const currentItemKey = `${item.id}_${JSON.stringify(item.options)}`;
          if (currentItemKey === itemKey) {
            const validationErrors = validateCartItem({ ...item, quantity });
            if (validationErrors.length > 0) {
              throw new Error(validationErrors.join(', '));
            }
            return {
              ...item,
              quantity: Math.max(0, Math.min(quantity, CART_CONFIG.MAX_QUANTITY_PER_ITEM)),
              lastUpdated: new Date().toISOString()
            };
          }
          return item;
        }).filter(item => item.quantity > 0);

        return {
          ...state,
          items: newItems,
          lastUpdated: new Date().toISOString(),
          error: null
        };
      }

      case CART_ACTIONS.CLEAR_CART:
        return {
          ...state,
          items: [],
          discount: null,
          lastUpdated: new Date().toISOString(),
          error: null
        };

      case CART_ACTIONS.LOAD_CART:
        // Validar datos cargados
        const loadedItems = Array.isArray(action.payload) ? action.payload : [];
        const validItems = loadedItems.filter(item => {
          const errors = validateCartItem(item);
          return errors.length === 0;
        });

        return {
          ...state,
          items: validItems,
          lastUpdated: new Date().toISOString(),
          error: validItems.length !== loadedItems.length 
            ? 'Algunos productos fueron removidos por datos inválidos' 
            : null
        };

      case CART_ACTIONS.APPLY_DISCOUNT:
        return {
          ...state,
          discount: action.payload,
          error: null
        };

      case CART_ACTIONS.REMOVE_DISCOUNT:
        return {
          ...state,
          discount: null
        };

      case CART_ACTIONS.UPDATE_ITEM_DETAILS: {
        // Para actualizar detalles del producto (precio, stock, etc.) desde la API
        const { id, updates } = action.payload;
        
        const newItems = state.items.map(item =>
          item.id === id
            ? { ...item, ...updates, lastUpdated: new Date().toISOString() }
            : item
        );

        return {
          ...state,
          items: newItems,
          lastUpdated: new Date().toISOString()
        };
      }

      default:
        return state;
    }
  } catch (error) {
    console.error('Error en cartReducer:', error);
    return {
      ...state,
      loading: false,
      error: error.message || 'Error inesperado en el carrito'
    };
  }
};

// Context
const CartContext = createContext(null);

// Provider mejorado
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Cargar carrito desde memoria (simula localStorage)
  useEffect(() => {
    // En un entorno real, aquí cargarías desde localStorage
    // Para este ejemplo, inicializamos vacío
    const loadInitialCart = async () => {
      try {
        dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
        
        // Simular carga desde storage
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // En producción: const savedCart = localStorage.getItem(CART_CONFIG.STORAGE_KEY);
        // if (savedCart) {
        //   const parsedCart = JSON.parse(savedCart);
        //   dispatch({ type: CART_ACTIONS.LOAD_CART, payload: parsedCart });
        // }
        
        dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false });
      } catch (error) {
        dispatch({ type: CART_ACTIONS.SET_ERROR, payload: 'Error al cargar el carrito' });
      }
    };

    loadInitialCart();
  }, []);

  // Auto-guardar con debounce
  useEffect(() => {
    if (state.items.length === 0 && !state.lastUpdated) return;

    const timeoutId = setTimeout(() => {
      try {
        // En producción: localStorage.setItem(CART_CONFIG.STORAGE_KEY, JSON.stringify(state.items));
        console.log('Carrito guardado:', state.items);
      } catch (error) {
        console.error('Error al guardar carrito:', error);
      }
    }, CART_CONFIG.AUTO_SAVE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [state.items, state.lastUpdated]);

  // Acciones memoizadas para mejor performance
  const addToCart = useCallback((product, quantity = 1, options = {}) => {
    dispatch({
      type: CART_ACTIONS.ADD_TO_CART,
      payload: { product, quantity, options }
    });
  }, []);

  const removeFromCart = useCallback((id, options = {}) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_FROM_CART,
      payload: { id, options }
    });
  }, []);

  const updateQuantity = useCallback((id, quantity, options = {}) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { id, quantity, options }
    });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
  }, []);

  const applyDiscount = useCallback((discountCode, percentage, amount) => {
    dispatch({
      type: CART_ACTIONS.APPLY_DISCOUNT,
      payload: { code: discountCode, percentage, amount }
    });
  }, []);

  const removeDiscount = useCallback(() => {
    dispatch({ type: CART_ACTIONS.REMOVE_DISCOUNT });
  }, []);

  const updateItemDetails = useCallback((id, updates) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_ITEM_DETAILS,
      payload: { id, updates }
    });
  }, []);

  // Utilidades computadas memoizadas
  const cartStats = useMemo(() => {
    const subtotal = state.items.reduce((total, item) => 
      total + (item.precio * item.quantity), 0
    );
    
    const totalItems = state.items.reduce((total, item) => 
      total + item.quantity, 0
    );

    let discountAmount = 0;
    if (state.discount) {
      if (state.discount.percentage) {
        discountAmount = subtotal * (state.discount.percentage / 100);
      } else if (state.discount.amount) {
        discountAmount = state.discount.amount;
      }
    }

    const total = Math.max(0, subtotal - discountAmount);

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      total: Math.round(total * 100) / 100,
      totalItems,
      uniqueItems: state.items.length,
      isEmpty: state.items.length === 0,
      hasDiscount: !!state.discount
    };
  }, [state.items, state.discount]);

  const getItemInCart = useCallback((id, options = {}) => {
    const itemKey = `${id}_${JSON.stringify(options)}`;
    return state.items.find(item => 
      `${item.id}_${JSON.stringify(item.options)}` === itemKey
    );
  }, [state.items]);

  const isItemInCart = useCallback((id, options = {}) => {
    return !!getItemInCart(id, options);
  }, [getItemInCart]);

  const getItemQuantity = useCallback((id, options = {}) => {
    const item = getItemInCart(id, options);
    return item ? item.quantity : 0;
  }, [getItemInCart]);

  const canAddToCart = useCallback((product, quantity = 1) => {
    if (state.items.length >= CART_CONFIG.MAX_ITEMS_IN_CART) {
      return { canAdd: false, reason: 'Carrito lleno' };
    }
    
    const currentQuantity = getItemQuantity(product.id);
    const totalQuantity = currentQuantity + quantity;
    
    if (totalQuantity > (product.stock || 0)) {
      return { canAdd: false, reason: 'Stock insuficiente' };
    }
    
    if (totalQuantity > CART_CONFIG.MAX_QUANTITY_PER_ITEM) {
      return { canAdd: false, reason: 'Cantidad máxima excedida' };
    }
    
    return { canAdd: true };
  }, [state.items.length, getItemQuantity]);

  // Función para sincronizar con productos actualizados desde la API
  const syncWithProducts = useCallback((products) => {
    products.forEach(product => {
      const cartItem = getItemInCart(product.id);
      if (cartItem) {
        const updates = {};
        
        // Actualizar precio si cambió
        if (cartItem.precio !== parseFloat(product.precio)) {
          updates.precio = parseFloat(product.precio);
        }
        
        // Actualizar stock
        if (cartItem.stock !== product.stock) {
          updates.stock = product.stock;
        }
        
        // Ajustar cantidad si excede el stock disponible
        if (cartItem.quantity > product.stock) {
          updates.quantity = Math.max(1, product.stock);
        }
        
        if (Object.keys(updates).length > 0) {
          updateItemDetails(product.id, updates);
        }
      }
    });
  }, [getItemInCart, updateItemDetails]);

  // Funciones de compatibilidad hacia atrás
  const getCartTotal = useCallback(() => {
    return cartStats.total;
  }, [cartStats.total]);

  const getCartItemsCount = useCallback(() => {
    return cartStats.totalItems;
  }, [cartStats.totalItems]);

  // Valor del contexto memoizado
  const contextValue = useMemo(() => ({
    // Estado
    items: state.items,
    loading: state.loading,
    error: state.error,
    discount: state.discount,
    lastUpdated: state.lastUpdated,
    
    // Estadísticas (nueva API recomendada)
    ...cartStats,
    
    // Funciones de compatibilidad (API anterior)
    getCartTotal,
    getCartItemsCount,
    
    // Acciones principales
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    clearError,
    
    // Descuentos
    applyDiscount,
    removeDiscount,
    
    // Utilidades
    getItemInCart,
    isItemInCart,
    getItemQuantity,
    canAddToCart,
    syncWithProducts,
    updateItemDetails
  }), [
    state,
    cartStats,
    getCartTotal,
    getCartItemsCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    clearError,
    applyDiscount,
    removeDiscount,
    getItemInCart,
    isItemInCart,
    getItemQuantity,
    canAddToCart,
    syncWithProducts,
    updateItemDetails
  ]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Hook personalizado mejorado
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de CartProvider');
  }
  return context;
};

// Hook adicional para usar solo estadísticas (evita re-renders innecesarios)
export const useCartStats = () => {
  const { subtotal, discountAmount, total, totalItems, uniqueItems, isEmpty, hasDiscount } = useCart();
  return { subtotal, discountAmount, total, totalItems, uniqueItems, isEmpty, hasDiscount };
};

// Hook para verificar si un producto específico está en el carrito
export const useCartItem = (productId, options = {}) => {
  const { getItemInCart, isItemInCart, getItemQuantity } = useCart();
  
  return useMemo(() => ({
    item: getItemInCart(productId, options),
    isInCart: isItemInCart(productId, options),
    quantity: getItemQuantity(productId, options)
  }), [getItemInCart, isItemInCart, getItemQuantity, productId, options]);
};