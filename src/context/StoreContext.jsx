import { createContext, useContext, useReducer, useEffect } from 'react';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import * as ordersApi from '../api/orders';
import * as productsApi from '../api/products';

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

const initialState = {
  // Show seed products instantly, then replace with shared Supabase catalog
  products: INITIAL_PRODUCTS,
  productsLoading: true,
  cart: load('coorg_cart', []),
  orders: [],
  ordersLoading: false,
  lastOrderId: null,
  toasts: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload, productsLoading: false };
    case 'SET_PRODUCTS_LOADING':
      return { ...state, productsLoading: action.payload };
    case 'UPSERT_PRODUCT': {
      const exists = state.products.some((p) => p.id === action.payload.id);
      const products = exists
        ? state.products.map((p) => (p.id === action.payload.id ? action.payload : p))
        : [...state.products, action.payload];
      return { ...state, products };
    }
    case 'REMOVE_PRODUCT':
      return { ...state, products: state.products.filter((p) => p.id !== action.payload) };

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

    case 'SET_ORDERS_LOADING':
      return { ...state, ordersLoading: action.payload };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload, ordersLoading: false };
    case 'ADD_ORDER':
      return { ...state, orders: [action.payload, ...state.orders], lastOrderId: action.payload.id };
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map(o => o.id === action.payload.id ? action.payload : o),
      };
    case 'REMOVE_ORDER':
      return { ...state, orders: state.orders.filter(o => o.id !== action.payload) };

    case 'ADD_TOAST': {
      const toast = { id: Date.now(), ...action.payload };
      return { ...state, toasts: [...state.toasts, toast] };
    }
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };

    default:
      return state;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const toast = (message, type = 'success') => {
    const id = Date.now();
    dispatch({ type: 'ADD_TOAST', payload: { message, type, id } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), 3200);
  };

  const getAdminToken = () => {
    try {
      const raw = localStorage.getItem('coorg_admin_session');
      if (!raw) return null;
      const { token, expiresAt } = JSON.parse(raw);
      if (!token || Date.now() > expiresAt) return null;
      return token;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const products = await productsApi.fetchProducts();
        if (!cancelled) dispatch({ type: 'SET_PRODUCTS', payload: products });
      } catch {
        if (!cancelled) {
          dispatch({ type: 'SET_PRODUCTS', payload: INITIAL_PRODUCTS });
          toast('Could not load shared products. Showing local catalog.', 'error');
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const actions = {
    fetchProducts: async () => {
      dispatch({ type: 'SET_PRODUCTS_LOADING', payload: true });
      try {
        const products = await productsApi.fetchProducts();
        dispatch({ type: 'SET_PRODUCTS', payload: products });
      } catch {
        dispatch({ type: 'SET_PRODUCTS_LOADING', payload: false });
        toast('Could not load products', 'error');
      }
    },

    addProduct: async (p) => {
      const token = getAdminToken();
      if (!token) throw new Error('Admin login required');
      const product = await productsApi.createProduct(p, token);
      dispatch({ type: 'UPSERT_PRODUCT', payload: product });
      return product;
    },

    updateProduct: async (p) => {
      const token = getAdminToken();
      if (!token) throw new Error('Admin login required');
      const product = await productsApi.updateProduct(p, token);
      dispatch({ type: 'UPSERT_PRODUCT', payload: product });
      return product;
    },

    deleteProduct: async (id) => {
      const token = getAdminToken();
      if (!token) throw new Error('Admin login required');
      await productsApi.deleteProduct(id, token);
      dispatch({ type: 'REMOVE_PRODUCT', payload: id });
    },

    toggleAvailability: async (id) => {
      const token = getAdminToken();
      if (!token) throw new Error('Admin login required');
      const product = await productsApi.toggleProductAvailability(id, token);
      dispatch({ type: 'UPSERT_PRODUCT', payload: product });
      return product;
    },

    addToCart: (productId, qty = 1) => dispatch({ type: 'ADD_TO_CART', payload: { productId, qty } }),
    updateCartQty: (productId, qty) => dispatch({ type: 'UPDATE_CART_QTY', payload: { productId, qty } }),
    removeFromCart: (productId) => dispatch({ type: 'REMOVE_FROM_CART', payload: productId }),
    clearCart: () => dispatch({ type: 'CLEAR_CART' }),

    fetchOrders: async (token) => {
      dispatch({ type: 'SET_ORDERS_LOADING', payload: true });
      try {
        const orders = await ordersApi.fetchOrders(token);
        dispatch({ type: 'SET_ORDERS', payload: orders });
      } catch {
        dispatch({ type: 'SET_ORDERS', payload: [] });
        toast('Could not load orders. Is the server running?', 'error');
      }
    },

    placeOrder: async (orderData) => {
      const order = await ordersApi.createOrder(orderData);
      dispatch({ type: 'ADD_ORDER', payload: order });
      dispatch({ type: 'CLEAR_CART' });
      return order;
    },

    updateOrderStatus: async (id, status, token) => {
      const updated = await ordersApi.updateOrderStatus(id, status, token);
      dispatch({ type: 'UPDATE_ORDER', payload: updated });
      return updated;
    },

    deleteOrder: async (id, token) => {
      await ordersApi.deleteOrder(id, token);
      dispatch({ type: 'REMOVE_ORDER', payload: id });
    },

    toast,
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
