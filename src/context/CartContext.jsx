import { createContext, useContext, useEffect, useReducer } from 'react';

const CartContext = createContext(null);
const KEY = 'pharmacy-cart-v1';

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { product, qty = 1 } = action;
      const max = product.stock_qty ?? 50;
      const existing = state.find(i => i.id === product.id);
      if (existing) return state.map(i => i.id === product.id ? { ...i, stock_qty: max, qty: Math.min(i.qty + qty, max) } : i);
      return [...state, {
        id: product.id, name: product.name, price: Number(product.price), image_url: product.image_url,
        requires_prescription: product.requires_prescription, stock_qty: max, qty: Math.min(qty, max),
      }];
    }
    case 'REMOVE': return state.filter(i => i.id !== action.id);
    case 'UPDATE_QTY': return state.map(i => i.id === action.id ? { ...i, qty: Math.max(1, Math.min(action.qty, i.stock_qty ?? 50)) } : i);
    case 'SYNC': {
      // refresh price / stock / availability from the database; drop products that were removed
      const fresh = new Map(action.products.map(p => [p.id, p]));
      return state.filter(i => fresh.has(i.id)).map(i => {
        const p = fresh.get(i.id);
        return { ...i, name: p.name, price: Number(p.price), image_url: p.image_url, requires_prescription: p.requires_prescription,
          stock_qty: p.stock_qty, qty: Math.max(1, Math.min(i.qty, p.stock_qty || 1)) };
      }).filter(i => fresh.get(i.id).stock_qty > 0);
    }
    case 'CLEAR': return [];
    default: return state;
  }
}

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, undefined, load);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch { /* private mode */ } }, [cart]);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const hasRx = cart.some(i => i.requires_prescription);
  return (
    <CartContext.Provider value={{ cart, dispatch, total, count, hasRx }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
