import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: number;
  product_id: number;
  name: string;
  slug: string;
  quantity: number;
  unit_price: number;
  image?: string;
  sku: string;
}

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { product_id: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { product_id: number; quantity: number } }
  | { type: 'CLEAR' }
  | { type: 'SET_CART'; payload: CartItem[] };

const initialState: CartState = { items: [], total: 0 };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.product_id === action.payload.product_id);
      let newItems;
      if (existing) {
        newItems = state.items.map(i =>
          i.product_id === action.payload.product_id
            ? { ...i, quantity: i.quantity + action.payload.quantity }
            : i
        );
      } else {
        newItems = [...state.items, action.payload];
      }
      const total = newItems.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
      return { items: newItems, total };
    }
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(i => i.product_id !== action.payload.product_id);
      const total = newItems.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
      return { items: newItems, total };
    }
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { product_id: action.payload.product_id } });
      }
      const newItems = state.items.map(i =>
        i.product_id === action.payload.product_id
          ? { ...i, quantity: action.payload.quantity }
          : i
      );
      const total = newItems.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
      return { items: newItems, total };
    }
    case 'CLEAR':
      return { items: [], total: 0 };
    case 'SET_CART':
      const total = action.payload.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
      return { items: action.payload, total };
    default:
      return state;
  }
};

interface CartContextValue {
  state: CartState;
  addItem: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeItem: (product_id: number) => Promise<void>;
  updateQuantity: (product_id: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user } = useAuth();

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        const items = JSON.parse(saved);
        dispatch({ type: 'SET_CART', payload: items });
      } catch (e) {}
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

  // If user logs in, merge guest cart with server cart
  useEffect(() => {
    if (user) {
      syncCart();
    }
  }, [user]);

  const syncCart = async () => {
    if (!user) return;
    // Fetch server cart (assuming we have a /cart endpoint)
    // For now, we'll just keep local; we'll implement server sync later.
    // This is a placeholder; we'll use Supabase directly.
    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('customer_id', user.id);
    if (error) {
      console.error('Error fetching cart:', error);
      return;
    }
    if (data && data.length > 0) {
      // Merge with local: if local has items, we might want to add server items
      // or replace. For simplicity, we'll replace with server cart.
      // But we need to map to CartItem format.
      const serverItems = data.map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        name: item.product_name,
        slug: item.product_slug,
        quantity: item.quantity,
        unit_price: item.unit_price,
        image: item.image_url,
        sku: item.sku,
      }));
      // Merge: local items take precedence (we'll add server items not in local)
      const localProductIds = new Set(state.items.map(i => i.product_id));
      const merged = [...state.items];
      for (const sItem of serverItems) {
        if (!localProductIds.has(sItem.product_id)) {
          merged.push(sItem);
        }
      }
      dispatch({ type: 'SET_CART', payload: merged });
    }
  };

  const addItem = async (item: Omit<CartItem, 'id'>) => {
    dispatch({ type: 'ADD_ITEM', payload: { ...item, id: Date.now() } });
    if (user) {
      // Also save to server
      await supabase.from('cart_items').insert({
        customer_id: user.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        product_name: item.name,
        product_slug: item.slug,
        image_url: item.image,
        sku: item.sku,
      });
    }
  };

  const removeItem = async (product_id: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { product_id } });
    if (user) {
      await supabase.from('cart_items').delete().eq('customer_id', user.id).eq('product_id', product_id);
    }
  };

  const updateQuantity = async (product_id: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { product_id, quantity } });
    if (user) {
      await supabase.from('cart_items').update({ quantity }).eq('customer_id', user.id).eq('product_id', product_id);
    }
  };

  const clearCart = async () => {
    dispatch({ type: 'CLEAR' });
    if (user) {
      await supabase.from('cart_items').delete().eq('customer_id', user.id);
    }
  };

  return (
    <CartContext.Provider value={{ state, addItem, removeItem, updateQuantity, clearCart, syncCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
