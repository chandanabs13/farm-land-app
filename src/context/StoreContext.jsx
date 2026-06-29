import { createContext, useContext, useReducer, useEffect } from 'react';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

// ─── helpers ────────────────────────────────────────────────────────────────
const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const save = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};

// ─── initial state ───────────────────────────────────────────────────────────
const initialState = {
  products: load('coorg_products', INITIAL_PRODUCTS),
  cart: load('coorg_cart', []),
  orders: load('coorg_orders', []),
  toasts: [],
};

// ─── reducer ─────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    // PRODUCTS
    case 'ADD_PRODUCT': {
      const products = [...state.products, { ...action.payload, id: Date.now().toString(), createdAt: new Date().toISOString() }];
      save('coorg_products', products);
      return { ...state, products };
    }
    case 'UPDATE_PRODUCT': {
      const products = state.products.map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p);
      save('coorg_products', products);
      return { ...state, products };
    }
    case 'DELETE_PRODUCT': {
      const products = state.products.filter(p => p.id !== action.payload);
      save('coorg_products', products);
      return { ...state, products };
    }
    case 'TOGGLE_AVAILABILITY': {
      const products = state.products.map(p => p.id === action.payload ? { ...p, available: !p.available } : p);
      save('coorg_products', products);
      return { ...state, products };
    }

    // CART
    case 'ADD_TO_CART': {
      const existing = state.cart.find(i => i.productId === action.payload.productId);
      const cart = existing
        ? state.cart.map(i => i.productId === action.payload.productId ? { ...i, qty: i.qty + action.payload.qty } : i)
        : [...state.cart, action.payload];
      save('coorg_cart', cart);
      return { ...state, cart };
    }
    case 'UPDATE_CART_QTY': {
      const cart = action.payload.qty < 1
        ? state.cart.filter(i => i.productId !== action.payload.productId)
        : state.cart.map(i => i.productId === action.payload.productId ? { ...i, qty: action.payload.qty } : i);
      save('coorg_cart', cart);
      return { ...state, cart };
    }
    case 'REMOVE_FROM_CART': {
      const cart = state.cart.filter(i => i.productId !== action.payload);
      save('coorg_cart', cart);
      return { ...state, cart };
    }
    case 'CLEAR_CART': {
      save('coorg_cart', []);
      return { ...state, cart: [] };
    }

    // ORDERS
    case 'PLACE_ORDER': {
      const order = {
        ...action.payload,
        id: `ORD-${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      const orders = [order, ...state.orders];
      save('coorg_orders', orders);
      return { ...state, orders, cart: [], lastOrderId: order.id };
    }
    case 'UPDATE_ORDER_STATUS': {
      const orders = state.orders.map(o => o.id === action.payload.id ? { ...o, status: action.payload.status } : o);
      save('coorg_orders', orders);
      return { ...state, orders };
    }

    // TOASTS
    case 'ADD_TOAST': {
      const toast = { id: Date.now(), ...action.payload };
      return { ...state, toasts: [...state.toasts, toast] };
    }
    case 'REMOVE_TOAST': {
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
    }

    case 'SET_LAST_ORDER_ID':
      return { ...state, lastOrderId: action.payload };

    default:
      return state;
  }
}

// ─── context ─────────────────────────────────────────────────────────────────
const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = {
    addProduct: (p) => dispatch({ type: 'ADD_PRODUCT', payload: p }),
    updateProduct: (p) => dispatch({ type: 'UPDATE_PRODUCT', payload: p }),
    deleteProduct: (id) => dispatch({ type: 'DELETE_PRODUCT', payload: id }),
    toggleAvailability: (id) => dispatch({ type: 'TOGGLE_AVAILABILITY', payload: id }),

    addToCart: (productId, qty = 1) => dispatch({ type: 'ADD_TO_CART', payload: { productId, qty } }),
    updateCartQty: (productId, qty) => dispatch({ type: 'UPDATE_CART_QTY', payload: { productId, qty } }),
    removeFromCart: (productId) => dispatch({ type: 'REMOVE_FROM_CART', payload: productId }),
    clearCart: () => dispatch({ type: 'CLEAR_CART' }),

    placeOrder: (orderData) => dispatch({ type: 'PLACE_ORDER', payload: orderData }),
    updateOrderStatus: (id, status) => dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { id, status } }),

    toast: (message, type = 'success') => {
      const id = Date.now();
      dispatch({ type: 'ADD_TOAST', payload: { message, type, id } });
      setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), 3200);
    },
  };

  const computed = {
    cartCount: state.cart.reduce((s, i) => s + i.qty, 0),
    cartTotal: state.cart.reduce((s, i) => {
      const product = state.products.find(p => p.id === i.productId);
      return s + (product ? product.pricePerKg * i.qty : 0);
    }, 0),
    availableProducts: state.products.filter(p => p.available),
    featuredProducts: state.products.filter(p => p.available && p.featured),
  };

  return (
    <StoreContext.Provider value={{ state, actions, computed }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
